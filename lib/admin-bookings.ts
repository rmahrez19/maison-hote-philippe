import { getSupabaseAdmin } from "./supabase-server";
import { computeStayTotal } from "./pricing";
import type { RoomId } from "./rooms";
import type { BookingStatus } from "./types";

export type BookingSource = "direct" | "booking.com";

/**
 * Réservation unifiée pour le registre admin : soit une réservation
 * directe (room_bookings, prix réel), soit un séjour Booking.com
 * importé par iCal (synced_bookings, prix estimé côté serveur — le
 * protocole iCal ne transmet jamais le montant payé). Les blocages
 * manuels (synced_bookings, source='manual') n'ont pas de client
 * associé et n'apparaissent donc pas ici — seulement dans la frise
 * d'occupation, voir `getManualBlocks`.
 */
export interface UnifiedBooking {
  id: string;
  source: BookingSource;
  room_id: RoomId;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  check_in: string;
  check_out: string;
  nights: number;
  total_price: number;
  price_estimated: boolean;
  status: BookingStatus | null;
  reference_date: string; // created_at (direct) ou synced_at (booking.com), pour le tri "date"
}

export interface ManualBlockRange {
  id: string;
  room_id: RoomId;
  check_in: string;
  check_out: string;
}

/**
 * Fusionne réservations directes et séjours Booking.com pour le
 * registre admin, et renvoie séparément les blocages manuels (utiles
 * seulement à la frise d'occupation et au panneau de blocage, pas au
 * registre puisqu'ils n'ont pas de client).
 */
export async function getAdminOccupancy(): Promise<{
  bookings: UnifiedBooking[];
  manualBlocks: ManualBlockRange[];
}> {
  const supabase = getSupabaseAdmin();

  const [directRes, syncedRes] = await Promise.all([
    supabase
      .from("room_bookings")
      .select(
        "id, room_id, guest_name, guest_email, guest_phone, check_in, check_out, total_price, status, created_at"
      ),
    supabase
      .from("synced_bookings")
      .select("id, room_id, check_in, check_out, source, synced_at"),
  ]);

  const direct: UnifiedBooking[] = (directRes.data ?? []).map((b) => ({
    id: b.id,
    source: "direct",
    room_id: b.room_id as RoomId,
    guest_name: b.guest_name,
    guest_email: b.guest_email,
    guest_phone: b.guest_phone,
    check_in: b.check_in,
    check_out: b.check_out,
    nights: computeStayTotal(b.room_id as RoomId, b.check_in, b.check_out).nights,
    total_price: b.total_price ?? 0,
    price_estimated: false,
    status: b.status as BookingStatus,
    reference_date: b.created_at,
  }));

  const manualBlocks: ManualBlockRange[] = [];
  const bookingComLines: UnifiedBooking[] = [];

  for (const row of syncedRes.data ?? []) {
    const roomId = row.room_id as RoomId;
    if (row.source === "manual") {
      manualBlocks.push({
        id: row.id,
        room_id: roomId,
        check_in: row.check_in,
        check_out: row.check_out,
      });
      continue;
    }

    const { nights, total } = computeStayTotal(roomId, row.check_in, row.check_out);
    bookingComLines.push({
      id: row.id,
      source: "booking.com",
      room_id: roomId,
      guest_name: null,
      guest_email: null,
      guest_phone: null,
      check_in: row.check_in,
      check_out: row.check_out,
      nights,
      total_price: total,
      price_estimated: true,
      status: null,
      reference_date: row.synced_at,
    });
  }

  return { bookings: [...direct, ...bookingComLines], manualBlocks };
}
