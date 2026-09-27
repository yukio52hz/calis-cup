import Image from "next/image";
import clsx from "clsx";

// Emblema oficial "CIC" (public/img/logo.png, fondo transparente)
export function LogoMark({
  className,
  priority,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      alt="Costa Rica Calis Cup"
      className={clsx("h-auto", className)}
      height={555}
      priority={priority}
      src="/img/logo.png"
      width={672}
    />
  );
}

// Emblema + nombre, para la navbar
export function Logo({ className }: { className?: string }) {
  return (
    <span className={clsx("flex items-center gap-2", className)}>
      <LogoMark priority className="w-10" />
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
