import Link from "next/link";
import Header from "@/components/aman/Header";
import Hero from "@/components/aman/Hero";
import EditorialSection from "@/components/aman/EditorialSection";
import Residences from "@/components/aman/Residences";
import QuoteBreak from "@/components/aman/QuoteBreak";
import ExperienceGrid from "@/components/aman/ExperienceGrid";
import PracticalInfo from "@/components/aman/PracticalInfo";
import LocationGuide from "@/components/aman/LocationGuide";
import Footer from "@/components/aman/Footer";
import Reveal from "@/components/aman/Reveal";

/**
 * Landing page Megalight II : gabarit "maison de luxe" (header transparent,
 * hero plein écran, sections asymétriques, rupture éditoriale, grille
 * d'expériences, footer), désormais avec le vrai contenu du client —
 * l'hôte, les deux résidences, un avis client, les points forts du séjour
 * et les informations pratiques. Pas de pages de détail pour l'instant :
 * tout tient sur cette landing page.
 */
export default function HomePage() {
  return (
    <>
      <Header />

      <main className="flex-1 bg-stone-50">
        <Hero />

        <EditorialSection
          id="sejours"
          eyebrow="01 — L'Art de Recevoir"
          title="La philosophie du Captain Philippe"
          paragraphs={[
            "Ancien journaliste devenu coach-thérapeute, Philippe vous ouvre les portes de son houseboat amarré au parc nautique de l'Île de Monsieur. Ici, l'hospitalité se vit en toute liberté : un petit-déjeuner continental servi face au fleuve, qui se transforme au gré des envies en café philosophique ou en doux moment de silence.",
          ]}
          image={{
            src: "/photos/peniche-nuit.jpg",
            alt: "La maison flottante Megalight II, amarrée de nuit au parc nautique",
          }}
          imageSide="left"
        />

        <Residences />

        <QuoteBreak />

        <ExperienceGrid />

        <PracticalInfo />

        <LocationGuide />

        <section className="border-t border-stone-200 px-6 py-24 text-center md:px-16 md:py-32">
          <Reveal className="mx-auto flex max-w-xl flex-col items-center">
            <p className="text-[11px] font-light uppercase tracking-[0.3em] text-stone-400">
              Réservations
            </p>
            <h2 className="mt-6 font-serif text-4xl font-light leading-tight text-stone-900 md:text-5xl">
              Choisissez vos dates
            </h2>
            <Link
              href="/book"
              className="mt-10 inline-block border-b border-stone-900/30 pb-1 text-[11px] font-light uppercase tracking-[0.28em] text-stone-900 transition-colors hover:border-stone-900"
            >
              Réserver un séjour →
            </Link>
          </Reveal>
        </section>
      </main>

      <Footer />
    </>
  );
}
