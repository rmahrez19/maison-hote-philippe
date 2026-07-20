import SmartHeader from "@/components/SmartHeader";
import BookingNode from "@/components/BookingNode";

export default function BookPage() {
  return (
    <>
      <SmartHeader />
      <main className="flex-1 px-6 pb-24 pt-32 md:px-12 md:pt-40">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-200/60">
            Réservation
          </p>
          <h1 className="mt-4 font-serif text-5xl text-slate-100 md:text-6xl">
            Choisissez vos nuits à bord
          </h1>
          <p className="mt-6 max-w-xl text-slate-400">
            Deux chambres, deux ambiances — sélectionnez la vôtre, puis vos
            dates. Le tarif exact s&apos;affiche jour par jour.
          </p>
          <div className="mt-16">
            <BookingNode />
          </div>
        </div>
      </main>
    </>
  );
}
