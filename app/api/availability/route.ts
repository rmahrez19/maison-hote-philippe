import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { isRoomId } from "@/lib/rooms";
import type { BlockedRange } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/availability?room=rive-gauche|rive-droite
 *
 * Renvoie tous les intervalles occupés [check_in, check_out[ pour la
 * chambre demandée : réservations directes (pending + confirmed) et
 * blocs importés de Booking.com. Consommé par le calendrier de /book.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const room = searchParams.get("room");

  if (!isRoomId(room)) {
    return NextResponse.json(
      { error: "Paramètre 'room' invalide ou manquant (rive-gauche | rive-droite)" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  const [local, synced] = await Promise.all([
    supabase
      .from("room_bookings")
      .select("check_in, check_out")
      .eq("room_id", room)
      .in("status", ["pending", "confirmed"]),
    supabase
      .from("synced_bookings")
      .select("check_in, check_out")
      .eq("room_id", room),
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

  return NextResponse.json({ blocked });
}
