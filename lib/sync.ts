import ical from "node-ical";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { toDateString } from "@/lib/availability";
import { ROOM_LIST, type RoomId } from "@/lib/rooms";

const SOURCE = "booking.com";

/** Une variable d'environnement distincte par chambre : chacune a sa
 * propre annonce, donc son propre flux iCal côté Booking.com. */
const ROOM_ICAL_ENV: Record<RoomId, string> = {
  "rive-gauche": "BOOKING_ICAL_URL_RIVE_GAUCHE",
  "rive-droite": "BOOKING_ICAL_URL_RIVE_DROITE",
};

export interface RoomSyncResult {
  room_id: RoomId;
  ok: boolean;
  synced?: number;
  error?: string;
}

/**
 * Synchronise le flux iCal d'une chambre : upsert des blocs actuels
 * (clé de dédoublonnage : room_id + external_id = UID iCal), puis
 * purge des blocs disparus du flux (annulations côté Booking.com), en
 * ne touchant jamais les blocs des autres chambres ni les blocages
 * manuels (source='manual'). Le statut de la tentative (succès ou
 * échec) est toujours consigné dans sync_status, même si le flux ne
 * contenait aucune réservation à importer — c'est ce que lit le
 * voyant vert/rouge de l'admin.
 */
async function syncRoom(roomId: RoomId): Promise<RoomSyncResult> {
  const supabase = getSupabaseAdmin();

  async function recordStatus(ok: boolean, error?: string) {
    await supabase.from("sync_status").upsert(
      {
        room_id: roomId,
        last_synced_at: new Date().toISOString(),
        last_success: ok,
        last_error: error ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "room_id" }
    );
  }

  const envVar = ROOM_ICAL_ENV[roomId];
  const icalUrl = process.env[envVar];

  if (!icalUrl) {
    const error = `${envVar} n'est pas configurée`;
    await recordStatus(false, error);
    return { room_id: roomId, ok: false, error };
  }

  let feed: string;
  try {
    const res = await fetch(icalUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    feed = await res.text();
  } catch (e) {
    const error = `Échec du téléchargement du flux iCal : ${String(e)}`;
    await recordStatus(false, error);
    return { room_id: roomId, ok: false, error };
  }

  const parsed = ical.sync.parseICS(feed);

  const rows: {
    room_id: RoomId;
    external_id: string;
    check_in: string;
    check_out: string;
    source: string;
    synced_at: string;
  }[] = [];

  for (const key of Object.keys(parsed)) {
    const ev = parsed[key];
    if (!ev || ev.type !== "VEVENT" || !ev.start || !ev.end) continue;

    rows.push({
      room_id: roomId,
      external_id: ev.uid ?? key,
      check_in: toDateString(ev.start),
      check_out: toDateString(ev.end),
      source: SOURCE,
      synced_at: new Date().toISOString(),
    });
  }

  if (rows.length > 0) {
    const { error: upsertError } = await supabase
      .from("synced_bookings")
      .upsert(rows, { onConflict: "room_id,external_id" });

    if (upsertError) {
      const error = `Échec de l'upsert : ${upsertError.message}`;
      await recordStatus(false, error);
      return { room_id: roomId, ok: false, error };
    }
  }

  // Purge des blocs Booking.com de CETTE chambre qui ne sont plus dans
  // son flux (annulations). Les blocages manuels (source='manual') ne
  // sont jamais concernés par cette requête.
  const keepIds = rows.map((r) => r.external_id);
  let deleteQuery = supabase
    .from("synced_bookings")
    .delete()
    .eq("room_id", roomId)
    .eq("source", SOURCE);
  if (keepIds.length > 0) {
    deleteQuery = deleteQuery.not(
      "external_id",
      "in",
      `(${keepIds.map((id) => `"${id.replaceAll('"', '\\"')}"`).join(",")})`
    );
  }
  const { error: deleteError } = await deleteQuery;

  if (deleteError) {
    const error = `Échec de la purge : ${deleteError.message}`;
    await recordStatus(false, error);
    return { room_id: roomId, ok: false, error };
  }

  await recordStatus(true);
  return { room_id: roomId, ok: true, synced: rows.length };
}

/**
 * Synchronise en parallèle le flux iCal de chaque chambre (une URL
 * Booking.com distincte par chambre). Une chambre non configurée ou en
 * échec n'empêche pas la synchro des autres.
 */
export async function runSync(): Promise<{
  ok: boolean;
  results: RoomSyncResult[];
  synced_at: string;
}> {
  const results = await Promise.all(ROOM_LIST.map((room) => syncRoom(room.id)));
  return { ok: results.every((r) => r.ok), results, synced_at: new Date().toISOString() };
}
