import type { Category, Rankings } from "../types";

import { StatusBadge } from "@/components/ui/status-badge";

import { AccumulatedTable } from "./accumulated-table";
import { Podium } from "./podium";
import { RankingFilters } from "./ranking-filters";
import { WeeklyTable } from "./weekly-table";

export function RankingView({
  rankings,
  category,
  view,
}: {
  rankings: Rankings;
  category: Category;
  // "total" o el número de semana
  view: string;
}) {
  const week = rankings.weeks.find((w) => String(w.number) === view);
  const weeklyRows = week ? (rankings.weekly[week.number] ?? []) : [];
  const me = week
    ? weeklyRows.find((r) => r.isMe)
    : rankings.accumulated.find((r) => r.isMe);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 py-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-bold tracking-[0.2em] text-muted">
          {week ? `SEMANA ${week.number}` : "4 SEMANAS · PUNTOS ACUMULADOS"}
        </p>
        <h1 className="font-display text-3xl uppercase leading-none">
          {week
            ? (week.challengeName ?? `Reto #${week.number}`)
            : "Clasificación"}
        </h1>
        <div className="flex flex-wrap gap-2">
          {week?.status === "active" && (
            <StatusBadge tone="accent">
              En curso · resultados parciales
            </StatusBadge>
          )}
          {week?.status === "closed" && (
            <StatusBadge tone="neutral">Semana cerrada</StatusBadge>
          )}
          {!week &&
            (rankings.isFinal ? (
              <StatusBadge tone="success">Clasificación final</StatusBadge>
            ) : (
              <StatusBadge tone="warning">
                Provisional hasta la semana 4
              </StatusBadge>
            ))}
        </div>
      </header>

      <RankingFilters category={category} view={view} weeks={rankings.weeks} />

      {me && (
        <div className="flex items-center justify-between rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3">
          <span className="text-sm font-semibold">Tu posición</span>
          <span className="flex items-baseline gap-3">
            <span className="font-display text-2xl">#{me.position}</span>
            <span className="text-sm text-muted">
              {"total" in me ? me.total : me.points} pts
            </span>
          </span>
        </div>
      )}

      {week ? (
        weeklyRows.length > 0 ? (
          <WeeklyTable rows={weeklyRows} />
        ) : (
          <EmptyState />
        )
      ) : rankings.accumulated.length > 0 ? (
        <>
          <Podium rows={rankings.accumulated} />
          <AccumulatedTable
            rows={rankings.accumulated}
            weeks={rankings.weeks}
          />
        </>
      ) : (
        <EmptyState />
      )}

      <p className="text-center text-xs text-muted">
        Solo cuentan los videos aprobados. En cada semana se toma tu mejor
        resultado válido.
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 px-6 py-12 text-center text-muted">
      Aún no hay resultados publicados.
    </div>
  );
}
