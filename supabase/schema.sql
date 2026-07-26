-- ============================================================
-- Megalight II — Script d'initialisation Supabase (PostgreSQL)
-- À exécuter dans le SQL Editor de Supabase.
-- Idempotent : peut être rejoué sans risque sur une base déjà
-- initialisée (CREATE ... IF NOT EXISTS partout, ALTER en complément).
-- ============================================================

-- Extension pour gen_random_uuid (déjà active par défaut sur Supabase)
create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- Réservations directes (faites sur notre site)
-- ------------------------------------------------------------
create table if not exists public.room_bookings (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  guest_email text not null,
  guest_phone text not null,
  check_in date not null,
  check_out date not null,
  total_price numeric(10, 2),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now(),

  constraint room_bookings_dates_valid check (check_out > check_in)
);

create index if not exists room_bookings_status_idx
  on public.room_bookings (status);

create index if not exists room_bookings_dates_idx
  on public.room_bookings (check_in, check_out);

-- ------------------------------------------------------------
-- Blocs importés depuis les plateformes externes (iCal)
-- ------------------------------------------------------------
create table if not exists public.synced_bookings (
  id uuid primary key default gen_random_uuid(),
  external_id text not null,
  check_in date not null,
  check_out date not null,
  source text not null default 'booking.com',
  synced_at timestamptz not null default now(),

  constraint synced_bookings_dates_valid check (check_out > check_in)
);

create index if not exists synced_bookings_dates_idx
  on public.synced_bookings (check_in, check_out);

-- ------------------------------------------------------------
-- Multi-chambres : chaque chambre (Rive Gauche / Rive Droite) est
-- listée séparément sur Booking.com, avec son propre flux iCal et
-- sa propre tarification. On rattache donc chaque réservation et
-- chaque bloc importé à une chambre via room_id.
--
-- Écrit en ALTER (et non inline dans les CREATE TABLE ci-dessus) pour
-- rester rejouable telle quelle sur une base déjà créée avant cette
-- évolution multi-chambres.
-- ------------------------------------------------------------
alter table public.room_bookings
  add column if not exists room_id text;

alter table public.synced_bookings
  add column if not exists room_id text;

-- Backfill de sécurité si d'anciennes lignes de test existent déjà
-- sans room_id (à ajuster manuellement si besoin avant mise en prod).
update public.room_bookings set room_id = 'rive-droite' where room_id is null;
update public.synced_bookings set room_id = 'rive-droite' where room_id is null;

alter table public.room_bookings
  alter column room_id set not null;
alter table public.synced_bookings
  alter column room_id set not null;

alter table public.room_bookings
  drop constraint if exists room_bookings_room_id_check;
alter table public.room_bookings
  add constraint room_bookings_room_id_check
    check (room_id in ('rive-gauche', 'rive-droite'));

alter table public.synced_bookings
  drop constraint if exists synced_bookings_room_id_check;
alter table public.synced_bookings
  add constraint synced_bookings_room_id_check
    check (room_id in ('rive-gauche', 'rive-droite'));

-- Deux flux iCal distincts peuvent en théorie réutiliser un même UID :
-- l'unicité de external_id doit donc être scopée par chambre.
alter table public.synced_bookings
  drop constraint if exists synced_bookings_external_id_key;
alter table public.synced_bookings
  drop constraint if exists synced_bookings_room_external_uidx;
alter table public.synced_bookings
  add constraint synced_bookings_room_external_uidx
    unique (room_id, external_id);

create index if not exists room_bookings_room_dates_idx
  on public.room_bookings (room_id, check_in, check_out);

create index if not exists synced_bookings_room_dates_idx
  on public.synced_bookings (room_id, check_in, check_out);

-- ------------------------------------------------------------
-- Statut de synchro iCal par chambre (pour le voyant vert/rouge de
-- l'admin). Mis à jour à CHAQUE tentative de synchro, succès ou échec
-- — contrairement à synced_bookings.synced_at, qui ne bouge pas si le
-- flux ne contient aucune réservation à importer ce jour-là.
-- ------------------------------------------------------------
create table if not exists public.sync_status (
  room_id text primary key
    check (room_id in ('rive-gauche', 'rive-droite')),
  last_synced_at timestamptz,
  last_success boolean not null default false,
  last_error text,
  updated_at timestamptz not null default now()
);

alter table public.sync_status enable row level security;

-- ------------------------------------------------------------
-- Row Level Security
-- Le site passe par la clé service_role (API routes serveur),
-- qui bypasse RLS. On active RLS sans policy publique : aucune
-- lecture/écriture possible avec la clé anon côté navigateur.
-- ------------------------------------------------------------
alter table public.room_bookings enable row level security;
alter table public.synced_bookings enable row level security;

-- ------------------------------------------------------------
-- Numérotation séquentielle des factures (obligation légale :
-- chronologique, sans trou). Un compteur par année, incrémenté de
-- façon atomique par la fonction ci-dessous (upsert + RETURNING dans
-- la même requête SQL — la seule façon fiable d'éviter une race
-- condition avec l'API PostgREST de Supabase, qui ne fait pas de
-- read-then-write atomique).
-- ------------------------------------------------------------
create table if not exists public.invoice_counters (
  year integer primary key,
  last_number integer not null default 0
);

create or replace function public.next_invoice_number(p_year integer)
returns integer
language sql
as $$
  insert into public.invoice_counters (year, last_number)
  values (p_year, 1)
  on conflict (year) do update set last_number = invoice_counters.last_number + 1
  returning last_number;
$$;

-- Une facture par réservation directe : le numéro est stable si la
-- facture est régénérée (imprimée plusieurs fois).
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique,
  number text not null unique,
  created_at timestamptz not null default now()
);

alter table public.invoice_counters enable row level security;
alter table public.invoices enable row level security;

-- ------------------------------------------------------------
-- Anti-double-réservation au niveau base de données.
--
-- Le contrôle applicatif (SELECT puis INSERT dans /api/bookings) a
-- une fenêtre de course : deux requêtes simultanées peuvent toutes
-- les deux passer le SELECT avant que l'une des deux n'ait posé son
-- INSERT. Seule une contrainte au niveau Postgres empêche ça de
-- façon garantie, quel que soit le nombre de requêtes concurrentes.
--
-- btree_gist permet d'utiliser l'égalité (room_id) dans une
-- contrainte d'exclusion GiST aux côtés d'un chevauchement de plage
-- de dates (&&). La colonne stay_range est générée automatiquement à
-- partir de check_in/check_out — jamais renseignée à la main.
-- ------------------------------------------------------------
create extension if not exists btree_gist;

alter table public.room_bookings
  add column if not exists stay_range daterange
    generated always as (daterange(check_in, check_out, '[)')) stored;

alter table public.room_bookings
  drop constraint if exists room_bookings_no_overlap;
alter table public.room_bookings
  add constraint room_bookings_no_overlap
    exclude using gist (room_id with =, stay_range with &&)
    where (status <> 'cancelled');
