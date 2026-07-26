import Image from "next/image";
import Reveal from "@/components/aman/Reveal";

interface Experience {
  image: { src: string; alt: string };
  title: string;
  note: string;
}

const EXPERIENCES: Experience[] = [
  {
    image: {
      src: "/photos/salon.jpg",
      alt: "Le salon panoramique, petit-déjeuner face à la Seine",
    },
    title: "Gastronomie du Matin",
    note: "Petit-déjeuner continental d'exception servi face aux reflets de la Seine.",
  },
  {
    image: {
      src: "/photos/rooftop.jpg",
      alt: "La terrasse, bien exposée sur le fleuve",
    },
    title: "Bien-être & Sérénité",
    note: "Massages corporels sur demande et cours de yoga au fil de l'eau.",
  },
  {
    image: {
      src: "/photos/bain.jpg",
      alt: "Côté jardin, l'esprit du bord",
    },
    title: "Écrin de Nature",
    note: "Accès immédiat au Parc de Saint-Cloud, terrasses et jardins verdoyants.",
  },
  {
    image: {
      src: "/photos/seine-crepuscule.jpg",
      alt: "La Seine et les rives illuminées, au crépuscule",
    },
    title: "Emplacement Privilégié",
    note: "À 20 min à pied de La Seine Musicale, accès direct au Parc des Princes, Versailles et Paris via M9 / T2.",
  },
];

/**
 * Grille de découverte : cartes minimalistes, image en premier plan et
 * légende discrète en dessous — pas d'effet lourd, un léger zoom au survol.
 */
export default function ExperienceGrid() {
  return (
    <section
      id="experiences"
      className="mx-auto max-w-7xl scroll-mt-24 px-6 py-24 md:px-16 md:py-32"
    >
      <Reveal>
        <p className="text-[11px] font-light uppercase tracking-[0.3em] text-stone-400">
          03 — Expériences & Environnement
        </p>
        <h2 className="mt-6 max-w-md font-serif text-4xl font-light leading-tight text-stone-900 md:text-5xl">
          Ce qui compose un séjour
        </h2>
      </Reveal>

      <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {EXPERIENCES.map((exp, i) => (
          <Reveal
            key={exp.title}
            as="article"
            delay={i * 0.1}
            className="group transition-transform duration-500 ease-out hover:-translate-y-1"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100">
              <Image
                src={exp.image.src}
                alt={exp.image.alt}
                fill
                sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
            <h3 className="mt-6 font-serif text-2xl font-light text-stone-900">
              {exp.title}
            </h3>
            <p className="mt-2 text-sm font-light text-stone-500">
              {exp.note}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
