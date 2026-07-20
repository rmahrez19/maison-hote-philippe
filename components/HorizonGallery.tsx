"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

interface Slide {
  src: string;
  label: string;
  note: string;
  /** Proportions volontairement inégales, façon éditorial. */
  sizeClass: string;
}

const SLIDES: Slide[] = [
  {
    src: "/photos/peniche-nuit.jpg",
    label: "La maison flottante, la nuit",
    note: "Amarrée au parc nautique",
    sizeClass: "aspect-[3/4] w-[62vw] md:w-[24rem]",
  },
  {
    src: "/photos/salon.jpg",
    label: "Le salon panoramique",
    note: "Le petit-déjeuner face à la Seine",
    sizeClass: "aspect-[4/3] w-[78vw] md:w-[34rem]",
  },
  {
    src: "/photos/chambre-1.jpg",
    label: "Première chambre",
    note: "La Seine depuis le lit",
    sizeClass: "aspect-[4/3] w-[62vw] md:w-[26rem]",
  },
  {
    src: "/photos/rooftop.jpg",
    label: "La terrasse",
    note: "Bien exposée, sur le fleuve",
    sizeClass: "aspect-[16/9] w-[78vw] md:w-[40rem]",
  },
  {
    src: "/photos/chambre-2.jpg",
    label: "Deuxième chambre",
    note: "Tête de lit sombre, bois clair",
    sizeClass: "aspect-[4/3] w-[62vw] md:w-[26rem]",
  },
  {
    src: "/photos/bain.jpg",
    label: "Côté jardin",
    note: "L'esprit du bord, ciel ouvert",
    sizeClass: "aspect-square w-[62vw] md:w-[22rem]",
  },
  {
    src: "/photos/seine-nuit.jpg",
    label: "La Seine, la nuit",
    note: "Les reflets du port endormi",
    sizeClass: "aspect-[3/4] w-[62vw] md:w-[24rem]",
  },
];

/**
 * Galerie horizontale « ligne d'horizon ». Au desktop, la molette verticale
 * est détournée vers le défilement horizontal ; arrivé en butée (début ou
 * fin), le piège se relâche et la page reprend son défilement naturel.
 */
export default function HorizonGallery() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    // React attache `onWheel` en passif : l'écouteur natif est requis
    // pour pouvoir appeler preventDefault().
    function onWheel(e: WheelEvent) {
      if (!el) return;
      // Un pan horizontal de trackpad défile déjà nativement.
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;

      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;

      const goingRight = e.deltaY > 0;
      const atStart = el.scrollLeft <= 0;
      const atEnd = el.scrollLeft >= max - 1;
      // En butée : on rend la main au défilement vertical de la page.
      if ((goingRight && atEnd) || (!goingRight && atStart)) return;

      e.preventDefault();
      el.scrollLeft += e.deltaY;
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div
      ref={trackRef}
      className="flex gap-5 overflow-x-auto scrollbar-none px-6 md:gap-8 md:px-12"
    >
      {SLIDES.map((slide, i) => (
        <figure key={slide.label} className="shrink-0">
          <div
            className={`relative overflow-hidden border border-slate-800 bg-slate-900 ${slide.sizeClass}`}
          >
            <Image
              src={slide.src}
              alt={slide.label}
              fill
              sizes="(min-width: 768px) 40rem, 78vw"
              className="object-cover"
            />
          </div>
          <figcaption className="mt-4 flex items-baseline gap-4">
            <span className="font-mono text-[10px] tracking-[0.25em] text-amber-200/60">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>
              <span className="font-serif text-xl text-slate-100">
                {slide.label}
              </span>
              <span className="ml-3 hidden text-xs text-slate-500 sm:inline">
                {slide.note}
              </span>
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
