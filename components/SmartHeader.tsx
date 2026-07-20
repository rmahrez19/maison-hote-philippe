"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { href: "/#peniche", label: "La maison" },
  { href: "/#galerie", label: "La visite" },
  { href: "/#cabines", label: "Chambres" },
  { href: "/#infos", label: "À savoir" },
] as const;

/**
 * En-tête fixe à double sens : il s'efface vers le haut dès que l'on descend
 * dans la page, et réapparaît au moindre pixel de remontée. Le scroll est
 * écouté en passif et throttlé via requestAnimationFrame.
 */
export default function SmartHeader() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    function onScroll() {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        // Toujours visible tant que le hero n'est pas dépassé.
        setHidden(y > lastY.current && y > 96);
        lastY.current = y;
        ticking.current = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-md transition-transform duration-300 focus-within:translate-y-0 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="group">
          <span className="font-serif text-lg tracking-wide text-slate-100">
            Megalight II
          </span>
          <span className="ml-3 hidden font-mono text-[10px] tracking-[0.25em] text-amber-200/60 sm:inline">
            48.8328 N — 2.2181 E
          </span>
        </Link>

        <nav className="flex items-center gap-6 sm:gap-8">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="hidden text-[11px] uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-slate-100 md:inline"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/book"
            className="border border-amber-200/40 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-amber-100/90 transition-colors hover:bg-amber-200/10"
          >
            Réserver
          </Link>
        </nav>
      </div>
    </header>
  );
}
