import Image from "next/image";
import Reveal from "@/components/aman/Reveal";

/**
 * Rupture éditoriale plein cadre : image immersive avec citation centrée,
 * pause visuelle entre deux sections texte/image (motif récurrent des
 * sites de maisons de luxe). Ici, un vrai avis client, mis en valeur
 * comme une citation éditoriale plutôt qu'un encart d'avis classique.
 */
export default function QuoteBreak() {
  return (
    <section className="relative flex h-[70vh] min-h-[480px] w-full items-center justify-center overflow-hidden">
      <Image
        src="/photos/seine-nuit.jpg"
        alt="La Seine la nuit, vue depuis la maison flottante"
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-stone-950/45" />
      <blockquote className="relative max-w-2xl px-6 text-center">
        <Reveal>
          <p className="font-serif text-3xl font-light italic leading-relaxed text-stone-50 md:text-4xl">
            « On se sent comme à la maison, loin du cadre informel de
            l&apos;hôtel. Le luxe, ici, se mesure au calme et à la beauté de
            la Seine. »
          </p>
          <footer className="mt-6 text-[11px] font-light uppercase tracking-[0.25em] text-stone-100/70">
            Avis client — 9,5 / 10
          </footer>
        </Reveal>
      </blockquote>
    </section>
  );
}
