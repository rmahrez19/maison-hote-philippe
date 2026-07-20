"use client";

import { useEffect, useState } from "react";
import BlockDateForm from "./BlockDateForm";

/**
 * Bouton de secours toujours visible (position fixe) : Philippe doit
 * pouvoir griser une date en 1 clic, sans avoir à faire défiler la
 * page jusqu'au panneau de blocage manuel.
 */
export default function QuickBlockButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-6 bottom-6 z-40 border border-stone-900 bg-stone-900 px-6 py-4 text-xs uppercase tracking-[0.2em] text-stone-50 shadow-lg transition-colors hover:bg-stone-700 print:hidden"
      >
        + Ajouter un blocage manuel
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 px-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#f6f2ea] p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif text-2xl text-stone-900">Bloquer une date</h2>
            <p className="mt-2 text-sm text-stone-500">
              Travaux, séjour personnel… la date est grisée immédiatement sur le calendrier public.
            </p>
            <div className="mt-6">
              <BlockDateForm onBlocked={() => setOpen(false)} />
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-6 w-full text-center text-xs uppercase tracking-[0.2em] text-stone-400 hover:text-stone-700"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
