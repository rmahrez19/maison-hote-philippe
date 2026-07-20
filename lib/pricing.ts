import { ROOMS, type RoomId } from "./rooms";

/** Tarif de la nuitée pour une chambre — fixe, quel que soit le jour. */
export function priceForDate(roomId: RoomId): number {
  return ROOMS[roomId].price;
}

export interface StaySummary {
  nights: number;
  total: number;
}

/** Nombre de nuits × tarif fixe de la chambre. */
export function computeStayTotal(
  roomId: RoomId,
  checkIn: string,
  checkOut: string
): StaySummary {
  const nights = Math.round(
    (Date.parse(checkOut) - Date.parse(checkIn)) / 86_400_000
  );
  return { nights, total: nights * ROOMS[roomId].price };
}

export interface NightLine {
  date: string; // YYYY-MM-DD, nuit du check_in au check_out
  price: number;
}

/**
 * Détail nuit par nuit pour une facture/devis — tarif plat identique
 * chaque nuit (pas de grille semaine/week-end chez Philippe), mais
 * affiché ligne par ligne pour rester lisible et vérifiable par le
 * client.
 */
export function nightlyBreakdown(
  roomId: RoomId,
  checkIn: string,
  checkOut: string
): NightLine[] {
  const lines: NightLine[] = [];
  const cursor = new Date(checkIn + "T00:00:00");
  const end = new Date(checkOut + "T00:00:00");
  const price = ROOMS[roomId].price;

  while (cursor < end) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, "0");
    const d = String(cursor.getDate()).padStart(2, "0");
    lines.push({ date: `${y}-${m}-${d}`, price });
    cursor.setDate(cursor.getDate() + 1);
  }

  return lines;
}
