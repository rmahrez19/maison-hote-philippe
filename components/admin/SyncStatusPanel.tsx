"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { forceSyncAction } from "@/app/admin/actions";
import { ROOMS, type RoomId } from "@/lib/rooms";

export interface SyncStatusRow {
  room_id: RoomId;
  last_synced_at: string | null;
  last_success: boolean;
  last_error: string | null;
}

interface Props {
  status: SyncStatusRow[];
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Bloc 1 : statut vert/rouge par chambre + bouton de synchro forcée. */
export default function SyncStatusPanel({ status }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSync() {
    setError(null);
    startTransition(async () => {
      const res = await forceSyncAction();
      if ("error" in res && res.error) {
        setError(res.error);
      }
      router.refresh();
    });
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-300 pb-4">
        <h2 className="font-serif text-2xl text-stone-900">
          Synchronisation iCal
        </h2>
        <button
          type="button"
          onClick={handleSync}
          disabled={pending}
          className="border border-stone-900 px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-stone-900 transition-colors hover:bg-stone-900 hover:text-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Synchronisation…" : "Forcer la synchronisation"}
        </button>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {status.map((s) => (
          <div key={s.room_id} className="flex items-start gap-3">
            <span
              className={`mt-1.5 size-2 shrink-0 rounded-full ${
                s.last_success ? "bg-emerald-600" : "bg-red-600"
              }`}
              aria-hidden
            />
            <div>
              <p className="font-serif text-lg text-stone-900">
                {ROOMS[s.room_id]?.name ?? s.room_id}
              </p>
              <p className="mt-0.5 text-sm text-stone-500">
                {s.last_synced_at
                  ? s.last_success
                    ? `Dernière synchro réussie : ${formatDate(s.last_synced_at)}`
                    : `Échec : ${s.last_error ?? "erreur inconnue"}`
                  : "Jamais synchronisé"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
    </section>
  );
}
