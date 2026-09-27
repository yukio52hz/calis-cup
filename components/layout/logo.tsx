import clsx from "clsx";

// Wordmark provisional. Reemplazar por el logo oficial (CIC) cuando esté en /public.
export function Logo({ className }: { className?: string }) {
  return (
    <span className={clsx("flex items-center gap-2", className)}>
      <FlagMark />
      <span className="flex flex-col leading-none">
        <span className="text-[0.55rem] font-semibold tracking-[0.25em] text-muted">
          COSTA RICA
        </span>
        <span className="font-display text-lg tracking-tight">CALIS CUP</span>
      </span>
    </span>
  );
}

// Franjas de la bandera (azul, blanco, rojo, blanco, azul)
export function FlagMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={clsx(
        "grid h-7 w-2.5 grid-rows-[1fr_1fr_2fr_1fr_1fr] overflow-hidden rounded-sm",
        className,
      )}
    >
      <span className="bg-cr-blue" />
      <span className="bg-white" />
      <span className="bg-cr-red" />
      <span className="bg-white" />
      <span className="bg-cr-blue" />
    </span>
  );
}
