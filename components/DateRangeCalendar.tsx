"use client";

import { useMemo, useState } from "react";
import { isDateBlocked, toDateString } from "@/lib/availability";
import { priceForDate } from "@/lib/pricing";
import type { RoomId } from "@/lib/rooms";
import type { BlockedRange } from "@/lib/types";
import WaveIndicator from "@/components/WaveIndicator";

const MONTH_NAMES = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const DAY_NAMES = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

interface Props {
  roomId: RoomId;
  blocked: BlockedRange[];
  checkIn: string | null;
  checkOut: string | null;
  onChange: (checkIn: string | null, checkOut: string | null) => void;
}

/**
 * Calendrier mensuel de sélection d'une plage [check-in, check-out[,
 * tarifé pour la chambre choisie : le prix de la nuitée s'affiche sous
 * chaque jour disponible. Une date est grisée si elle appartient à un
 * intervalle occupé (réservation directe ou bloc importé de Booking.com)
 * pour cette chambre précise.
 */
export default function DateRangeCalendar({
  roomId,
  blocked,
  checkIn,
  checkOut,
  onChange,
}: Props) {
  const today = toDateString(new Date());
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const cells = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Lundi = 0 … Dimanche = 6
    const offset = (firstDay.getDay() + 6) % 7;

    const list: (string | null)[] = Array(offset).fill(null);
    for (let day = 1; day <= daysInMonth; day++) {
      list.push(toDateString(new Date(year, month, day)));
    }
    // Complète la dernière ligne pour garder la trame de filets intacte.
    while (list.length % 7 !== 0) list.push(null);
    return list;
  }, [viewDate]);

  function handleClick(date: string) {
    if (!checkIn || (checkIn && checkOut)) {
      // Nouveau départ de sélection
      onChange(date, null);
      return;
    }
    if (date <= checkIn) {
      onChange(date, null);
      return;
    }
    // Vérifie qu'aucune date bloquée ne se trouve dans [checkIn, date[
    const cursor = new Date(checkIn + "T00:00:00");
    while (toDateString(cursor) < date) {
      if (isDateBlocked(toDateString(cursor), blocked)) {
        onChange(date, null);
        return;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    onChange(checkIn, date);
  }

  function classForDate(date: string): string {
    const past = date < today;
    const unavailable = isDateBlocked(date, blocked);
    if (past || unavailable) {
      return "text-stone-300 line-through cursor-not-allowed";
    }
    const isCheckIn = date === checkIn;
    const isCheckOut = date === checkOut;
    const inRange = checkIn && checkOut && date > checkIn && date < checkOut;
    if (isCheckIn || isCheckOut) {
      return "bg-stone-900 text-stone-50 font-medium";
    }
    if (inRange) {
      return "bg-stone-100 text-stone-800";
    }
    return "text-stone-700 hover:bg-stone-100 cursor-pointer";
  }

  const navBtnClass =
    "border border-stone-300 px-3 py-1 text-stone-500 transition-colors hover:border-stone-900 hover:text-stone-900";

  return (
    <div className="rounded-2xl border border-stone-200/60 bg-white/80 p-6 backdrop-blur-md md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          aria-label="Mois précédent"
          onClick={() =>
            setViewDate(
              new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)
            )
          }
          className={navBtnClass}
        >
          ←
        </button>
        <p className="font-serif text-2xl font-light text-stone-900">
          {MONTH_NAMES[viewDate.getMonth()]}{" "}
          <span className="text-sm font-light text-stone-400">
            {viewDate.getFullYear()}
          </span>
        </p>
        <button
          type="button"
          aria-label="Mois suivant"
          onClick={() =>
            setViewDate(
              new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
            )
          }
          className={navBtnClass}
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[10px] font-light uppercase tracking-[0.2em] text-stone-400">
        {DAY_NAMES.map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>

      {/* gap-px sur fond clair : la trame de filets fins apparaît entre
          les cases pleines, dans le même esprit que les grilles du reste
          du site. */}
      <div className="grid grid-cols-7 gap-px border border-stone-200/60 bg-stone-200/60 text-center">
        {cells.map((date, i) => {
          if (date === null) {
            return <div key={`empty-${i}`} className="aspect-square bg-white" />;
          }
          const disabled = date < today || isDateBlocked(date, blocked);
          return (
            <button
              key={date}
              type="button"
              disabled={disabled}
              onClick={() => handleClick(date)}
              className={`flex aspect-square flex-col items-center justify-center gap-0.5 bg-white text-xs transition-colors ${classForDate(date)}`}
            >
              <span>{date.slice(8, 10)}</span>
              {!disabled && (
                <span className="text-[8px] leading-none text-[#ab8a5b]">
                  {priceForDate(roomId)}€
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-8 text-[10px] font-light uppercase tracking-[0.2em] text-stone-400">
        <span className="flex items-center gap-3">
          <WaveIndicator /> Libre
        </span>
        <span className="flex items-center gap-3">
          <WaveIndicator state="still" /> Occupé
        </span>
      </div>

      <p className="mt-4 text-xs font-light leading-relaxed text-stone-400">
        Les dates barrées sont indisponibles (réservations directes et
        Booking.com). Le jour du départ reste sélectionnable comme check-out.
      </p>
    </div>
  );
}
