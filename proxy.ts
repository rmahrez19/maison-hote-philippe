import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Garde d'accès à /admin/* basée sur le niveau d'assurance
 * d'authentification (AAL) Supabase :
 *
 *  - Pas de session               → /admin/login
 *  - Session mais aucun facteur MFA enrôlé (nextLevel === 'aal1')
 *                                  → /admin/setup-2fa
 *  - Facteur enrôlé mais pas encore validé cette session
 *    (nextLevel === 'aal2' && currentLevel !== 'aal2')
 *                                  → /admin/challenge
 *  - aal2 pleinement atteint      → accès autorisé
 *
 * /admin/login, /admin/setup-2fa et /admin/challenge ne sont accessibles
 * que dans l'état qui leur correspond ; en dehors, on redirige vers
 * l'étape pertinente pour ne jamais laisser une session incomplète
 * atteindre le tableau de bord.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    // Config manquante : on bloque tout /admin/* sauf /admin/login
    // elle-même (sinon boucle de redirection infinie sur cette page).
    // La Server Action de connexion échouera proprement à son tour.
    return pathname === "/admin/login"
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/admin/login", request.url));
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Personne connecté : seule /admin/login est accessible.
  if (!user) {
    return pathname === "/admin/login"
      ? response
      : NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const hasFactor = aal?.nextLevel === "aal2";
  const isFullyVerified = hasFactor && aal?.currentLevel === "aal2";

  if (pathname === "/admin/login") {
    // Déjà authentifié : ne jamais repasser par l'écran de connexion.
    const next = isFullyVerified
      ? "/admin"
      : hasFactor
        ? "/admin/challenge"
        : "/admin/setup-2fa";
    return NextResponse.redirect(new URL(next, request.url));
  }

  if (!hasFactor) {
    // Aucun facteur TOTP enrôlé : direction obligatoire vers la config.
    return pathname === "/admin/setup-2fa"
      ? response
      : NextResponse.redirect(new URL("/admin/setup-2fa", request.url));
  }

  if (!isFullyVerified) {
    // Facteur enrôlé mais pas encore validé sur cette session.
    return pathname === "/admin/challenge"
      ? response
      : NextResponse.redirect(new URL("/admin/challenge", request.url));
  }

  // aal2 pleinement atteint : ces écrans n'ont plus lieu d'être visités.
  if (pathname === "/admin/setup-2fa" || pathname === "/admin/challenge") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
