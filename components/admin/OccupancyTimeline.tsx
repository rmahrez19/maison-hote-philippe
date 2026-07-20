import { ROOM_LIST, type RoomId } from "@/lib/rooms";
import type { ManualBlockRange, UnifiedBooking } from "@/lib/admin-bookings";

const DAYS = 30;

interface Props {
  startDate: string; // YYYY-MM-DD, aujourd'hui côté serveur
  bookings: UnifiedBooking[];
  manualBlocks: ManualBlockRange[];
}

type Kind = "direct" | "booking.com" | "manual";

interface Segment {
  key: string;
  room_id: RoomId;
  leftPct: number;
  widthPct: number;
  kind: Kind;
  label: string;
  title: string;
}

const KIND_CLASS: Record<Kind, string> = {
  direct: "bg-emerald-600/80",
  "booking.com": "bg-sky-600/80",
  manual: "bg-stone-400/80",
};

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
}

function addDays(date: string, n: number): string {
  const d = new Date(date + "T00:00:00");
  d.setDate(d.getDate() + n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatShort(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

/**
 * Frise d'occupation sur 30 jours, 2 lignes (une par chambre) — la vue
 * préférée des hôteliers pour repérer les trous de remplissage d'un
 * coup d'œil, à la place d'un calendrier mensuel classique.
 */
export default function OccupancyTimeline({ startDate, bookings, manualBlocks }: Props) {
  const endDate = addDays(startDate, DAYS);

  const entries: { room_id: RoomId; check_in: string; check_out: string; kind: Kind; label: string; title: string }[] = [
    ...bookings.map((b) => ({
      room_id: b.room_id,
      check_in: b.check_in,
      check_out: b.check_out,
      kind: b.source,
      label: b.source === "direct" ? (b.guest_name ?? "Réservation") : "Booking.com",
      title:
        b.source === "direct"
          ? `${b.guest_name} · ${b.check_in} → ${b.check_out}`
          : `Booking.com · ${b.check_in} → ${b.check_out}`,
    })),
    ...manualBlocks.map((m) => ({
      room_id: m.room_id,
      check_in: m.check_in,
      check_out: m.check_out,
      kind: "manual" as Kind,
      label: "Bloqué",
      title: `Blocage manuel · ${m.check_in} → ${m.check_out}`,
    })),
  ];

  const segmentsByRoom: Record<RoomId, Segment[]> = {
    "rive-gauche": [],
    "rive-droite": [],
  };

  for (const e of entries) {
    if (e.check_out <= startDate || e.check_in >= endDate) continue;
    const clampedStart = e.check_in < startDate ? startDate : e.check_in;
    const clampedEnd = e.check_out > endDate ? endDate : e.check_out;
    const leftPct = (daysBetween(startDate, clampedStart) / DAYS) * 100;
    const widthPct = (daysBetween(clampedStart, clampedEnd) / DAYS) * 100;

    segmentsByRoom[e.room_id].push({
      key: `${e.room_id}-${e.check_in}-${e.check_out}-${e.kind}`,
      room_id: e.room_id,
      leftPct,
      widthPct,
      kind: e.kind,
      label: e.label,
      title: e.title,
    });
  }

  const weekMarkers = [0, 7, 14, 21, 28];

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-stone-300 pb-4">
        <h2 className="font-serif text-2xl text-stone-900">Occupation — 30 prochains jours</h2>
        <div className="flex flex-wrap gap-4 text-xs text-stone-500">
          <span><span className="mr-1.5 inline-block size-2.5 rounded-sm bg-emerald-600/80 align-middle" />Direct</span>
          <span><span className="mr-1.5 inline-block size-2.5 rounded-sm bg-sky-600/80 align-middle" />Booking.com</span>
          <span><span className="mr-1.5 inline-block size-2.5 rounded-sm bg-stone-400/80 align-middle" />Bloqué</span>
        </div>
      </div>

      <div className="mt-8 min-w-[640px] overflow-x-auto">
        <div className="relative h-5 min-w-[640px] text-[10px] text-stone-400">
          {weekMarkers.map((offset) => (
            <span
              key={offset}
              className="absolute -translate-x-1/2"
              style={{ left: `${(offset / DAYS) * 100}%` }}
            >
              {formatShort(addDays(startDate, offset))}
            </span>
          ))}
        </div>

        <div className="mt-2 space-y-4">
          {ROOM_LIST.map((room) => (
            <div key={room.id}>
              <p className="mb-1.5 text-sm text-stone-600">{room.name}</p>
              <div className="relative h-11 min-w-[640px] border border-stone-200 bg-stone-50">
                {weekMarkers.slice(1).map((offset) => (
                  <span
                    key={offset}
                    className="absolute inset-y-0 border-l border-stone-200"
                    style={{ left: `${(offset / DAYS) * 100}%` }}
                  />
                ))}
                {segmentsByRoom[room.id].map((seg) => (
                  <div
                    key={seg.key}
                    title={seg.title}
                    className={`absolute inset-y-1 flex items-center overflow-hidden rounded-sm px-2 text-[10px] whitespace-nowrap text-white ${KIND_CLASS[seg.kind]}`}
                    style={{ left: `${seg.leftPct}%`, width: `${seg.widthPct}%` }}
                  >
                    {seg.label}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
