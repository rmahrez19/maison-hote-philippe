"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import DateRangeCalendar from "@/components/DateRangeCalendar";
import RoomSelector from "@/components/RoomSelector";
import WaveIndicator from "@/components/WaveIndicator";
import Reveal from "@/components/aman/Reveal";
import { ROOMS, type RoomId } from "@/lib/rooms";
import { computeStayTotal, nightlyBreakdown } from "@/lib/pricing";
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

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Tunnel de réservation confidentiel en deux étapes : choix de la
 * chambre, puis calendrier tarifé + coordonnées. Aucun compteur
 * d'urgence ni artifice commercial. La disponibilité ET le prix sont
 * revérifiés côté serveur à la soumission (409 en cas de chevauchement).
 * Toute la logique d'état/API est identique à l'implémentation d'origine ;
 * seule l'habillage visuel a été aligné sur la DA Aman du reste du site.
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

  const breakdown = useMemo(
    () =>
      roomId && checkIn && checkOut
        ? nightlyBreakdown(roomId, checkIn, checkOut)
        : [],
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
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="rounded-2xl border border-stone-200/60 bg-white/80 p-10 text-center backdrop-blur-md md:p-16"
      >
        <h3 className="font-serif text-4xl font-light text-stone-900">
          Demande transmise
        </h3>
        <p className="mx-auto mt-6 max-w-md text-sm font-light leading-relaxed text-stone-600">
          Merci {form.name}. Votre demande pour{" "}
          {ROOMS[roomId].name.toLowerCase()}, du{" "}
          <span className="text-stone-900">{checkIn}</span> au{" "}
          <span className="text-stone-900">{checkOut}</span> est bien
          enregistrée. L&apos;hôte vous confirmera personnellement par email,
          avec le code du coffre à clés et les détails d&apos;accès au
          ponton.
        </p>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!roomId ? (
        <motion.div
          key="step1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <p className="mb-8 text-[11px] font-light uppercase tracking-[0.3em] text-stone-400">
            Étape 1 — Choix de la résidence
          </p>
          <RoomSelector selected={roomId} onSelect={handleSelectRoom} />
        </motion.div>
      ) : (
        <motion.div
          key="step2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          {(() => {
            const room = ROOMS[roomId];
            return (
              <div>
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-[11px] font-light uppercase tracking-[0.3em] text-stone-400">
                    Étape 2 — Vos dates · {room.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => setRoomId(null)}
                    className="text-[11px] font-light uppercase tracking-[0.2em] text-stone-400 underline decoration-stone-300 underline-offset-4 transition-colors hover:text-stone-900"
                  >
                    Changer de résidence
                  </button>
                </div>

                <div className="grid gap-12 lg:grid-cols-2">
                  <Reveal x={-24} y={0}>
                    {loading ? (
                      <div className="flex h-96 items-center justify-center gap-4 rounded-2xl border border-stone-200/60 bg-white/80 backdrop-blur-md">
                        <WaveIndicator />
                        <span className="text-xs font-light uppercase tracking-[0.2em] text-stone-400">
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
                  </Reveal>

                  <Reveal x={24} y={0} delay={0.1} className="flex flex-col">
                    <div className="rounded-2xl border border-stone-200/60 bg-white/80 p-6 backdrop-blur-md md:p-8">
                      {checkIn && checkOut && summary ? (
                        <div>
                          <span className="flex flex-wrap items-baseline gap-x-4 gap-y-2 text-sm">
                            <span className="font-serif text-lg text-stone-900">
                              {checkIn}
                            </span>
                            <span className="text-stone-400">⟶</span>
                            <span className="font-serif text-lg text-stone-900">
                              {checkOut}
                            </span>
                          </span>

                          <ul className="mt-5 space-y-2 border-t border-stone-200/60 pt-4">
                            {breakdown.map((line) => (
                              <li
                                key={line.date}
                                className="flex items-baseline justify-between text-xs font-light text-stone-500"
                              >
                                <span>{line.date}</span>
                                <span>{line.price} €</span>
                              </li>
                            ))}
                          </ul>

                          <p className="mt-5 flex items-baseline justify-between border-t border-stone-200/60 pt-4 text-base">
                            <span className="font-light text-stone-600">
                              Total · {summary.nights} nuit
                              {summary.nights > 1 ? "s" : ""}
                            </span>
                            <span className="font-serif text-xl text-stone-900">
                              {summary.total} €
                            </span>
                          </p>

                          <p className="mt-4 text-xs font-light leading-relaxed text-stone-400">
                            Petit-déjeuner continental, Wi-Fi fibre et
                            parking inclus.
                          </p>
                        </div>
                      ) : checkIn ? (
                        <p className="text-sm font-light text-stone-500">
                          Arrivée le{" "}
                          <span className="text-stone-900">{checkIn}</span> —
                          choisissez la date de départ
                        </p>
                      ) : (
                        <p className="text-sm font-light text-stone-500">
                          Sélectionnez votre date d&apos;arrivée
                        </p>
                      )}
                    </div>

                    <form
                      onSubmit={handleSubmit}
                      className="mt-8 flex-1 space-y-7"
                    >
                      {FIELDS.map(({ id, label, type }) => (
                        <div key={id}>
                          <label
                            htmlFor={id}
                            className="block text-[11px] font-light uppercase tracking-[0.25em] text-stone-400"
                          >
                            {label}
                          </label>
                          <input
                            id={id}
                            type={type}
                            required
                            value={form[id]}
                            onChange={(e) =>
                              setForm({ ...form, [id]: e.target.value })
                            }
                            className="mt-2 w-full border-0 border-b border-stone-300 bg-transparent py-2.5 text-stone-900 transition-colors focus:border-stone-900 focus:outline-none"
                          />
                        </div>
                      ))}

                      {submit.step === "error" && (
                        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                          {submit.message}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={
                          !checkIn || !checkOut || submit.step === "sending"
                        }
                        className="w-full bg-stone-900 px-10 py-4 text-xs font-light uppercase tracking-[0.25em] text-stone-50 transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
                      >
                        {submit.step === "sending"
                          ? "Envoi en cours…"
                          : "Demander la réservation"}
                      </button>
                      <p className="text-xs font-light leading-relaxed text-stone-400">
                        Votre demande sera confirmée par l&apos;hôte avant
                        tout paiement. Arrivée entre 17 h et 22 h (heure à
                        annoncer), départ avant 10 h 30.
                      </p>
                    </form>
                  </Reveal>
                </div>
              </div>
            );
          })()}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
