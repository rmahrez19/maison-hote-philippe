import Image from "next/image";
import Reveal from "@/components/aman/Reveal";

interface Room {
  name: string;
  specs: string[];
  description: string;
  image: { src: string; alt: string };
}

const ROOMS: Room[] = [
  {
    name: "La Suite Privative Vue Seine",
    specs: [
      "Grand lit double (180 cm)",
      "Salle de bains privative",
      "Penderie",
      "Vue panoramique sur le fleuve",
    ],
    description:
      "Un cocon intimiste à hauteur d'eau, baigné de lumière naturelle au réveil.",
    image: {
      src: "/photos/chambre-1.jpg",
      alt: "La Suite Privative Vue Seine",
    },
  },
  {
    name: "La Cabine Panoramique",
    specs: [
      "Grand lit double (160 cm)",
      "Salle de bains partagée d'exception",
      "Accès terrasse",
      "Vue Seine",
    ],
    description:
      "Confort brut et ligne épurée pour une immersion totale dans la quiétude du parc nautique.",
    image: {
      src: "/photos/chambre-2.jpg",
      alt: "La Cabine Panoramique",
    },
  },
];

/**
 * Les deux résidences réelles, présentées comme deux cartes d'exception
 * épurées — image en premier plan, spécifications discrètes, une phrase
 * qui pose l'atmosphère plutôt qu'une liste d'équipements.
 */
export default function Residences() {
  return (
    <section
      id="residences"
      className="mx-auto max-w-7xl scroll-mt-24 px-6 py-24 md:px-16 md:py-32"
    >
      <Reveal>
        <p className="text-[11px] font-light uppercase tracking-[0.3em] text-stone-400">
          02 — Résidences
        </p>
        <h2 className="mt-6 max-w-md font-serif text-4xl font-light leading-tight text-stone-900 md:text-5xl">
          Deux résidences, une même quiétude
        </h2>
      </Reveal>

      <div className="mt-16 grid gap-12 md:grid-cols-2 md:gap-10">
        {ROOMS.map((room, i) => (
          <Reveal key={room.name} delay={i * 0.12} as="article">
            <div className="group relative aspect-[4/5] w-full overflow-hidden bg-stone-100">
              <Image
                src={room.image.src}
                alt={room.image.alt}
                fill
                sizes="(min-width: 768px) 45vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
            <h3 className="mt-8 font-serif text-2xl font-light text-stone-900 md:text-3xl">
              {room.name}
            </h3>
            <p className="mt-4 text-[11px] font-light uppercase tracking-[0.15em] text-stone-400">
              {room.specs.join(" · ")}
            </p>
            <p className="mt-5 max-w-md text-sm font-light leading-relaxed text-stone-600">
              {room.description}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
