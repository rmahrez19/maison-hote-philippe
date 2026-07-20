import { notFound, redirect } from "next/navigation";
import { requireAal2 } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { nightlyBreakdown } from "@/lib/pricing";
import { getOrCreateInvoiceNumber, buildQuoteReference } from "@/lib/invoices";
import { LEGAL_INFO } from "@/lib/legal-info";
import InvoiceDocument from "@/components/admin/InvoiceDocument";
import type { RoomId } from "@/lib/rooms";

export const dynamic = "force-dynamic";

type DocType = "devis" | "facture";

/**
 * Document imprimable autonome (pas de chrome admin) — ouvert dans un
 * nouvel onglet depuis InvoiceModal. Protégé par le proxy (/admin/*)
 * et revérifié ici en profondeur : cette page affiche des données
 * client (nom, email, téléphone) et passe par getSupabaseAdmin()
 * (service_role), qui bypasse le RLS.
 */
export default async function InvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const user = await requireAal2();
  if (!user) redirect("/admin/login");

  const { bookingId } = await params;
  const { type: rawType } = await searchParams;
  const type: DocType = rawType === "facture" ? "facture" : "devis";

  const supabase = getSupabaseAdmin();
  const { data: booking } = await supabase
    .from("room_bookings")
    .select(
      "id, guest_name, guest_email, guest_phone, room_id, check_in, check_out, total_price"
    )
    .eq("id", bookingId)
    .maybeSingle();

  if (!booking) notFound();

  const roomId = booking.room_id as RoomId;
  const nightly = nightlyBreakdown(roomId, booking.check_in, booking.check_out);
  const number =
    type === "facture"
      ? await getOrCreateInvoiceNumber(booking.id)
      : buildQuoteReference(booking.id);
  const issueDateLabel = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <InvoiceDocument
      type={type}
      number={number}
      issueDateLabel={issueDateLabel}
      booking={{
        guest_name: booking.guest_name,
        guest_email: booking.guest_email,
        guest_phone: booking.guest_phone,
        room_id: roomId,
        check_in: booking.check_in,
        check_out: booking.check_out,
        total_price: booking.total_price ?? 0,
      }}
      nightly={nightly}
      legal={LEGAL_INFO}
    />
  );
}
