import type { RoomId } from "./rooms";

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface RoomBooking {
  id: string;
  room_id: RoomId;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string; // YYYY-MM-DD
  check_out: string; // YYYY-MM-DD
  total_price: number | null;
  status: BookingStatus;
  created_at: string;
}

export interface SyncedBooking {
  id: string;
  room_id: RoomId;
  external_id: string;
  check_in: string; // YYYY-MM-DD
  check_out: string; // YYYY-MM-DD
  source: string;
  synced_at: string;
}

/** Intervalle occupé au format [check_in, check_out[, pour une chambre donnée. */
export interface BlockedRange {
  check_in: string;
  check_out: string;
  source: "direct" | "sync";
}
