# Megalight II — Réservation directe

Site de réservation directe pour la maison flottante « Megalight II » de
Captain Philippe (16 rue de Saint-Cloud, Parc Nautique de l'Île de Monsieur,
92310 Sèvres), avec deux chambres listées séparément sur Booking.com et
synchronisées chacune via son propre flux iCal. Outil confidentiel destiné
aux clients existants : `noindex`, aucun artifice commercial.

**Les deux chambres** (source unique : `lib/rooms.ts`) — tarif fixe de
150 € la nuit, quel que soit le jour de la semaine :

| Chambre | Équipement | Tarif |
|---|---|---|
| Rive Gauche | Lit double 160, sdb partagée | 150 € / nuit |
| Rive Droite | Lit King Size 180, sdb privée | 150 € / nuit |

**Direction artistique « Seine Nocturne »** (inspirée de lesbordsdemer.com) :
fond `#070b0e`, duo Cormorant Garamond (titres) / JetBrains Mono (dates,
coordonnées, prix), accents ambrés `amber-200/60`, filets fins
`border-slate-800`. Composants clés : `SmartHeader` (masqué à la descente,
réaffiché au moindre pixel de remontée), `HorizonGallery` (molette verticale
détournée en défilement horizontal, relâchée en butée), `RoomSelector`
(étape 1 du tunnel, cartes magazine), `DateRangeCalendar` (tarif affiché sous
chaque jour disponible) et `WaveIndicator` (disponibilité signalée par des
ronds dans l'eau, pas de pastille rouge/vert).

**Stack** : Next.js (App Router) · Tailwind CSS · Supabase (PostgreSQL + Auth
MFA) · Vercel · node-ical. Resend + Telegram prévus pour l'itération suivante.

## Mise en route

1. **Base de données** : exécuter `supabase/schema.sql` dans le SQL Editor de
   Supabase (tables `room_bookings`, `synced_bookings`, `sync_status`,
   chacune avec RLS activé — le site passe exclusivement par la clé
   `service_role` côté serveur). Le script est idempotent : il peut être
   rejoué sans risque sur une base déjà initialisée.
2. **Environnement** : copier `.env.example` vers `.env.local` et remplir
   `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `BOOKING_ICAL_URL_RIVE_GAUCHE`,
   `BOOKING_ICAL_URL_RIVE_DROITE`.
3. **Comptes admin** : dans le dashboard Supabase → Authentication → Users →
   *Add user*, créer les deux comptes autorisés (email confirmé
   manuellement) : `rmahrez343@gmail.com` et `philippeaudoin@gmail.com` (voir
   `lib/admin-auth.ts`). Aucune inscription libre n'est possible : ce sont
   les deux seules adresses acceptées par `/admin/login`.
4. **Lancer** : `pnpm install` puis `pnpm dev`. Première connexion sur
   `/admin/login` → redirection automatique vers `/admin/setup-2fa` pour
   scanner le QR code avec Google Authenticator/Authy.

## Pages

| Route | Rôle |
|---|---|
| `/` | Accueil : hero, galerie horizontale, chambres, infos pratiques, teaser vers `/book` |
| `/book` | Tunnel de réservation : étape 1 choix de la chambre (`RoomSelector`), étape 2 calendrier tarifé + formulaire |
| `/admin/login` | Connexion email + mot de passe (allowlist stricte, message d'erreur générique) |
| `/admin/setup-2fa` | Première connexion : génération et validation du facteur TOTP |
| `/admin/challenge` | Connexions suivantes : saisie du code à 6 chiffres |
| `/admin` | Tableau de bord (aal2 requis) : statut de synchro par chambre, registre des réservations directes, blocage manuel de dates |

## Authentification admin (mot de passe + TOTP obligatoire)

`proxy.ts` (le fichier `middleware` a été renommé `proxy` par Next.js 16)
protège tout `/admin/*` selon le niveau d'assurance d'authentification (AAL)
Supabase :

- Pas de session → `/admin/login`
- Session mais aucun facteur TOTP enrôlé (`nextLevel === 'aal1'`) →
  `/admin/setup-2fa`
- Facteur enrôlé mais pas encore validé cette session
  (`nextLevel === 'aal2'` et `currentLevel !== 'aal2'`) → `/admin/challenge`
- `aal2` pleinement atteint → accès au tableau de bord

`/admin/login` rejette toute adresse hors de `ALLOWED_ADMIN_EMAILS`
(`lib/admin-auth.ts`) **avant** d'appeler Supabase, avec le même message
générique qu'un mauvais mot de passe — impossible de deviner par essais
successifs quelles adresses sont légitimes. `/app/admin/page.tsx` revérifie
lui-même l'aal2 côté serveur (défense en profondeur, indépendante du proxy).

Deux clients Supabase distincts coexistent : `getSupabaseAuthServer()`
(`lib/supabase-auth-server.ts`, clé publique + cookies de session) pour tout
ce qui touche à l'identité, et `getSupabaseAdmin()` (`lib/supabase-server.ts`,
clé `service_role`) pour les données métier — jamais mélangés.

## Synchronisation iCal (multi-flux)

Chaque chambre a sa propre annonce Booking.com, donc son propre flux iCal.

- **Export (notre site → Booking.com)** : `GET /api/calendar/export?room=rive-gauche`
  (ou `rive-droite`) génère un flux RFC 5545 des réservations `confirmed` de
  cette chambre. Coller l'URL correspondante dans l'extranet Booking de
  chaque annonce (Calendrier → Importer un calendrier).
- **Import (Booking.com → notre site)** : `POST /api/calendar/sync` télécharge
  en parallèle `BOOKING_ICAL_URL_RIVE_GAUCHE` et `BOOKING_ICAL_URL_RIVE_DROITE`,
  parse chaque flux avec node-ical et upsert les blocs dans `synced_bookings`
  (clé : `room_id` + UID iCal). Les blocs disparus du flux de leur chambre
  sont purgés sans toucher à l'autre chambre. Une chambre non configurée ou
  en échec n'empêche pas la synchro de l'autre (réponse 207 en cas de succès
  partiel). Un cron Vercel (`vercel.json`) l'appelle toutes les heures ; le
  bouton « Forcer la synchronisation » de l'admin le déclenche à la demande.

## Logique de disponibilité et tarification

Une date `D` est indisponible **pour une chambre donnée** si elle appartient
à un intervalle `[check_in, check_out[` d'une réservation directe (`pending`
ou `confirmed`) ou d'un bloc importé, de cette même chambre. Le jour du
check-out reste réservable. La règle est implémentée dans
`lib/availability.ts` et revérifiée côté serveur à la création d'une
réservation (`POST /api/bookings`, refus 409 en cas de chevauchement, scopé
par `room_id`).

Le tarif est fixe (150 € / nuit, identique pour les deux chambres, quel que
soit le jour de la semaine) — voir `lib/pricing.ts`. Le calendrier de
réservation affiche ce tarif sous chaque jour disponible, et le récapitulatif
financier (nuits × tarif = total) est calculé en direct côté client puis
**recalculé côté serveur** à la soumission — le total envoyé par le
navigateur n'est jamais utilisé tel quel.

## À faire (itérations suivantes)

- Notifications Resend (client + Philippe) et Telegram à la réservation
- Confirmation / annulation des réservations depuis l'admin
- Vraies photos par chambre (actuellement `chambre-1.jpg` / `chambre-2.jpg`)
