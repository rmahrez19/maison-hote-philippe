import type { ReactNode } from "react";

interface Props {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * Écrin visuel partagé des écrans d'authentification admin — esthétique
 * « Kinfolk » : fond papier blanc cassé, typographie éditoriale, aucune
 * carte encadrée, juste de l'espace et des filets fins sur les champs.
 */
export default function AuthShell({ eyebrow, title, description, children }: Props) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-[#f6f2ea] px-6 py-16">
      <div className="w-full max-w-sm">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-400">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-serif text-3xl text-stone-900">{title}</h1>
        {description && (
          <p className="mt-4 text-sm leading-relaxed text-stone-500">
            {description}
          </p>
        )}
        <div className="mt-10">{children}</div>
      </div>
    </main>
  );
}
