"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Bouton "Forcer la synchronisation" — appelle POST /api/calendar/sync. */
export default function SyncButton() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "syncing" | "error">("idle");

  async function handleSync() {
    setState("syncing");
    const res = await fetch("/api/calendar/sync", { method: "POST" });
    if (res.ok) {
      setState("idle");
      router.refresh();
    } else {
      setState("error");
    }
  }

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={handleSync}
        disabled={state === "syncing"}
        className="rounded-full bg-stone-900 px-6 py-2.5 text-sm text-stone-50 transition hover:bg-stone-700 disabled:bg-stone-300"
      >
        {state === "syncing"
          ? "Synchronisation…"
          : "Forcer la synchronisation"}
      </button>
      {state === "error" && (
        <p className="mt-2 text-xs text-red-600">
          Échec de la synchronisation (vérifier BOOKING_ICAL_URL_RIVE_GAUCHE /
          BOOKING_ICAL_URL_RIVE_DROITE).
        </p>
      )}
    </div>
  );
}
