interface Props {
  /** `active` : ondes concentriques ; `still` : point éteint, sans animation. */
  state?: "active" | "still";
}

/**
 * Indicateur d'état « aquatique » : un point dont émanent deux ondes
 * concentriques décalées, comme des ronds dans l'eau. Remplace les
 * pastilles rouge/vert habituelles des sites de réservation.
 */
export default function WaveIndicator({ state = "active" }: Props) {
  const still = state === "still";
  return (
    <span
      aria-hidden
      className="relative inline-flex size-2 shrink-0 items-center justify-center"
    >
      {!still && (
        <>
          <span className="absolute inset-0 animate-wave rounded-full border border-amber-200/60" />
          <span className="absolute inset-0 animate-wave rounded-full border border-amber-200/60 [animation-delay:1.3s]" />
        </>
      )}
      <span
        className={`size-1.5 rounded-full ${
          still ? "bg-slate-600" : "bg-amber-200/80"
        }`}
      />
    </span>
  );
}
