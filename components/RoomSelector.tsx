"use client";

import Image from "next/image";
import { ROOM_LIST, type RoomId } from "@/lib/rooms";
import Reveal from "@/components/aman/Reveal";

interface Props {
  selected: RoomId | null;
  onSelect: (roomId: RoomId) => void;
}

/**
 * Étape 1 du tunnel de réservation : deux cartes d'exception épurées,
 * dans le même esprit que les cartes de Residences.tsx sur la landing —
 * image en premier plan, équipements réels, tarif de départ, sélection
 * marquée par un simple trait sable plutôt qu'un badge agressif.
 */
export default function RoomSelector({ selected, onSelect }: Props) {
  return (
    <div className="grid gap-10 sm:grid-cols-2 sm:gap-8">
      {ROOM_LIST.map((room, i) => {
        const active = selected === room.id;
        return (
          <Reveal key={room.id} delay={i * 0.12} as="article">
            <button
              type="button"
              onClick={() => onSelect(room.id)}
              aria-pressed={active}
              className="group relative flex w-full flex-col text-left"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100">
                <Image
                  src={room.photo}
                  alt={room.name}
                  fill
                  sizes="(min-width: 640px) 45vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {active && (
                  <span className="absolute right-4 top-4 rounded-full bg-stone-950/85 px-3 py-1 text-[9px] font-light uppercase tracking-[0.2em] text-stone-50 backdrop-blur-sm">
                    Sélectionnée
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col pt-6">
                <p className="text-[11px] font-light uppercase tracking-[0.25em] text-stone-400">
                  {room.subtitle} · 2 personnes
                </p>
                <h3 className="mt-3 font-serif text-2xl font-light text-stone-900 md:text-3xl">
                  {room.name}
                </h3>
                <ul className="mt-5 space-y-1.5">
                  {room.equipments.map((eq) => (
                    <li
                      key={eq}
                      className="flex items-baseline gap-3 text-sm font-light leading-relaxed text-stone-600"
                    >
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-[#ab8a5b]" />
                      {eq}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="font-serif text-xl text-stone-900">
                    {room.price} €
                  </span>
                  <span className="text-xs font-light text-stone-400">
                    / nuit
                  </span>
                </div>
              </div>

              <div
                className={`mt-6 h-px w-full transition-colors ${
                  active ? "bg-[#ab8a5b]" : "bg-stone-200 group-hover:bg-stone-300"
                }`}
              />
            </button>
          </Reveal>
        );
      })}
    </div>
  );
}
