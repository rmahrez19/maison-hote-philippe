"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { unblockDate } from "@/app/admin/actions";
import { ROOMS, type RoomId } from "@/lib/rooms";
import BlockDateForm from "./BlockDateForm";

export interface ManualBlock {
  id: string;
  room_id: RoomId;
  check_in: string;
}

interface Props {
  blocks: ManualBlock[];
}

/**
 * Bloc 3 : blocage manuel d'une date pour une chambre. Écrit dans
 * synced_bookings (source='manual'), donc grise immédiatement la date
 * sur le calendrier public — aucune logique de disponibilité séparée.
 */
export default function ManualBlockPanel({ blocks }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleUnblock(id: string) {
    startTransition(async () => {
      await unblockDate(id);
      router.refresh();
    });
  }

  return (
    <section>
      <h2 className="border-b border-stone-300 pb-4 font-serif text-2xl text-stone-900">
        Blocage manuel
      </h2>

      <div className="mt-6">
        <BlockDateForm />
      </div>

      {blocks.length > 0 && (
        <ul className="mt-8 divide-y divide-stone-200 text-sm">
          {blocks.map((b) => (
            <li key={b.id} className="flex items-center justify-between py-3">
              <span className="text-stone-700">
                <span className="mr-3 text-xs text-stone-400">
                  {ROOMS[b.room_id]?.name ?? b.room_id}
                </span>
                {b.check_in}
              </span>
              <button
                type="button"
                onClick={() => handleUnblock(b.id)}
                disabled={pending}
                className="text-xs uppercase tracking-[0.2em] text-stone-400 transition-colors hover:text-red-700 disabled:cursor-not-allowed"
              >
                Retirer
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
