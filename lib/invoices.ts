import { getSupabaseAdmin } from "./supabase-server";

/**
 * Numéro de facture stable et séquentiel pour une réservation directe
 * donnée : réutilise le numéro existant si la facture est régénérée
 * (impression multiple), sinon en tire un nouveau via
 * next_invoice_number() (atomique côté Postgres, voir schema.sql).
 *
 * Les devis n'ont pas d'obligation de numérotation légale — ils ne
 * passent pas par cette fonction (voir lib/quote.ts côté appelant).
 */
export async function getOrCreateInvoiceNumber(bookingId: string): Promise<string> {
  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from("invoices")
    .select("number")
    .eq("booking_id", bookingId)
    .maybeSingle();
  if (existing) return existing.number;

  const year = new Date().getFullYear();
  const { data: seq, error: seqError } = await supabase.rpc("next_invoice_number", {
    p_year: year,
  });
  if (seqError || seq == null) {
    throw new Error(seqError?.message ?? "Échec de la numérotation de facture.");
  }

  const number = `F${year}-${String(seq).padStart(4, "0")}`;
  const { error: insertError } = await supabase
    .from("invoices")
    .insert({ booking_id: bookingId, number });

  if (insertError) {
    // Conflit probable : une facture a été créée entre-temps pour cette
    // réservation (double clic, deux onglets) — on retombe sur elle
    // plutôt que d'échouer.
    const { data: retry } = await supabase
      .from("invoices")
      .select("number")
      .eq("booking_id", bookingId)
      .maybeSingle();
    if (retry) return retry.number;
    throw new Error(insertError.message);
  }

  return number;
}

/** Référence de devis — pas de numérotation légale, dérivée de la réservation et de la date du jour. */
export function buildQuoteReference(bookingId: string): string {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  return `D${y}${m}${d}-${bookingId.slice(0, 8).toUpperCase()}`;
}
