import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { isRoomId } from "@/lib/rooms";

export const dynamic = "force-dynamic";

/** "2026-07-18" -> "20260718" (format DATE RFC 5545) */
function toIcsDate(isoDate: string): string {
  return isoDate.replaceAll("-", "");
}

/** Timestamp UTC au format RFC 5545 : 20260718T093000Z */
function toIcsTimestamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

/** Plie les lignes à 75 octets max (RFC 5545 §3.1). */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, 75));
  rest = rest.slice(75);
  while (rest.length > 0) {
    parts.push(" " + rest.slice(0, 74));
    rest = rest.slice(74);
  }
  return parts.join("\r\n");
}

/**
 * GET /api/calendar/export?room=rive-gauche|rive-droite
 *
 * Flux iCalendar (RFC 5545) des réservations directes confirmées pour
 * la chambre demandée. Philippe colle cette URL — une par chambre —
 * dans l'extranet Booking.com (Calendrier > Importer un calendrier)
 * pour bloquer les dates réservées en direct sur la bonne annonce.
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

  const { data: bookings, error } = await supabase
    .from("room_bookings")
    .select("id, check_in, check_out")
    .eq("room_id", room)
    .eq("status", "confirmed")
    .order("check_in", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Impossible de lire les réservations", details: error.message },
      { status: 500 }
    );
  }

  const now = toIcsTimestamp(new Date());

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//Megalight II//Reservations ${room}//FR`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const b of bookings ?? []) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:booking-${b.id}@megalight2.com`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${toIcsDate(b.check_in)}`,
      `DTEND;VALUE=DATE:${toIcsDate(b.check_out)}`,
      "SUMMARY:Réservé (Direct)",
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");

  const body = lines.map(foldLine).join("\r\n") + "\r\n";

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="reservations-${room}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
