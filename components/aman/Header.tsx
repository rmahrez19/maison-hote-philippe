"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const NAV_LEFT = [
  { href: "/#sejours", label: "Séjours" },
  { href: "/#residences", label: "Résidences" },
] as const;

const NAV_RIGHT = [
  { href: "/#experiences", label: "Expériences" },
  { href: "/#journal", label: "Journal" },
] as const;

interface HeaderProps {
  /** Force l'apparence "sur fond clair" dès le chargement — pour les pages
      qui n'ouvrent pas sur un visuel plein écran sombre (ex. /book), où le
      texte blanc du header transparent serait illisible sur le fond clair. */
  forceSolid?: boolean;
}

/**
 * En-tête fixe façon hôtel de luxe : transparent sur le hero plein écran,
 * se floute et passe sur fond clair dès que l'on quitte le haut de page.
 * Logo centré, navigation répartie de part et d'autre, à l'identique de la
 * structure d'un site de maison de luxe (menu scindé + wordmark central).
 */
export default function Header({ forceSolid = false }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = forceSolid || scrolled || menuOpen;
  const tone = solid ? "text-stone-900" : "text-stone-50";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        solid
          ? "bg-stone-50/95 backdrop-blur-md border-b border-stone-200"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-3 items-center px-6 py-6 md:px-12">
        <nav className={`hidden items-center gap-10 md:flex ${tone}`}>
          {NAV_LEFT.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[11px] font-light uppercase tracking-[0.22em] opacity-80 transition-opacity hover:opacity-100"
            >
              {label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className={`justify-self-start md:hidden ${tone}`}
          aria-label="Ouvrir le menu"
          aria-expanded={menuOpen}
        >
          <span className="block h-px w-6 bg-current" />
          <span className="mt-1.5 block h-px w-6 bg-current" />
        </button>

        <Link
          href="/"
          className={`justify-self-center text-center ${tone}`}
        >
          <span className="font-serif text-xl uppercase tracking-[0.3em]">
            Megalight II
          </span>
        </Link>

        <div className="flex items-center justify-end gap-10">
          <nav className={`hidden items-center gap-10 md:flex ${tone}`}>
            {NAV_RIGHT.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-[11px] font-light uppercase tracking-[0.22em] opacity-80 transition-opacity hover:opacity-100"
              >
                {label}
              </Link>
            ))}
          </nav>
          <Link
            href="/book"
            className={`border-b pb-0.5 text-[11px] font-light uppercase tracking-[0.22em] transition-colors ${
              solid
                ? "border-stone-900/30 text-stone-900 hover:border-stone-900"
                : "border-stone-50/40 text-stone-50 hover:border-stone-50"
            }`}
          >
            Réservations
          </Link>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col items-center gap-8 border-t border-stone-200 bg-stone-50 px-6 py-10 md:hidden">
          {[...NAV_LEFT, ...NAV_RIGHT].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="text-sm uppercase tracking-[0.22em] text-stone-900"
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
