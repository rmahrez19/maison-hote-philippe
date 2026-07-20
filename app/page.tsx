import Image from "next/image";
import Link from "next/link";
import SmartHeader from "@/components/SmartHeader";
import HorizonGallery from "@/components/HorizonGallery";
import { ROOM_LIST } from "@/lib/rooms";

const SPACES = [
  ...ROOM_LIST.map((room) => ({
    name: room.name,
    detail: `${room.bed}. ${room.bathroom}. Vue sur la Seine, petit-déjeuner continental inclus.`,
  })),
  {
    name: "Le salon commun",
    detail:
      "Panoramique, sans télévision — le spectacle est dehors. Le petit-déjeuner continental s'y prend face au passage des bateaux.",
  },
  {
    name: "La terrasse & le jardin",
    detail:
      "Mobilier extérieur, terrasse bien exposée, jardin en bord de Seine. Le parc de Saint-Cloud est à trois minutes à pied.",
  },
];

const PRACTICAL_INFO = [
  { label: "Arrivée", value: "17:00 – 22:00, heure à annoncer" },
  { label: "Départ", value: "06:00 – 10:30" },
  { label: "Petit-déjeuner", value: "Continental, inclus, face à la Seine" },
  {
    label: "Chambres",
    value: "Rive Gauche (lit 160, sdb partagée) · Rive Droite (lit 180, sdb privée)",
  },
  { label: "Wi-Fi", value: "141 Mb/s, gratuit à bord" },
  { label: "Parking", value: "Sur place, 15 € / jour" },
  { label: "Accès", value: "Métro 9 · Tramway T2 · Tour Eiffel à 7 km" },
  { label: "Animaux", value: "Admis sur demande" },
  { label: "Maison non-fumeur", value: "Heures calmes 22:00 – 07:00" },
];

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-200/60">
      {index} — {title}
    </p>
  );
}

/** Filet d'horizon : la signature graphique du site, un simple trait d'eau. */
function HorizonRule() {
  return <div className="border-t border-slate-800" />;
}

