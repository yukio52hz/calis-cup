import type { CompetitorDashboard } from "../../dashboard-types";

import NextLink from "next/link";
import clsx from "clsx";

import { Card, CardTitle } from "@/components/ui/card";
import { ChevronRightIcon } from "@/components/ui/icons";
import { ROUTES } from "@/lib/constants";

// Oro, plata y bronce para el podio
const PODIUM = [
  "bg-[#e8b923] text-black",
  "bg-[#c0c6d0] text-black",
  "bg-[#cd7f32] text-black",
];

// Vista previa de la clasificación acumulada de mi categoría (§23-24)
export function LeaderboardCard({
  leaderboard,
  categoryLabel,
}: {
  leaderboard: CompetitorDashboard["leaderboard"];
  categoryLabel: string;
}) {
  return (
    <Card>
      <CardTitle
        action={
          <NextLink
            className="flex items-center text-sm font-semibold text-accent hover:underline"
            href={ROUTES.ranking}
          >
            Ver todo <ChevronRightIcon className="h-4 w-4" />
          </NextLink>
        }
        eyebrow={categoryLabel.toUpperCase()}
      >
        Clasificación
      </CardTitle>
      {leaderboard.length === 0 && (
        <p className="rounded-xl bg-background/50 px-4 py-3 text-center text-sm text-muted">
          Aún no hay resultados aprobados.
        </p>
      )}
      <ol className="flex flex-col gap-1.5">
        {leaderboard.map((row) => (
          <li
            key={row.position}
            className={clsx(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm",
              row.isMe
                ? "bg-accent/15 ring-1 ring-accent/40"
                : "bg-background/50",
            )}
          >
            <span
              className={clsx(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-xs",
                PODIUM[row.position - 1] ?? "bg-white/10",
              )}
            >
              {row.position}
            </span>
            <span className="flex-1 font-semibold">{row.name}</span>
            <span className="font-display">{row.points}</span>
            <span className="text-xs text-muted">pts</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
