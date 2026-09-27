import type { CompetitorDashboard } from "../../dashboard-types";

import clsx from "clsx";

import { LockIcon } from "@/components/ui/icons";
import { formatShortDate } from "@/lib/format";

// Las 4 semanas con su estado por fecha (§33)
export function WeeksTimeline({
  weeks,
}: {
  weeks: CompetitorDashboard["weeks"];
}) {
  return (
    <ol className="grid grid-cols-4 gap-2">
      {weeks.map((week) => (
        <li
          key={week.number}
          aria-current={week.status === "active" ? "step" : undefined}
          className={clsx(
            "flex flex-col gap-1 rounded-xl border px-2 py-2.5 text-center",
            week.status === "active" && "border-accent bg-accent/15",
            week.status === "closed" &&
              "border-white/10 bg-surface/50 text-muted",
            week.status === "upcoming" &&
              "border-dashed border-white/15 text-muted",
          )}
        >
          <span className="text-[0.6rem] font-bold tracking-widest">
            SEMANA
          </span>
          <span className="font-display text-xl leading-none">
            {week.number}
          </span>
          <span className="flex items-center justify-center gap-1 text-[0.65rem]">
            {week.status === "closed" && (
              <>
                <LockIcon className="h-3 w-3" /> Cerrada
              </>
            )}
            {week.status === "active" && (
              <span className="font-bold text-accent">Activa</span>
            )}
            {week.status === "upcoming" && formatShortDate(week.startsAt)}
          </span>
        </li>
      ))}
    </ol>
  );
}
