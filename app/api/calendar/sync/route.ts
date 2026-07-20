import { NextResponse } from "next/server";
import { runSync } from "@/lib/sync";

export const dynamic = "force-dynamic";

/**
 * POST /api/calendar/sync
 *
 * Synchronise le flux iCal de chaque chambre (une URL Booking.com
 * distincte par chambre). Statut 207 si succès partiel.
 *
 * À appeler par un cron Vercel ou via le bouton "Forcer la
 * synchronisation" de l'admin. GET accepté pour les crons.
 */
async function handle() {
  const result = await runSync();
  return NextResponse.json(result, { status: result.ok ? 200 : 207 });
}

export async function POST() {
  return handle();
}

// Les crons Vercel appellent en GET
export async function GET() {
  return handle();
}
