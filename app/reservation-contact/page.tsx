import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/aman/Header";
import Footer from "@/components/aman/Footer";
import Reveal from "@/components/aman/Reveal";
import { CONTACT } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Réserver — Megalight II",
  description:
    "La réservation en ligne arrive très bientôt. En attendant, Philippe prend vos réservations par téléphone et WhatsApp.",
  robots: { index: false, follow: false },
};

interface Channel {
  href: string;
  /** Nouvel onglet uniquement pour WhatsApp (lien http), pas pour tel:/sms:. */
  external?: boolean;
  eyebrow: string;
  label: string;
  detail: string;
  /** Le canal mis en avant : fond plein plutôt que simple filet. */
  primary?: boolean;
}

const CHANNELS: Channel[] = [
  {
    href: CONTACT.telHref,
    eyebrow: "Par téléphone",
    label: "Appeler Philippe",
    detail: CONTACT.phoneDisplay,
    primary: true,
  },
  {
    href: CONTACT.whatsappHref,
    external: true,
    eyebrow: "Par WhatsApp",
    label: "Écrire sur WhatsApp",
    detail: "Message déjà rédigé",
  },
  {
    href: CONTACT.smsHref,
    eyebrow: "Par SMS",
    label: "Envoyer un SMS",
    detail: CONTACT.phoneDisplay,
  },
];

/**
 * Page d'attente du tunnel de réservation : le moteur de réservation en
 * ligne (/book) n'est pas encore ouvert au public, toutes les CTA du site
 * arrivent donc ici. Même DA que le reste du site (header/footer Aman,
 * grammaire typographique stone + accent #ab8a5b, animations Reveal).
 *
 * Les coordonnées viennent d'un seul endroit : lib/contact.ts.
 */
export default function ReservationContactPage() {
  return (
    <>
      <Header forceSolid />

      <main className="flex-1 bg-stone-50 px-6 pb-24 pt-32 md:px-16 md:pt-40">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <p className="text-[11px] font-light uppercase tracking-[0.3em] text-stone-400">
              Réservations
            </p>
            <h1 className="mt-6 font-serif text-4xl font-light leading-tight text-stone-900 sm:text-5xl md:text-6xl">
              Réservez de vive voix
            </h1>
            <p className="mt-8 max-w-xl text-base font-light leading-relaxed text-stone-600 md:text-lg">
              La réservation en ligne arrive très bientôt ! En attendant
              l&apos;ouverture du service en ligne, nous prenons vos
              réservations directement par téléphone et WhatsApp.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-14 md:mt-16">
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CHANNELS.map(
                ({ href, external, eyebrow, label, detail, primary }) => (
                  <li key={eyebrow}>
                    <a
                      href={href}
                      {...(external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className={`flex h-full flex-col justify-between gap-8 border p-6 transition-colors md:p-7 ${
                        primary
                          ? "border-stone-900 bg-stone-900 text-stone-50 hover:bg-stone-800"
                          : "border-stone-300 bg-transparent text-stone-900 hover:border-stone-900 hover:bg-stone-100/60"
                      }`}
                    >
                      <span className="text-[11px] font-light uppercase tracking-[0.25em] text-stone-400">
                        {eyebrow}
                      </span>
                      <span>
                        <span className="block font-serif text-2xl font-light leading-snug">
                          {label}
                        </span>
                        <span
                          className={`mt-2 block font-mono text-xs tracking-[0.12em] ${
                            primary ? "text-stone-400" : "text-[#ab8a5b]"
                          }`}
                        >
                          {detail}
                        </span>
                      </span>
                    </a>
                  </li>
                )
              )}
            </ul>
          </Reveal>

          <Reveal delay={0.2} className="mt-14 border-t border-stone-200 pt-10">
            <p className="max-w-xl text-sm font-light leading-relaxed text-stone-600">
              Indiquez-nous vos dates d&apos;arrivée et de départ ainsi que le
              nombre de personnes : Philippe vous confirme la disponibilité de
              la Rive Gauche ou de la Rive Droite dans la journée.
            </p>
            <Link
              href="/"
              className="mt-10 inline-block border-b border-stone-900/30 pb-1 text-[11px] font-light uppercase tracking-[0.28em] text-stone-900 transition-colors hover:border-stone-900"
            >
              ← Retour à l&apos;accueil
            </Link>
          </Reveal>
        </div>
      </main>

      <Footer />
    </>
  );
}
