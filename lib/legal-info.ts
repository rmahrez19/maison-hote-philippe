export type TvaMode = "franchise" | "applicable";

/**
 * Identité légale utilisée sur les devis/factures générés dans /admin.
 * Placeholders à remplir par Philippe lui-même — jamais de numéro
 * SIREN ni de régime de TVA inventé côté développeur.
 *
 * Régime de TVA : par défaut "franchise" (mention légale, pas de ligne
 * TVA), le cas le plus courant pour une activité individuelle de cette
 * taille. À confirmer avec son comptable avant de passer sur
 * "applicable" — facturer une TVA sans en être redevable est un risque
 * plus grave que l'inverse.
 */
export const LEGAL_INFO = {
  hostName: "Philippe Audoin", // TODO Philippe : nom légal exact si différent (raison sociale)
  address:
    "16 rue de Saint-Cloud, Parc Nautique de l'Île de Monsieur, 92310 Sèvres",
  siren: "SIREN À RENSEIGNER", // TODO Philippe : numéro SIREN (Kbis / répertoire Sirene)
  tourismLicence: "9207200006155",
  email: "philippeaudoin@gmail.com",
  tva: {
    mode: "franchise" as TvaMode, // "franchise" | "applicable" — TODO Philippe : à confirmer
    rate: 10, // % — utilisé uniquement si mode === "applicable"
    franchiseMention: "TVA non applicable, art. 293 B du CGI",
  },
};
