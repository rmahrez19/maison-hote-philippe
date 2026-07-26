"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Reveal from "@/components/aman/Reveal";

interface Category {
  label: string;
  items: string[];
}

// Données réelles (fiche « Équipements de l'établissement » de Booking.com),
// regroupées par thème plutôt que listées en une soixantaine de lignes —
// même logique de curation que la section Alentours.
const CATEGORIES: Category[] = [
  {
    label: "Arrivée & Adresse",
    items: [
      "Parc Nautique de l'Île de Monsieur, 16 rue de Saint-Cloud, 92310 Sèvres",
      "Check-in dès 17:00 — entrée autonome par boîtier à clés",
      "Check-out jusqu'à 10:30",
      "Enregistrement et règlement rapides",
    ],
  },
  {
    label: "Connectivité & Stationnement",
    items: [
      "Wi-Fi fibre gratuit, 141 Mb/s — streaming 4K et visioconférence à plusieurs appareils",
      "Parking sur place, 15 € / jour",
    ],
  },
  {
    label: "Chambre & Salle de bains",
    items: [
      "Linge de maison, penderie, prise près du lit",
      "Douche, articles de toilette et serviettes fournis",
      "Vue sur la Seine, sur la ville ou sur un lieu d'intérêt selon la chambre",
    ],
  },
  {
    label: "Extérieur & Jardin",
    items: [
      "Terrasse bien exposée, mobilier extérieur",
      "Jardin verdoyant, en bord de Seine",
    ],
  },
  {
    label: "Bien-être & Activités",
    items: [
      "Cours de yoga au fil de l'eau",
      "Massages sur demande (corps, dos, crânien, pieds)",
      "Randonnée, à deux pas du Parc de Saint-Cloud",
    ],
  },
  {
    label: "Bon à savoir",
    items: [
      "Établissement entièrement non-fumeurs",
      "Animaux admis sur demande (supplément possible)",
      "Anglais, espagnol et français parlés",
      "Extincteurs, détecteurs de fumée, caméras de surveillance",
    ],
  },
];

// Même grammaire d'animation que la section Alentours : ouverture/rotation
// sur une courbe douce, lignes du contenu qui apparaissent en cascade.
const EASE = [0.65, 0, 0.35, 1] as const;

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
};

function AccordionItem({
  category,
  isOpen,
  onToggle,
}: {
  category: Category;
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
          {category.label}
        </span>
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
              className="space-y-3.5 pb-6"
              initial="hidden"
              animate="visible"
              variants={listVariants}
            >
              {category.items.map((text) => (
                <motion.li
                  key={text}
                  variants={rowVariants}
                  className="flex items-baseline gap-3 text-sm font-light leading-relaxed text-stone-600"
                >
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-[#ab8a5b]" />
                  {text}
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
 * Conciergerie & équipements, façon carnet — même grammaire visuelle et
 * animée que la section Alentours (accordéons indépendants, animation de
 * hauteur fluide, lignes en cascade) plutôt que les cartes bento
 * précédentes. Données réelles issues de la fiche Booking.com de
 * l'établissement, curées par thème.
 */
export default function PracticalInfo() {
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
      id="infos"
      className="mx-auto max-w-7xl scroll-mt-24 px-6 py-24 md:px-16 md:py-32"
    >
      <Reveal>
        <p className="text-[11px] font-light uppercase tracking-[0.3em] text-stone-400">
          04 — Équipements & Conciergerie
        </p>
        <h2 className="mt-6 max-w-xl font-serif text-4xl font-light leading-tight text-stone-900 md:text-5xl">
          Ce qu&apos;il faut savoir avant de venir
        </h2>
        <p className="mt-6 max-w-md text-sm font-light leading-relaxed text-stone-600">
          Une attention portée au détail, saluée par nos hôtes — 8,8 / 10.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mt-16 max-w-2xl border-b border-stone-200/60">
        {CATEGORIES.map((category) => (
          <AccordionItem
            key={category.label}
            category={category}
            isOpen={openLabels.has(category.label)}
            onToggle={() => toggle(category.label)}
          />
        ))}
      </Reveal>
    </section>
  );
}
