"use client";

import { useEffect } from "react";
import { ROOMS } from "@/lib/rooms";
import type { UnifiedBooking } from "@/lib/admin-bookings";

interface Props {
  booking: UnifiedBooking;
  onClose: () => void;
}

/**
 * Choix devis/facture pour une réservation directe. Chaque bouton ouvre
 * le document imprimable dans un nouvel onglet (route /admin/invoice)
 * plutôt que de tenter d'imprimer le tableau de bord lui-même — plus
 * robuste que de masquer l'interface admin au moment de l'impression.
 */
export default function InvoiceModal({ booking, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 px-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[#f6f2ea] p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-400">
          {ROOMS[booking.room_id]?.name ?? booking.room_id}
        </p>
        <h2 className="mt-3 font-serif text-2xl text-stone-900">{booking.guest_name}</h2>
        <p className="mt-2 text-sm text-stone-500">
          {booking.check_in} → {booking.check_out} · {booking.total_price} €
        </p>

        <div className="mt-8 space-y-3">
          <a
            href={`/admin/invoice/${booking.id}?type=devis`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full border border-stone-900 py-4 text-center text-xs uppercase tracking-[0.25em] text-stone-900 transition-colors hover:bg-stone-900 hover:text-stone-50"
          >
            Générer un devis
          </a>
          <a
            href={`/admin/invoice/${booking.id}?type=facture`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full border border-stone-900 bg-stone-900 py-4 text-center text-xs uppercase tracking-[0.25em] text-stone-50 transition-colors hover:bg-stone-700"
          >
            Générer une facture
          </a>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full text-center text-xs uppercase tracking-[0.2em] text-stone-400 hover:text-stone-700"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