export default function HomePage() {
  return (
    <>
      <SmartHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative flex min-h-svh flex-col justify-center overflow-hidden px-6 md:px-12">
          <Image
            src="/photos/hero.jpg"
            alt="La Seine au crépuscule, depuis la maison flottante"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Voile nocturne : garde le texte lisible et la photo dans la DA. */}
          <div className="absolute inset-0 bg-gradient-to-b from-night/80 via-night/55 to-night/90" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[radial-gradient(ellipse_70%_100%_at_50%_100%,rgba(253,230,138,0.05),transparent)]" />
          <div className="relative mx-auto w-full max-w-6xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-slate-500">
              Maison flottante — Sèvres, aux portes de Paris
            </p>
            <h1 className="mt-6 font-serif text-6xl text-slate-100 md:text-8xl">
              Megalight II
            </h1>
            <p className="mt-8 max-w-xl leading-relaxed text-slate-400">
              Amarrée au Parc Nautique de l&apos;Île de Monsieur, la maison
              flottante de Captain Philippe : deux chambres au fil de
              l&apos;eau, un salon panoramique sur la Seine, une terrasse au
              soleil. Réservation directe, simplement.
            </p>
            <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-4">
              <a
                href="#disponibilites"
                className="border-b border-amber-200/40 pb-1 text-sm text-amber-100/90 transition-colors hover:border-amber-200/80"
              >
                Consulter les disponibilités ↓
              </a>
              <span className="font-mono text-[10px] tracking-[0.25em] text-slate-600">
                48.8328 N — 2.2181 E · ÎLE DE MONSIEUR
              </span>
            </div>
          </div>
        </section>

        <HorizonRule />

        {/* La maison */}
        <section id="peniche" className="scroll-mt-24 px-6 py-24 md:px-12 md:py-32">
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1fr_2fr]">
            <SectionLabel index="01" title="La maison" />
            <div>
              <h2 className="font-serif text-4xl leading-tight text-slate-100 md:text-5xl">
                Dormir à hauteur d&apos;eau, la ville à portée de berge
              </h2>
              <p className="mt-8 max-w-xl leading-relaxed text-slate-400">
                On dort ici au niveau de la Seine, fenêtres sur le fleuve —
                à se demander si l&apos;on est juste au-dessus ou juste
                au-dessous de la ligne d&apos;eau. Au réveil, le
                petit-déjeuner se prend dans le salon panoramique, devant le
                passage des bateaux, dans un cadre verdoyant et parfaitement
                silencieux.
              </p>
              <p className="mt-6 max-w-xl leading-relaxed text-slate-400">
                À la barre, Captain Philippe — ancien journaliste radio devenu
                coach — dont les petits-déjeuners virent volontiers au café
                philosophique, mâtiné d&apos;histoire et de géopolitique. On
                peut aussi, précisons-le, petit-déjeuner en silence.
              </p>
              <p className="mt-6 max-w-xl leading-relaxed text-slate-400">
                Le parc de Saint-Cloud est à trois minutes, La Seine Musicale
                à vingt minutes par la berge, la tour Eiffel et Versailles à
                un quart d&apos;heure. Le code du coffre à clés et les détails
                d&apos;accès au ponton sont communiqués à la confirmation du
                séjour.
              </p>
            </div>
          </div>
        </section>

        <HorizonRule />

        {/* Galerie horizontale */}
        <section id="galerie" className="scroll-mt-24 py-24 md:py-32">
          <div className="mx-auto mb-14 max-w-6xl px-6 md:px-12">
            <SectionLabel index="02" title="La visite" />
          </div>
          <HorizonGallery />
        </section>

        <HorizonRule />

        {/* Chambres & espaces */}
        <section id="cabines" className="scroll-mt-24 px-6 py-24 md:px-12 md:py-32">
          <div className="mx-auto max-w-6xl">
            <SectionLabel index="03" title="Chambres & espaces" />
            <div className="mt-14 grid border border-slate-800 sm:grid-cols-2">
              {SPACES.map((space, i) => (
                <article
                  key={space.name}
                  className={`p-8 md:p-12 ${i % 2 === 1 ? "sm:border-l sm:border-slate-800" : ""} ${i >= 2 ? "border-t border-slate-800" : i === 1 ? "border-t border-slate-800 sm:border-t-0" : ""}`}
                >
                  <span className="font-mono text-[10px] tracking-[0.25em] text-slate-600">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-serif text-2xl text-slate-100">
                    {space.name}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-slate-400">
                    {space.detail}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <HorizonRule />

        {/* À savoir */}
        <section id="infos" className="scroll-mt-24 px-6 py-24 md:px-12 md:py-32">
          <div className="mx-auto max-w-6xl">
            <SectionLabel index="04" title="À savoir" />
            <dl className="mt-14 grid border-t border-l border-slate-800 sm:grid-cols-2 lg:grid-cols-3">
              {PRACTICAL_INFO.map((info) => (
                <div
                  key={info.label}
                  className="border-r border-b border-slate-800 p-6"
                >
                  <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber-200/60">
                    {info.label}
                  </dt>
                  <dd className="mt-2 text-sm text-slate-300">{info.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <HorizonRule />

        {/* Disponibilités */}
        <section
          id="disponibilites"
          className="scroll-mt-24 px-6 py-24 md:px-12 md:py-32"
        >
          <div className="mx-auto max-w-6xl">
            <SectionLabel index="05" title="Disponibilités" />
            <h2 className="mt-6 max-w-xl font-serif text-4xl text-slate-100">
              Deux chambres, vos dates, le tarif exact
            </h2>
            <p className="mt-6 max-w-xl leading-relaxed text-slate-400">
              La Chambre Rive Gauche et la Chambre Rive Droite se réservent
              séparément, avec leur calendrier et leur tarification propres —
              affichée jour par jour, semaine ou week-end.
            </p>
            <Link
              href="/book"
              className="mt-10 inline-block border-b border-amber-200/40 pb-1 text-sm text-amber-100/90 transition-colors hover:border-amber-200/80"
            >
              Choisir votre chambre et vos dates →
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 px-6 py-10 md:px-12">
        <div className="mx-auto flex max-w-6xl flex-wrap items-baseline justify-between gap-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-600">
            Megalight II — 16 rue de Saint-Cloud, Parc Nautique de l&apos;Île
            de Monsieur, 92310 Sèvres
          </span>
          <span className="font-mono text-[10px] text-slate-700">
            Licence n° 9207200006155 · © {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </>
  );
}
