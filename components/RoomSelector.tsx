"use client";

import Image from "next/image";
import { ROOM_LIST, type RoomId } from "@/lib/rooms";

interface Props {
  selected: RoomId | null;
  onSelect: (roomId: RoomId) => void;
}

/**
 * Étape 1 du tunnel de réservation : deux grandes cartes façon magazine,
 * une par chambre, avec photo, équipements réels et tarif de départ.
 */
export default function RoomSelector({ selected, onSelect }: Props) {
  return (
    <div className="grid gap-px border border-slate-800 bg-slate-800 sm:grid-cols-2">
      {ROOM_LIST.map((room) => {
        const active = selected === room.id;
        return (
          <button
            key={room.id}
            type="button"
            onClick={() => onSelect(room.id)}
            aria-pressed={active}
            className="group relative flex flex-col bg-night text-left"
          >
            <div className="relative aspect-[4/3] overflow-hidden border-b border-slate-800">
              <Image
                src={room.photo}
                alt={room.name}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/10 to-transparent" />
              {active && (
                <span className="absolute right-4 top-4 border border-amber-200/50 bg-night/80 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-amber-100/90 backdrop-blur-sm">
                  Sélectionnée
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col p-6 md:p-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber-200/60">
                {room.subtitle}
              </p>
              <h3 className="mt-3 font-serif text-3xl text-slate-100">
                {room.name}
              </h3>
              <ul className="mt-5 space-y-1.5 text-sm text-slate-400">
                {room.equipments.map((eq) => (
                  <li key={eq} className="flex items-baseline gap-2">
                    <span className="text-amber-200/50">—</span>
                    {eq}
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex items-baseline gap-2 pt-6 font-mono text-xs text-slate-500">
                <span className="text-lg text-slate-100">{room.price} €</span>
                <span>/ nuit</span>
              </div>
            </div>

            <div
              className={`h-px w-full transition-colors ${active ? "bg-amber-200/60" : "bg-transparent"}`}
            />
          </button>
        );
      })}
    </div>
  );
}
