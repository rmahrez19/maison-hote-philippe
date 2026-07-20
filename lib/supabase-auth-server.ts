import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client Supabase authentifié pour l'App Router (Server Components,
 * Server Actions) : lit/écrit la session via les cookies httpOnly gérés
 * par @supabase/ssr, avec la clé publique (anon/publishable).
 *
 * À utiliser UNIQUEMENT pour tout ce qui touche à l'identité de
 * l'utilisateur (login, MFA, session). Jamais pour les données métier
 * (réservations, blocs) : celles-ci passent par getSupabaseAdmin()
 * (lib/supabase-server.ts, clé service_role) qui bypasse le RLS.
 */
export async function getSupabaseAuthServer() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Variables d'environnement manquantes : NEXT_PUBLIC_SUPABASE_URL et/ou NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Appelé depuis un Server Component pur (pas une Server Action ni
          // un Route Handler) : l'écriture de cookies y est interdite et
          // silencieusement ignorée — le middleware rafraîchit la session
          // à la requête suivante.
        }
      },
    },
  });
}
