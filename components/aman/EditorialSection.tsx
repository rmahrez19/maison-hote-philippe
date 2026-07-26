import Image from "next/image";
import Reveal from "@/components/aman/Reveal";

interface Props {
  id?: string;
  eyebrow: string;
  title: string;
  paragraphs: string[];
  image: { src: string; alt: string };
  /** Côté de l'image ; le bloc de texte occupe l'autre colonne. */
  imageSide: "left" | "right";
}

/**
 * Bloc éditorial asymétrique image / texte, réutilisable des deux côtés
 * (alternance). L'image déborde légèrement de la grille (marges négatives
 * en desktop) pour casser la symétrie stricte, dans l'esprit d'une mise en
 * page de maison de luxe. Au scroll, l'image glisse depuis son côté pendant
 * que le texte entre en fondu, légèrement décalé dans le temps.
 */
export default function EditorialSection({
  id,
  eyebrow,
  title,
  paragraphs,
  image,
  imageSide,
}: Props) {
  const imageFirst = imageSide === "left";

  return (
    <section
      id={id}
      className="mx-auto grid max-w-7xl scroll-mt-24 gap-12 px-6 py-24 md:grid-cols-2 md:gap-20 md:px-16 md:py-32"
    >
      <Reveal
        x={imageFirst ? -32 : 32}
        y={0}
        duration={1}
        className={`relative aspect-[4/5] w-full overflow-hidden bg-stone-100 ${
          imageFirst
            ? "md:order-1 md:-ml-6 lg:-ml-12"
            : "md:order-2 md:-mr-6 lg:-mr-12"
        }`}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 768px) 45vw, 100vw"
          className="object-cover"
        />
      </Reveal>

      <Reveal
        delay={0.15}
        className={`flex flex-col justify-center ${
          imageFirst ? "md:order-2" : "md:order-1"
        }`}
      >
        <p className="text-[11px] font-light uppercase tracking-[0.3em] text-stone-400">
          {eyebrow}
        </p>
        <h2 className="mt-6 max-w-md font-serif text-4xl font-light leading-tight text-stone-900 md:text-5xl">
          {title}
        </h2>
        <div className="mt-8 max-w-md space-y-5">
          {paragraphs.map((p) => (
            <p
              key={p}
              className="text-sm font-light leading-relaxed text-stone-600 md:text-[15px]"
            >
              {p}
            </p>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
