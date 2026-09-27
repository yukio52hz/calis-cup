import clsx from "clsx";

// Oro, plata y bronce para el podio
const PODIUM = [
  "bg-[#e8b923] text-black",
  "bg-[#c0c6d0] text-black",
  "bg-[#cd7f32] text-black",
];

export function RankBadge({
  position,
  className,
}: {
  position: number;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-xs",
        PODIUM[position - 1] ?? "bg-white/10",
        className,
      )}
    >
      {position}
    </span>
  );
}

export function Avatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      aria-hidden
      className={clsx(
        "flex shrink-0 items-center justify-center rounded-full bg-surface-tertiary font-bold text-muted",
        className ?? "h-8 w-8 text-xs",
      )}
    >
      {initials}
    </span>
  );
}
