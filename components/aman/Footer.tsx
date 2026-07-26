import Link from "next/link";

const NAV_COLUMN = [
  { href: "/#sejours", label: "Séjours" },
  { href: "/#residences", label: "Résidences" },
  { href: "/#experiences", label: "Expériences" },
  { href: "/#journal", label: "Journal" },
];

const INFO_COLUMN = [
  { href: "#", label: "Mentions légales" },
  { href: "#", label: "Conditions générales" },
  { href: "#", label: "Confidentialité" },
  { href: "#", label: "Contact" },
];

/**
 * Pied de page façon hôtel de luxe : fond sombre doux, colonnes très
 * alignées, newsletter discrète (visuelle uniquement pour l'instant).
 */
export default function Footer() {
  return (
    <footer className="bg-stone-900 px-6 py-20 text-stone-300 md:px-16">
      <div className="mx-auto grid max-w-7xl gap-14 md:grid-cols-4 md:gap-8">
        <div>
          <span className="font-serif text-lg uppercase tracking-[0.3em] text-stone-50">
            Megalight II
          </span>
          <p className="mt-6 max-w-[220px] text-sm font-light leading-relaxed text-stone-400">
            Maison flottante amarrée sur la Seine, aux portes de Paris.
          </p>
        </div>

        <div>
          <p className="text-[11px] font-light uppercase tracking-[0.25em] text-stone-500">
            Navigation
          </p>
          <ul className="mt-6 space-y-3">
            {NAV_COLUMN.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm font-light text-stone-300 transition-colors hover:text-stone-50"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-light uppercase tracking-[0.25em] text-stone-500">
            Informations
          </p>
          <ul className="mt-6 space-y-3">
            {INFO_COLUMN.map(({ href, label }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="text-sm font-light text-stone-300 transition-colors hover:text-stone-50"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-light uppercase tracking-[0.25em] text-stone-500">
            Correspondance
          </p>
          <p className="mt-6 max-w-[240px] text-sm font-light leading-relaxed text-stone-400">
            Recevez, avec discrétion, quelques nouvelles de la maison.
          </p>
          <div className="mt-5 flex items-end gap-3 border-b border-stone-700 pb-2">
            <span className="flex-1 text-sm font-light text-stone-500">
              Votre email
            </span>
            <span className="text-[11px] font-light uppercase tracking-[0.2em] text-stone-300">
              Envoyer
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-16 flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-stone-700 pt-8 text-xs font-light text-stone-500">
        <span>
          Parc Nautique de l&apos;Île de Monsieur — 16 rue de Saint-Cloud,
          92310 Sèvres
        </span>
        <span>© {new Date().getFullYear()} — Tous droits réservés</span>
      </div>
    </footer>
  );
}
