"use client";

import { ROOMS, type RoomId } from "@/lib/rooms";
import type { NightLine } from "@/lib/pricing";
import { LEGAL_INFO } from "@/lib/legal-info";

export interface InvoiceDocumentProps {
  type: "devis" | "facture";
  number: string;
  issueDateLabel: string;
  booking: {
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    room_id: RoomId;
    check_in: string;
    check_out: string;
    total_price: number;
  };
  nightly: NightLine[];
  legal: typeof LEGAL_INFO;
}

function formatDateLabel(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function money(n: number) {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Document print-ready (devis ou facture) — minimalisme absolu, pensé
 * pour window.print() natif : pas de dépendance PDF, pas de mise en
 * page qui ne survivrait pas à l'impression A4.
 */
export default function InvoiceDocument({
  type,
  number,
  issueDateLabel,
  booking,
  nightly,
  legal,
}: InvoiceDocumentProps) {
  const room = ROOMS[booking.room_id];
  const subtotal = nightly.reduce((sum, l) => sum + l.price, 0);
  const tvaApplicable = legal.tva.mode === "applicable";
  const tvaAmount = tvaApplicable ? (subtotal * legal.tva.rate) / 100 : 0;
  const total = subtotal + tvaAmount;
  const title = type === "facture" ? "Facture" : "Devis";

  return (
    <div className="min-h-svh bg-white text-stone-900">
      <div className="mx-auto max-w-2xl px-8 py-12 print:px-0 print:py-0">
        <div className="flex justify-end gap-4 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="border border-stone-900 px-6 py-3 text-xs uppercase tracking-[0.2em] text-stone-900 transition-colors hover:bg-stone-900 hover:text-stone-50"
          >
            Imprimer / Enregistrer en PDF
          </button>
        </div>

        <header className="mt-8 border-b border-stone-200 pb-8 text-center print:mt-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-stone-400">
            Péniche
          </p>
          <h1 className="mt-2 font-serif text-3xl">Megalight II</h1>
          <p className="mt-1 text-sm text-stone-500">{legal.address}</p>
        </header>

        <div className="mt-10 flex items-baseline justify-between">
          <h2 className="font-serif text-2xl uppercase tracking-wide">{title}</h2>
          <div className="text-right text-sm text-stone-500">
            <p>N° {number}</p>
            <p>{issueDateLabel}</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-8 border-t border-stone-200 pt-8 text-sm">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-stone-400">
              Émis par
            </p>
            <p className="mt-2 text-stone-900">{legal.hostName}</p>
            <p className="text-stone-600">{legal.address}</p>
            <p className="text-stone-600">SIREN {legal.siren}</p>
            <p className="text-stone-600">Licence {legal.tourismLicence}</p>
            <p className="text-stone-600">{legal.email}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-stone-400">
              Client
            </p>
            <p className="mt-2 text-stone-900">{booking.guest_name}</p>
            <p className="text-stone-600">{booking.guest_email}</p>
            <p className="text-stone-600">{booking.guest_phone}</p>
          </div>
        </div>

        <div className="mt-8 border-t border-stone-200 pt-8 text-sm">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-stone-400">
            Séjour
          </p>
          <p className="mt-2 text-stone-900">{room?.name ?? booking.room_id}</p>
          <p className="text-stone-600">
            Arrivée : {formatDateLabel(booking.check_in)}
          </p>
          <p className="text-stone-600">
            Départ : {formatDateLabel(booking.check_out)}
          </p>
          <p className="mt-1 text-stone-600">
            {nightly.length} nuit{nightly.length > 1 ? "s" : ""}
          </p>
        </div>

        <table className="mt-8 w-full border-t border-stone-200 pt-2 text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-stone-400">
              <th className="py-3 font-normal">Nuit du</th>
              <th className="py-3 text-right font-normal">Tarif</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {nightly.map((line) => (
              <tr key={line.date}>
                <td className="py-2.5 text-stone-700">{line.date}</td>
                <td className="py-2.5 text-right text-stone-700">{money(line.price)} €</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 space-y-1.5 border-t border-stone-200 pt-6 text-sm">
          <div className="flex justify-between text-stone-600">
            <span>Sous-total</span>
            <span>{money(subtotal)} €</span>
          </div>
          {tvaApplicable ? (
            <div className="flex justify-between text-stone-600">
              <span>TVA ({legal.tva.rate}%)</span>
              <span>{money(tvaAmount)} €</span>
            </div>
          ) : (
            <p className="text-xs text-stone-400">{legal.tva.franchiseMention}</p>
          )}
          <div className="flex justify-between border-t border-stone-300 pt-3 font-serif text-xl text-stone-900">
            <span>Total {type === "facture" ? "dû" : "estimé"}</span>
            <span>{money(total)} €</span>
          </div>
        </div>

        <footer className="mt-16 border-t border-stone-200 pt-6 text-center text-xs text-stone-400">
          {type === "devis"
            ? "Devis valable 30 jours à compter de sa date d'émission — ne vaut pas facture."
            : "Facture acquittée à réception, sauf mention contraire."}
        </footer>
      </div>
    </div>
  );
}
