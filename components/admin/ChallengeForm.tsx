"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { verifyChallenge } from "@/app/admin/actions";

export default function ChallengeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await verifyChallenge(code);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.push("/admin");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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
          autoFocus
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
        className="w-full border border-stone-900 py-4 text-xs uppercase tracking-[0.25em] text-stone-900 transition-colors hover:bg-stone-900 hover:text-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Vérification…" : "Valider"}
      </button>
    </form>
  );
}
