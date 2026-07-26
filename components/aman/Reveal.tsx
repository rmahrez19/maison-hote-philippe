"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Délai avant le début de l'animation, pour échelonner plusieurs Reveal. */
  delay?: number;
  /** Décalage vertical de départ (px) — 0 pour désactiver. */
  y?: number;
  /** Décalage horizontal de départ (px) — utile pour les images qui glissent
      depuis leur côté plutôt que de simplement apparaître. */
  x?: number;
  duration?: number;
  /** Élément HTML rendu (article, li, div…) — pour garder la sémantique
      d'origine du bloc englobé. */
  as?: "div" | "article" | "li" | "section";
}

// Courbe douce type "ease-out-expo" : démarrage franc, arrivée très
// progressive — c'est elle qui donne le sentiment de calme/luxe plutôt
// qu'un rebond mécanique.
const EASE = [0.16, 1, 0.3, 1] as const;

const MOTION_TAGS = {
  div: motion.div,
  article: motion.article,
  li: motion.li,
  section: motion.section,
} as const;

/**
 * Révélation progressive au scroll (fade + léger déplacement), utilisée
 * pour faire entrer les blocs de contenu dès qu'ils atteignent le
 * viewport. Respecte `prefers-reduced-motion` : l'animation est
 * simplement désactivée, le contenu reste visible sans délai.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  x = 0,
  duration = 0.8,
  as = "div",
}: RevealProps) {
  const reduceMotion = useReducedMotion();
  const Tag = as;

  if (reduceMotion) {
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = MOTION_TAGS[as];

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </MotionTag>
  );
}
