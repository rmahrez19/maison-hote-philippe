"use client";

import { useMemo, useState } from "react";
import { ROOMS, ROOM_LIST, type RoomId } from "@/lib/rooms";
import type { BookingSource, UnifiedBooking } from "@/lib/admin-bookings";
import InvoiceModal from "./InvoiceModal";

type SourceFilter = "all" | BookingSource;
type RoomFilter = "all" | RoomId;
type SortKey = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

interface Props {
  bookings: UnifiedBooking[];
}

const STATUS_LABEL: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
};

const STATUS_CLASS: Record<string, string> = {
  pending: "border-amber-300 text-amber-800",
  confirmed: "border-emerald-300 text-emerald-800",
  cancelled: "border-stone-300 text-stone-500",
};

const SOURCE_OPTIONS: { value: SourceFilter; label: string }[] = [
  { value: "all", label: "Toutes les sources" },
  { value: "direct", label: "🟢 Direct" },
  { value: "booking.com", label: "🔵 Booking.com" },
];

const ROOM_OPTIONS: { value: RoomFilter; label: string }[] = [
  { value: "all", label: "Toutes les chambres" },
  ...ROOM_LIST.map((r) => ({ value: r.id as RoomFilter, label: r.name })),
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "date-desc", label: "Plus récent d'abord" },
  { value: "date-asc", label: "Plus ancien d'abord" },
  { value: "amount-desc", label: "Montant : le plus cher" },
  { value: "amount-asc", label: "Montant : le moins cher" },
];

/** Groupe de gros boutons à bascule — jamais de menu déroulant, un clic suffit. */
function PillGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={`border px-4 py-2.5 text-xs uppercase tracking-[0.15em] transition-colors ${
            value === opt.value
              ? "border-stone-900 bg-stone-900 text-stone-50"
              : "border-stone-300 text-stone-600 hover:border-stone-500"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function SourceBadge({ source }: { source: BookingSource }) {
  return source === "direct" ? (
    <span className="whitespace-nowrap text-xs text-emerald-800">🟢 Direct</span>
  ) : (
    <span className="whitespace-nowrap text-xs text-sky-800">🔵 Booking.com</span>
  );
}

/** Bloc principal : registre unifié direct + Booking.com, filtres et tris en 1 clic. */
export default function BookingsRegistry({ bookings }: Props) {
  const [source, setSource] = useState<SourceFilter>("all");
  const [room, setRoom] = useState<RoomFilter>("all");
  const [sort, setSort] = useState<SortKey>("date-desc");
  const [selected, setSelected] = useState<UnifiedBooking | null>(null);

  const visible = useMemo(() => {
    const filtered = bookings.filter(
      (b) =>
        (source === "all" || b.source === source) &&
        (room === "all" || b.room_id === room)
    );

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "date-asc":
          return a.check_in.localeCompare(b.check_in);
        case "amount-desc":
          return b.total_price - a.total_price;
        case "amount-asc":
          return a.total_price - b.total_price;
        case "date-desc":
        default:
          return b.check_in.localeCompare(a.check_in);
      }
    });
  }, [bookings, source, room, sort]);

  return (
    <section>
      <h2 className="border-b border-stone-300 pb-4 font-serif text-2xl text-stone-900">
        Registre des réservations
      </h2>

      <div className="mt-6 space-y-4">
        <PillGroup options={SOURCE_OPTIONS} value={source} onChange={setSource} />
        <PillGroup options={ROOM_OPTIONS} value={room} onChange={setRoom} />
        <PillGroup options={SORT_OPTIONS} value={sort} onChange={setSort} />
      </div>

      {visible.length === 0 ? (
        <p className="mt-8 text-sm text-stone-500">Aucune réservation ne correspond à ces filtres.</p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-300 text-stone-400">
                <th className="py-2 pr-4 font-normal">Source</th>
                <th className="py-2 pr-4 font-normal">Client</th>
                <th className="py-2 pr-4 font-normal">Chambre</th>
                <th className="py-2 pr-4 font-normal">Séjour</th>
                <th className="py-2 pr-4 font-normal">Montant</th>
                <th className="py-2 font-normal">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {visible.map((b) => {
                const clickable = b.source === "direct";
                return (
                  <tr
                    key={`${b.source}-${b.id}`}
                    onClick={clickable ? () => setSelected(b) : undefined}
                    className={clickable ? "cursor-pointer hover:bg-stone-100" : undefined}
                  >
                    <td className="py-3 pr-4">
                      <SourceBadge source={b.source} />
                    </td>
                    <td className="py-3 pr-4 text-stone-900">
                      {b.guest_name ?? (
                        <span className="text-stone-400">— (client Booking.com)</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-stone-700">
                      {ROOMS[b.room_id]?.name ?? b.room_id}
                    </td>
                    <td className="py-3 pr-4 text-stone-700">
                      {b.check_in} → {b.check_out}
                    </td>
                    <td className="py-3 pr-4 text-stone-700">
                      {b.total_price} €
                      {b.price_estimated && (
                        <span className="ml-1 text-xs text-stone-400" title="Montant estimé — non transmis par Booking.com">
                          (estimé)
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      {b.status ? (
                        <span
                          className={`border px-3 py-1 text-xs ${STATUS_CLASS[b.status]}`}
                        >
                          {STATUS_LABEL[b.status]}
                        </span>
                      ) : (
                        <span className="text-xs text-stone-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <InvoiceModal booking={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
