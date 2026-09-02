/**
 * Coordonnées de contact direct, utilisées tant que la réservation en ligne
 * n'est pas ouverte au public (page /reservation-contact).
 *
 * Un seul endroit à modifier : `DEFAULT_PHONE` ci-dessous, ou la variable
 * d'environnement `NEXT_PUBLIC_CONTACT_PHONE` (qui a la priorité) pour
 * changer le numéro sans redéployer le code. Le numéro doit être au format
 * international E.164 : +33 suivi des 9 chiffres, sans espace ni zéro
 * initial (06 12 34 56 78 → +33612345678).
 */

// Numéro de Philippe (06 63 14 49 99).
const DEFAULT_PHONE = "+33663144999";

const RAW_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim() || DEFAULT_PHONE;

/** Numéro E.164 nettoyé de tout séparateur : "+33612345678". */
const PHONE_E164 = `+${RAW_PHONE.replace(/[^\d]/g, "")}`;

/** Même numéro sans le "+", format attendu par wa.me : "33612345678". */
const PHONE_DIGITS = PHONE_E164.slice(1);

/** Message pré-rempli à l'ouverture de WhatsApp. */
const WHATSAPP_MESSAGE = "Bonjour, je souhaite réserver une chambre";

/**
 * Affichage à la française : "+33612345678" → "06 12 34 56 78".
 * Tout autre indicatif est affiché tel quel, groupé par deux chiffres.
 */
function formatForDisplay(e164: string): string {
  const digits = e164.slice(1);
  const national = digits.startsWith("33") ? `0${digits.slice(2)}` : digits;
  return national.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}

export const CONTACT = {
  /** Numéro brut, format international. */
  phone: PHONE_E164,
  /** Numéro formaté pour l'affichage à l'écran. */
  phoneDisplay: formatForDisplay(PHONE_E164),
  /** Lien d'appel direct. */
  telHref: `tel:${PHONE_E164}`,
  /** Lien SMS classique. */
  smsHref: `sms:${PHONE_E164}`,
  /** Lien WhatsApp avec message pré-rempli. */
  whatsappHref: `https://wa.me/${PHONE_DIGITS}?text=${encodeURIComponent(
    WHATSAPP_MESSAGE
  )}`,
} as const;
