import { NextResponse } from "next/server";
import { requireAal2 } from "@/lib/admin-auth";
import { getAdminOccupancy } from "@/lib/admin-bookings";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/bookings
 *
 * Vue unifiée des réservations (directes + Booking.com) pour le
 * registre admin. Protégée en profondeur par requireAal2() : cette
 * route sert des données de clients (nom, email, téléphone), elle ne
 * doit jamais dépendre du seul proxy.
 */
export async function GET() {
  if (!(await requireAal2())) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { bookings } = await getAdminOccupancy();
  return NextResponse.json({ bookings });
}
