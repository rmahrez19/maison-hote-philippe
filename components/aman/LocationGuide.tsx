"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Reveal from "@/components/aman/Reveal";

interface Place {
  name: string;
  distance: string;
}

interface Column {
  label: string;
  places: Place[];
}

// Données réelles (distances de la fiche Booking.com de l'établissement),
// sélectionnées et regroupées par thème plutôt que listées en vrac —
// l'esprit carnet de voyage plutôt que fiche technique.
const COLUMNS: Column[] = [
  {
    label: "Patrimoine & Nature",
    places: [
      { name: "Domaine National de Saint-Cloud", distance: "1,2 km" },
      { name: "Jardin Bellini", distance: "1,6 km" },
      { name: "Parc de Saint-Cloud", distance: "2,3 km" },
      { name: "Bois des Capucins", distance: "2,6 km" },
    ],
  },
  {
    label: "Tables & Cafés",
    places: [
      { name: "Le Cap Seguin", distance: "1,6 km" },
      { name: "A Bicyclette", distance: "1,7 km" },
      { name: "Lamal", distance: "1,7 km" },
    ],
  },
  {
    label: "Paris en un regard",
    places: [
      { name: "Tour Eiffel", distance: "7 km" },
      { name: "Arc de Triomphe", distance: "8 km" },
      { name: "Château de Versailles", distance: "9 km" },
      { name: "Musée d'Orsay", distance: "10 km" },
      { name: "Musée du Louvre", distance: "12 km" },
    ],
  },
];

// Courbe d'accélération douce (ease-in-out prononcée), commune à l'ouverture
// du panneau et à la rotation du signe +/− : les deux animations se lisent
// comme un seul geste plutôt que deux effets superposés.
const EASE = [0.65, 0, 0.35, 1] as const;

// Chaque ligne du carnet apparaît un peu après la précédente une fois le
// panneau ouvert, plutôt que de s'afficher toutes en même temps.
const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
};

function AccordionItem({
  column,
  isOpen,
  onToggle,
}: {
  column: Column;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-t border-stone-200/60 first:border-t-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-6 py-6 text-left"
      >
        <span className="font-serif text-xl font-light text-stone-900 md:text-2xl">
          {column.label}
        </span>
        {/* Le signe pivote de 45° (+ devient ×) au lieu d'un chevron qui se
            retourne : plus discret, dans l'esprit typographique du reste
            du site. */}
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="shrink-0 text-2xl font-extralight text-stone-400"
          aria-hidden
        >
          +
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-hidden"
          >
            <motion.ul
              className="pb-6"
              initial="hidden"
              animate="visible"
              variants={listVariants}
            >
              {column.places.map((place) => (
                <motion.li
                  key={place.name}
                  variants={rowVariants}
                  className="flex items-baseline justify-between gap-4 border-t border-stone-200/40 py-3.5 first:border-t-0"
                >
                  <span className="font-serif text-base text-stone-800">
                    {place.name}
                  </span>
                  <span className="shrink-0 text-xs font-light tracking-wide text-stone-400">
                    {place.distance}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Carnet des alentours, façon conciergerie de luxe : les données réelles de
 * la fiche Booking.com de l'établissement, choisies et classées par thème.
 * Chaque thème est un accordéon indépendant (plusieurs peuvent être ouverts
 * à la fois) qui se déplie avec une animation de hauteur fluide plutôt
 * qu'une longue liste affichée d'un bloc. Positionné juste au-dessus du
 * footer.
 */
export default function LocationGuide() {
  const [openLabels, setOpenLabels] = useState<Set<string>>(new Set());

  function toggle(label: string) {
    setOpenLabels((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }

  return (
    <section
      id="alentours"
      className="mx-auto max-w-7xl scroll-mt-24 px-6 py-24 md:px-16 md:py-32"
    >
      <Reveal>
        <p className="text-[11px] font-light uppercase tracking-[0.3em] text-stone-400">
          05 — Alentours
        </p>
        <h2 className="mt-6 max-w-xl font-serif text-4xl font-light leading-tight text-stone-900 md:text-5xl">
          Tout est à portée de Seine
        </h2>
        <p className="mt-6 max-w-md text-sm font-light leading-relaxed text-stone-600">
          Le quartier se découvre à pied ou à vélo ; Paris, lui, se rejoint en
          un souffle.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mt-16 max-w-2xl border-b border-stone-200/60">
        {COLUMNS.map((column) => (
          <AccordionItem
            key={column.label}
            column={column}
            isOpen={openLabels.has(column.label)}
            onToggle={() => toggle(column.label)}
          />
        ))}
      </Reveal>

      <Reveal delay={0.2}>
        <p className="mt-10 max-w-2xl text-sm font-light leading-relaxed text-stone-500">
          Mobilité — Métro Pont de Sèvres à 1,3 km, gare de Saint-Cloud à
          1,8 km. Aéroports d&apos;Orly (20 km) et de Roissy&#8209;Charles-de-
          Gaulle (32 km).
        </p>
      </Reveal>
    </section>
  );
}
