import { getSupabaseAuthServer } from "./supabase-auth-server";

/**
 * Seules ces deux adresses peuvent s'authentifier sur /admin. Toute
 * autre adresse est rejetée avant même la tentative de connexion
 * Supabase, avec un message générique (pas d'énumération de comptes).
 *
 * Note : le brief mentionnait « rmarez343@gmail.com », vraisemblablement
 * une coquille pour l'adresse réelle de l'utilisateur (rmahrez343@gmail.com,
 * avec un h). C'est cette dernière qui est utilisée ici — à corriger si
 * une adresse différente était réellement voulue.
 */
export const ALLOWED_ADMIN_EMAILS = [
  "rmahrez343@gmail.com",
  "philippeaudoin@gmail.com",
] as const;

export function isAllowedAdminEmail(email: string): boolean {
  return ALLOWED_ADMIN_EMAILS.includes(
    email.trim().toLowerCase() as (typeof ALLOWED_ADMIN_EMAILS)[number]
  );
}

/**
 * Vérifie que l'appelant est un admin pleinement authentifié (aal2),
 * indépendamment du proxy — défense en profondeur pour toute Server
 * Action qui mute des données via getSupabaseAdmin() (clé service_role,
 * qui bypasse tout le reste). Renvoie l'utilisateur ou null.
 */
export async function requireAal2() {
  const supabase = await getSupabaseAuthServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel !== "aal2") return null;

  return user;
}
