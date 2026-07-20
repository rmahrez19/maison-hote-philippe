import type { BlockedRange } from "./types";

/**
 * Une date D est indisponible si elle appartient à un intervalle
 * [check_in, check_out[ — le jour du check-out reste réservable
 * (départ le matin, arrivée le soir).
 */
export function isDateBlocked(date: string, ranges: BlockedRange[]): boolean {
  return ranges.some((r) => date >= r.check_in && date < r.check_out);
}

/**
 * Vrai si l'intervalle demandé [checkIn, checkOut[ chevauche
 * au moins un intervalle occupé.
 */
export function rangeOverlaps(
  checkIn: string,
  checkOut: string,
  ranges: BlockedRange[]
): boolean {
  return ranges.some((r) => checkIn < r.check_out && checkOut > r.check_in);
}

/** Formate une Date locale en YYYY-MM-DD. */
export function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
