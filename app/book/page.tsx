import Header from "@/components/aman/Header";
import Footer from "@/components/aman/Footer";
import Reveal from "@/components/aman/Reveal";
import BookingNode from "@/components/BookingNode";

/**
 * Page de réservation, alignée sur la DA Aman du reste du site : même
 * header/footer, même grammaire typographique et même grammaire
 * d'animation (Reveal). La logique de réservation (BookingNode et ses
 * sous-composants) est inchangée — seul l'habillage visuel a été
 * reconnecté au nouveau design.
 */
export default function BookPage() {
  return (
    <>
      <Header forceSolid />
      <main className="flex-1 bg-stone-50 px-6 pb-24 pt-32 md:px-16 md:pt-40">
        <div className="mx-auto max-w-6xl">
          <Reveal className="max-w-xl">
            <p className="text-[11px] font-light uppercase tracking-[0.3em] text-stone-400">
              06 — Séjour & Réservation
            </p>
            <h1 className="mt-6 font-serif text-5xl font-light leading-tight text-stone-900 md:text-6xl">
              Réservez votre séjour
            </h1>
            <p className="mt-6 text-sm font-light leading-relaxed text-stone-600 md:text-base">
              Le temps s&apos;arrête pour la durée d&apos;un séjour.
              Choisissez votre résidence, vos dates, et laissez le fleuve
              faire le reste.
            </p>
          </Reveal>

          <div className="mt-16">
            <BookingNode />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
