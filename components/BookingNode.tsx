"use client";

import { useMemo, useState } from "react";
import DateRangeCalendar from "@/components/DateRangeCalendar";
import RoomSelector from "@/components/RoomSelector";
import WaveIndicator from "@/components/WaveIndicator";
import { ROOMS, type RoomId } from "@/lib/rooms";
import { computeStayTotal } from "@/lib/pricing";
import type { BlockedRange } from "@/lib/types";

type SubmitState =
  | { step: "idle" }
  | { step: "sending" }
  | { step: "done" }
  | { step: "error"; message: string };

const FIELDS = [
  { id: "name", label: "Nom complet", type: "text" },
  { id: "email", label: "Email", type: "email" },
  { id: "phone", label: "Téléphone", type: "tel" },
] as const;

/**
 * Tunnel de réservation confidentiel en deux étapes : choix de la
 * chambre, puis calendrier tarifé + coordonnées. Aucun compteur
 * d'urgence ni artifice commercial. La disponibilité ET le prix sont
 * revérifiés côté serveur à la soumission (409 en cas de chevauchement).
 */
export default function BookingNode() {
  const [roomId, setRoomId] = useState<RoomId | null>(null);
  const [blocked, setBlocked] = useState<BlockedRange[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [submit, setSubmit] = useState<SubmitState>({ step: "idle" });

  // Choisir une chambre est une action utilisateur (clic sur une carte),
  // pas un effet de bord à synchroniser : on charge sa disponibilité
  // directement dans le handler plutôt que via useEffect.
  function handleSelectRoom(id: RoomId) {
    setRoomId(id);
    setCheckIn(null);
    setCheckOut(null);
    setSubmit({ step: "idle" });
    setLoading(true);
    fetch(`/api/availability?room=${id}`)
      .then((r) => r.json())
      .then((data) => setBlocked(data.blocked ?? []))
      .catch(() => setBlocked([]))
      .finally(() => setLoading(false));
  }

  const summary = useMemo(
    () =>
      roomId && checkIn && checkOut
        ? computeStayTotal(roomId, checkIn, checkOut)
        : null,
    [roomId, checkIn, checkOut]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!roomId || !checkIn || !checkOut) return;
    setSubmit({ step: "sending" });

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room_id: roomId,
        guest_name: form.name,
        guest_email: form.email,
        guest_phone: form.phone,
        check_in: checkIn,
        check_out: checkOut,
      }),
    });

    if (res.ok) {
      setSubmit({ step: "done" });
    } else {
      const data = await res.json().catch(() => ({}));
      setSubmit({
        step: "error",
        message: data.error ?? "Une erreur est survenue, réessayez.",
      });
    }
  }

  if (submit.step === "done" && roomId) {
    return (
      <div className="border border-slate-800 bg-slate-950/70 p-10 text-center backdrop-blur-md md:p-16">
        <h3 className="font-serif text-4xl text-slate-100">
          Demande transmise
        </h3>
        <p className="mx-auto mt-6 max-w-md leading-relaxed text-slate-400">
          Merci {form.name}. Votre demande pour{" "}
          {ROOMS[roomId].name.toLowerCase()}, du{" "}
          <span className="font-mono text-amber-200/80">{checkIn}</span> au{" "}
          <span className="font-mono text-amber-200/80">{checkOut}</span> est
          bien enregistrée. L&apos;hôte vous confirmera personnellement par
          email, avec le code du coffre à clés et les détails d&apos;accès au
          ponton.
        </p>
      </div>
    );
  }

  if (!roomId) {
    return (
      <div>
        <p className="mb-8 font-mono text-[10px] uppercase tracking-[0.3em] text-amber-200/60">
          Étape 1 — Choix de la chambre
        </p>
        <RoomSelector selected={roomId} onSelect={handleSelectRoom} />
      </div>
    );
  }

  const room = ROOMS[roomId];

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-200/60">
          Étape 2 — Vos dates · {room.name}
        </p>
        <button
          type="button"
          onClick={() => setRoomId(null)}
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 underline decoration-slate-700 underline-offset-4 transition-colors hover:text-slate-200"
        >
          Changer de chambre
        </button>
      </div>

      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          {loading ? (
            <div className="flex h-96 items-center justify-center gap-4 border border-slate-800 bg-slate-950/70 backdrop-blur-md">
              <WaveIndicator />
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
                Relevé des disponibilités…
              </span>
            </div>
          ) : (
            <DateRangeCalendar
              roomId={roomId}
              blocked={blocked}
              checkIn={checkIn}
              checkOut={checkOut}
              onChange={(ci, co) => {
                setCheckIn(ci);
                setCheckOut(co);
              }}
            />
          )}
        </div>

        <div className="flex flex-col">
          <div className="border-b border-slate-800 pb-6 font-mono text-xs text-slate-400">
            {checkIn && checkOut && summary ? (
              <div className="space-y-3">
                <span className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                  <span className="text-amber-200/80">{checkIn}</span>
                  <span className="text-slate-600">⟶</span>
                  <span className="text-amber-200/80">{checkOut}</span>
                </span>
                <p className="text-slate-500">
                  {summary.nights} nuit{summary.nights > 1 ? "s" : ""} ×{" "}
                  {room.price} €
                </p>
                <p className="text-base text-slate-100">
                  Total :{" "}
                  <span className="font-mono text-amber-200/80">
                    {summary.total} €
                  </span>
                </p>
              </div>
            ) : checkIn ? (
              <>
                Arrivée le <span className="text-amber-200/80">{checkIn}</span>{" "}
                — choisissez la date de départ
              </>
            ) : (
              "Sélectionnez votre date d'arrivée"
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-10 flex-1 space-y-8">
            {FIELDS.map(({ id, label, type }) => (
              <div key={id}>
                <label
                  htmlFor={id}
                  className="block font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500"
                >
                  {label}
                </label>
                <input
                  id={id}
                  type={type}
                  required
                  value={form[id]}
                  onChange={(e) => setForm({ ...form, [id]: e.target.value })}
                  className="mt-2 w-full border-b border-slate-800 bg-transparent py-3 text-slate-100 transition-colors focus:border-amber-200/60 focus:outline-none"
                />
              </div>
            ))}

            {submit.step === "error" && (
              <p className="border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-200/80">
                {submit.message}
              </p>
            )}

            <button
              type="submit"
              disabled={!checkIn || !checkOut || submit.step === "sending"}
              className="w-full border border-amber-200/40 px-10 py-4 text-xs uppercase tracking-[0.25em] text-amber-100/90 transition-colors hover:bg-amber-200/10 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-600"
            >
              {submit.step === "sending"
                ? "Envoi en cours…"
                : "Demander la réservation"}
            </button>
            <p className="text-xs text-slate-500">
              Votre demande sera confirmée par l&apos;hôte avant tout
              paiement. Arrivée entre 17 h et 22 h (heure à annoncer), départ
              avant 10 h 30.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
