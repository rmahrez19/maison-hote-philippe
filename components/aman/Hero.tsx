"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

// Chaque ligne apparaît un peu après la précédente (fondu + léger
// glissement vers le haut) : la lecture se fait dans l'ordre naturel,
// eyebrow → titre → sous-titre → appel à l'action, sans que rien ne
// clignote d'un coup à l'arrivée sur la page.
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16, delayChildren: 0.3 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

/**
 * Hero plein écran façon maison de luxe : visuel immersif, voile sombre
 * pour la lisibilité, titre éditorial centré, indication de défilement.
 * Le visuel est la photo réelle de la maison flottante, retouchée en
 * lumière de coucher de soleil. Au chargement, la photo se pose (léger
 * zoom arrière + fondu) puis le texte apparaît ligne par ligne.
 */
export default function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative flex h-svh min-h-[640px] w-full items-center justify-center overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={reduceMotion ? false : { scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: EASE }}
      >
        <Image
          src="/photos/hero.jpg"
          alt="La maison flottante Megalight II, amarrée sur la Seine au coucher du soleil"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-black/20" />

      <motion.div
        className="relative mx-auto flex max-w-3xl flex-col items-center px-6 text-center"
        initial={reduceMotion ? false : "hidden"}
        animate="show"
        variants={reduceMotion ? undefined : container}
      >
        <motion.p
          variants={item}
          className="text-[11px] font-light uppercase tracking-[0.35em] text-stone-100/85"
        >
          Sèvres — Au fil de la Seine
        </motion.p>
        <motion.h1
          variants={item}
          className="mt-8 font-serif text-6xl font-light leading-[1.05] text-stone-50 md:text-8xl"
        >
          Le Temps Suspendu
        </motion.h1>
        <motion.p
          variants={item}
          className="mt-8 max-w-md text-sm font-light leading-relaxed text-stone-100/85 md:text-base"
        >
          Une maison flottante d&apos;exception aux portes de Paris, où
          l&apos;eau, la lumière et le silence façonnent chaque instant.
        </motion.p>
        <motion.div variants={item} className="mt-12">
          <Link
            href="#sejours"
            className="border-b border-stone-50/50 pb-1 text-[11px] font-light uppercase tracking-[0.28em] text-stone-50 transition-colors hover:border-stone-50"
          >
            Découvrir la maison
          </Link>
        </motion.div>
      </motion.div>

      <div className="absolute inset-x-0 bottom-10 flex justify-center">
        <span className="flex h-10 w-6 items-start justify-center rounded-full border border-stone-50/50 p-1.5">
          <span className="h-1.5 w-px animate-pulse bg-stone-50/80" />
        </span>
      </div>
    </section>
  );
}
