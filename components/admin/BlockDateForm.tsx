"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { blockDate } from "@/app/admin/actions";
import { ROOM_LIST, type RoomId } from "@/lib/rooms";

interface Props {
  /** Appelé après un blocage réussi (ex : fermer le modal du bouton de secours). */
  onBlocked?: () => void;
}

/** Formulaire de blocage manuel — partagé entre le panneau inline et le bouton de secours flottant. */
export default function BlockDateForm({ onBlocked }: Props) {
  const router = useRouter();
  const [roomId, setRoomId] = useState<RoomId>(ROOM_LIST[0].id);
  const [date, setDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;
    setError(null);
    startTransition(async () => {
      const res = await blockDate(roomId, date);
      if (res.error) {
        setError(res.error);
        return;
      }
      setDate("");
      router.refresh();
      onBlocked?.();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-6">
      <div>
        <label
          htmlFor="block-room"
          className="block font-mono text-[10px] uppercase tracking-[0.25em] text-stone-400"
        >
          Chambre
        </label>
        <select
          id="block-room"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value as RoomId)}
          className="mt-2 border-b border-stone-300 bg-transparent py-2 pr-8 text-stone-900 focus:border-stone-900 focus:outline-none"
        >
          {ROOM_LIST.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="block-date"
          className="block font-mono text-[10px] uppercase tracking-[0.25em] text-stone-400"
        >
          Date
        </label>
        <input
          id="block-date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-2 border-b border-stone-300 bg-transparent py-2 text-stone-900 focus:border-stone-900 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={pending || !date}
        className="border border-stone-900 px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-stone-900 transition-colors hover:bg-stone-900 hover:text-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Bloquer cette date
      </button>

      {error && <p className="w-full text-sm text-red-700">{error}</p>}
    </form>
  );
}
