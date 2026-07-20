import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { rangeOverlaps } from "@/lib/availability";
import { isRoomId } from "@/lib/rooms";
import { computeStayTotal } from "@/lib/pricing";
import type { BlockedRange } from "@/lib/types";

export const dynamic = "force-dynamic";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * POST /api/bookings
 *
 * Crée une réservation directe en statut 'pending' pour la chambre
 * demandée, après avoir revérifié côté serveur que la plage est libre
 * pour CETTE chambre précise (réservations locales ET blocs Booking.com
 * scopés par room_id). Le prix est recalculé côté serveur (jamais
 * confiance dans un total envoyé par le client).
 *
 * TODO (itération suivante) : notifications Resend + Telegram,
 * confirmation admin.
 */
export async function POST(request: Request) {
  let body: {
    room_id?: string;
    guest_name?: string;
    guest_email?: string;
    guest_phone?: string;
    check_in?: string;
    check_out?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const { room_id, guest_name, guest_email, guest_phone, check_in, check_out } = body;

  if (!isRoomId(room_id)) {
    return NextResponse.json(
      { error: "Chambre invalide (rive-gauche | rive-droite)" },
      { status: 400 }
    );
  }
  if (!guest_name?.trim() || !guest_email?.trim() || !guest_phone?.trim()) {
    return NextResponse.json(
      { error: "Nom, email et téléphone sont requis" },
      { status: 400 }
    );
  }
  if (
    !check_in ||
    !check_out ||
    !DATE_RE.test(check_in) ||
    !DATE_RE.test(check_out) ||
    check_out <= check_in
  ) {
    return NextResponse.json(
      { error: "Dates invalides (check_out doit être après check_in)" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  // Revérification serveur de la disponibilité, scopée à cette chambre
  const [local, synced] = await Promise.all([
    supabase
      .from("room_bookings")
      .select("check_in, check_out")
      .eq("room_id", room_id)
      .in("status", ["pending", "confirmed"]),
    supabase
      .from("synced_bookings")
      .select("check_in, check_out")
      .eq("room_id", room_id),
  ]);

  if (local.error || synced.error) {
    return NextResponse.json(
      { error: local.error?.message ?? synced.error?.message },
      { status: 500 }
    );
  }

  const blocked: BlockedRange[] = [
    ...(local.data ?? []).map((r) => ({ ...r, source: "direct" as const })),
    ...(synced.data ?? []).map((r) => ({ ...r, source: "sync" as const })),
  ];

  if (rangeOverlaps(check_in, check_out, blocked)) {
    return NextResponse.json(
      { error: "Ces dates ne sont plus disponibles" },
      { status: 409 }
    );
  }

  const { total } = computeStayTotal(room_id, check_in, check_out);

  const { data, error } = await supabase
    .from("room_bookings")
    .insert({
      room_id,
      guest_name: guest_name.trim(),
      guest_email: guest_email.trim(),
      guest_phone: guest_phone.trim(),
      check_in,
      check_out,
      total_price: total,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id, total_price: total }, { status: 201 });
}
