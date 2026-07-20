import { redirect } from "next/navigation";
import { getSupabaseAuthServer } from "@/lib/supabase-auth-server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { getAdminOccupancy } from "@/lib/admin-bookings";
import { toDateString } from "@/lib/availability";
import { ROOM_LIST } from "@/lib/rooms";
import SyncStatusPanel, {
  type SyncStatusRow,
} from "@/components/admin/SyncStatusPanel";
import ManualBlockPanel from "@/components/admin/ManualBlockPanel";
import OccupancyTimeline from "@/components/admin/OccupancyTimeline";
import BookingsRegistry from "@/components/admin/BookingsRegistry";
import QuickBlockButton from "@/components/admin/QuickBlockButton";
import LogoutButton from "@/components/admin/LogoutButton";

export const dynamic = "force-dynamic";

/**
 * Tableau de bord admin — accessible uniquement en aal2 (mot de passe +
 * TOTP validés). Le middleware garde déjà /admin/*, mais on revérifie
 * ici explicitement (défense en profondeur) : cette page ne rend
 * jamais de données sensibles sur la seule foi du middleware.
 */
export default async function AdminPage() {
  const authClient = await getSupabaseAuthServer();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: aal } = await authClient.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel !== "aal2") redirect("/admin/login");

  const supabase = getSupabaseAdmin();

  const [{ bookings, manualBlocks }, syncStatusRes] = await Promise.all([
    getAdminOccupancy(),
    supabase.from("sync_status").select("*"),
  ]);

  const statusByRoom = new Map(
    (syncStatusRes.data ?? []).map((s) => [s.room_id, s])
  );
  const syncStatus: SyncStatusRow[] = ROOM_LIST.map((room) => {
    const s = statusByRoom.get(room.id);
    return {
      room_id: room.id,
      last_synced_at: s?.last_synced_at ?? null,
      last_success: s?.last_success ?? false,
      last_error: s?.last_error ?? null,
    };
  });

  return (
    <main className="min-h-svh w-full bg-[#f6f2ea] text-stone-800">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-300 pb-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-400">
              Administration
            </p>
            <h1 className="mt-3 font-serif text-4xl text-stone-900">
              Tableau de bord
            </h1>
            <p className="mt-2 text-sm text-stone-500">
              Connecté en tant que {user.email}
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="mt-16">
          <SyncStatusPanel status={syncStatus} />
        </div>

        <div className="mt-16">
          <OccupancyTimeline
            startDate={toDateString(new Date())}
            bookings={bookings}
            manualBlocks={manualBlocks}
          />
        </div>

        <div className="mt-16">
          <BookingsRegistry bookings={bookings} />
        </div>

        <div className="mt-16">
          <ManualBlockPanel blocks={manualBlocks} />
        </div>
      </div>

      <QuickBlockButton />
    </main>
  );
}
