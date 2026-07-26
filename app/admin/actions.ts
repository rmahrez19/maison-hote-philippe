"use server";

import { redirect } from "next/navigation";
import { getSupabaseAuthServer } from "@/lib/supabase-auth-server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { isAllowedAdminEmail, requireAal2 } from "@/lib/admin-auth";
import { isRoomId } from "@/lib/rooms";
import { runSync } from "@/lib/sync";

const GENERIC_LOGIN_ERROR = "Identifiants invalides.";

/**
 * Connexion par mot de passe (étape 1/2). L'email est vérifié contre
 * l'allowlist AVANT tout appel à Supabase, avec le même message
 * générique qu'un mauvais mot de passe — impossible de deviner par
 * essais successifs quelles adresses sont légitimes.
 */
export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!isAllowedAdminEmail(email) || !password) {
    return { error: GENERIC_LOGIN_ERROR };
  }

  const supabase = await getSupabaseAuthServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: GENERIC_LOGIN_ERROR };
  }

  // Le middleware décide de la suite (setup-2fa / challenge / dashboard)
  // selon le niveau AAL réellement atteint.
  redirect("/admin");
}

export async function logout() {
  const supabase = await getSupabaseAuthServer();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/**
 * Génère un nouveau facteur TOTP (QR code + clé secrète) pour
 * l'utilisateur courant. Si un facteur non vérifié traîne d'une
 * tentative précédente (page rechargée avant validation), il est
 * d'abord retiré pour repartir sur un QR code propre.
 */
export async function enrollFactor() {
  const supabase = await getSupabaseAuthServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Session expirée, reconnectez-vous." };

  // Les tableaux typés par type ("totp", …) ne contiennent QUE les
  // facteurs déjà vérifiés ; un facteur en attente d'une tentative
  // précédente n'apparaît que dans `all`.
  const { data: factorsData } = await supabase.auth.mfa.listFactors();
  const stale = factorsData?.all.find(
    (f) => f.factor_type === "totp" && f.status === "unverified"
  );
  if (stale) {
    await supabase.auth.mfa.unenroll({ factorId: stale.id });
  }

  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
  if (error || !data) {
    return { error: error?.message ?? "Impossible de générer le QR code." };
  }

  return {
    data: {
      factorId: data.id,
      qrSvg: data.totp.qr_code,
      secret: data.totp.secret,
    },
  };
}

/** Valide le code à 6 chiffres et élève la session en aal2. */
export async function verifyEnrollment(factorId: string, code: string) {
  const supabase = await getSupabaseAuthServer();

  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
    factorId,
  });
  if (challengeError || !challenge) {
    return { error: "Échec de la vérification, réessayez." };
  }

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code: code.trim(),
  });
  if (verifyError) {
    return { error: "Code invalide." };
  }

  return { ok: true };
}

/** Défi MFA des connexions ultérieures (facteur déjà enrôlé et vérifié). */
export async function verifyChallenge(code: string) {
  const supabase = await getSupabaseAuthServer();

  // `totp` ne contient que les facteurs déjà vérifiés (voir enrollFactor).
  const { data: factorsData } = await supabase.auth.mfa.listFactors();
  const factor = factorsData?.totp[0];
  if (!factor) {
    return { error: "Aucun facteur configuré." };
  }

  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
    factorId: factor.id,
  });
  if (challengeError || !challenge) {
    return { error: "Échec de la vérification, réessayez." };
  }

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId: factor.id,
    challengeId: challenge.id,
    code: code.trim(),
  });
  if (verifyError) {
    return { error: "Code invalide." };
  }

  return { ok: true };
}

/** Force la synchro iCal des deux chambres (relais du bouton admin). */
export async function forceSyncAction() {
  if (!(await requireAal2())) return { error: "Non autorisé." };
  return runSync();
}

/**
 * Bloque manuellement une date pour une chambre : insère un bloc
 * d'une nuit dans `synced_bookings` avec source='manual', ce qui le
 * fait apparaître automatiquement dans toute la logique de
 * disponibilité existante (calendrier public, vérif serveur) sans
 * dupliquer aucune règle.
 *
 * Revérifie l'aal2 explicitement (défense en profondeur) : cette action
 * passe par getSupabaseAdmin() (clé service_role), qui bypasse tout le
 * reste — elle ne doit jamais dépendre uniquement du proxy pour rester
 * inaccessible aux appels non authentifiés.
 */
export async function blockDate(roomId: string, date: string) {
  if (!(await requireAal2())) return { error: "Non autorisé." };
  if (!isRoomId(roomId)) return { error: "Chambre invalide." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Date invalide." };

  const checkOut = new Date(date + "T00:00:00");
  checkOut.setDate(checkOut.getDate() + 1);
  const checkOutStr = checkOut.toISOString().slice(0, 10);

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("synced_bookings").insert({
    room_id: roomId,
    external_id: `manual-${roomId}-${date}-${crypto.randomUUID()}`,
    check_in: date,
    check_out: checkOutStr,
    source: "manual",
    synced_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };
  return { ok: true };
}

/** Retire un blocage manuel (n'affecte jamais les blocs Booking.com). */
export async function unblockDate(id: string) {
  if (!(await requireAal2())) return { error: "Non autorisé." };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("synced_bookings")
    .delete()
    .eq("id", id)
    .eq("source", "manual");

  if (error) return { error: error.message };
  return { ok: true };
}

/**
 * Confirme une réservation directe (pending → confirmed).
 *
 * TODO (dès que le token de la Connectivity API Booking.com est
 * disponible) : pousser cette confirmation à Booking.com ici pour
 * bloquer les dates côté leur inventaire sans attendre le prochain
 * refresh de l'export iCal (`GET /api/calendar/export`), qui reste
 * pour l'instant le seul mécanisme de blocage côté Booking.com. La
 * confirmation locale ne doit jamais être bloquée par un échec de cet
 * appel une fois branché — best-effort, à consigner pour visibilité
 * admin plutôt qu'à faire échouer toute l'action.
 */
export async function confirmBooking(bookingId: string) {
  if (!(await requireAal2())) return { error: "Non autorisé." };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("room_bookings")
    .update({ status: "confirmed" })
    .eq("id", bookingId);

  if (error) return { error: error.message };
  return { ok: true };
}

/** Refuse/annule une réservation directe (pending ou confirmed → cancelled). */
export async function cancelBooking(bookingId: string) {
  if (!(await requireAal2())) return { error: "Non autorisé." };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("room_bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId);

  if (error) return { error: error.message };
  return { ok: true };
}
