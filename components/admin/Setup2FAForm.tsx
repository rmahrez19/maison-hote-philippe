"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { enrollFactor, verifyEnrollment } from "@/app/admin/actions";

interface Enrollment {
  factorId: string;
  qrSvg: string;
  secret: string;
}

const submitClass =
  "w-full border border-stone-900 py-4 text-xs uppercase tracking-[0.25em] text-stone-900 transition-colors hover:bg-stone-900 hover:text-stone-50 disabled:cursor-not-allowed disabled:opacity-50";

export default function Setup2FAForm() {
  const router = useRouter();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function generate() {
    setError(null);
    startTransition(async () => {
      const res = await enrollFactor();
      if (res.error || !res.data) {
        setError(res.error ?? "Erreur inconnue.");
        return;
      }
      setEnrollment(res.data);
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!enrollment) return;
    setError(null);
    startTransition(async () => {
      const res = await verifyEnrollment(enrollment.factorId, code);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.push("/admin");
      router.refresh();
    });
  }

  if (!enrollment) {
    return (
      <div>
        <button type="button" onClick={generate} disabled={pending} className={submitClass}>
          {pending ? "Génération…" : "Générer mon QR code"}
        </button>
        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <div
        className="mx-auto w-48 border border-stone-200 bg-white p-4"
        // SVG renvoyé directement par Supabase (aucune saisie utilisateur
        // n'y transite) : pas de bibliothèque tierce pour l'afficher.
        dangerouslySetInnerHTML={{ __html: enrollment.qrSvg }}
      />
      <p className="mt-4 text-center font-mono text-xs tracking-widest text-stone-500">
        {enrollment.secret}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <div>
          <label
            htmlFor="code"
            className="block font-mono text-[10px] uppercase tracking-[0.25em] text-stone-400"
          >
            Code à 6 chiffres
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="mt-2 w-full border-b border-stone-300 bg-transparent py-3 text-center font-mono text-2xl tracking-[0.5em] text-stone-900 transition-colors focus:border-stone-900 focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={pending || code.length !== 6}
          className={submitClass}
        >
          {pending ? "Validation…" : "Valider"}
        </button>
      </form>
    </div>
  );
}
