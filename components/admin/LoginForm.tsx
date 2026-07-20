"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";

type State = { error?: string } | null;

async function action(_prev: State, formData: FormData): Promise<State> {
  const result = await login(formData);
  return result?.error ? { error: result.error } : null;
}

const inputClass =
  "mt-2 w-full border-b border-stone-300 bg-transparent py-3 text-stone-900 transition-colors focus:border-stone-900 focus:outline-none";
const labelClass =
  "block font-mono text-[10px] uppercase tracking-[0.25em] text-stone-400";
const submitClass =
  "w-full border border-stone-900 py-4 text-xs uppercase tracking-[0.25em] text-stone-900 transition-colors hover:bg-stone-900 hover:text-stone-50 disabled:cursor-not-allowed disabled:opacity-50";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<State, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-8">
      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </div>

      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}

      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
