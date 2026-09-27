import type { AccumulatedRow, RankingWeek } from "../types";

import clsx from "clsx";

import { Avatar, RankBadge } from "./rank-badge";

// Clasificación acumulada (§24). En móvil las semanas van bajo el nombre.
export function AccumulatedTable({
  rows,
  weeks,
}: {
  rows: AccumulatedRow[];
  weeks: RankingWeek[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface/60">
      <table className="w-full text-sm">
        <thead className="bg-background/40 text-[0.65rem] font-bold uppercase tracking-widest text-muted">
          <tr>
            <th className="w-12 py-3 pl-3 text-left" scope="col">
              #
            </th>
            <th className="py-3 text-left" scope="col">
              Competidor
            </th>
            {weeks.map((week) => (
              <th
                key={week.number}
                className="hidden w-14 py-3 text-center sm:table-cell"
                scope="col"
              >
                S{week.number}
              </th>
            ))}
            <th className="w-20 py-3 pr-4 text-right" scope="col">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((row) => (
            <tr
              key={row.id}
              aria-current={row.isMe ? "true" : undefined}
              className={clsx(row.isMe && "bg-accent/10")}
            >
              <td className="py-3 pl-3">
                <RankBadge position={row.position} />
              </td>
              <td className="py-3 pr-2">
                <div className="flex items-center gap-2.5">
                  <Avatar
                    className="hidden h-8 w-8 text-xs min-[360px]:flex"
                    name={row.name}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {row.name}
                      {row.isMe && (
                        <span className="ml-1.5 rounded bg-accent px-1.5 py-0.5 text-[0.6rem] font-bold uppercase text-accent-foreground">
                          Tú
                        </span>
                      )}
                    </p>
                    {/* Desglose por semana solo en móvil */}
                    <p className="mt-0.5 flex gap-2 text-[0.7rem] text-muted sm:hidden">
                      {row.weekPoints.map((points, i) => (
                        <span key={i}>
                          S{i + 1} {points ?? "–"}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              </td>
              {row.weekPoints.map((points, i) => (
                <td
                  key={i}
                  className={clsx(
                    "hidden py-3 text-center tabular-nums sm:table-cell",
                    points === null && "text-muted/50",
                  )}
                >
                  {points ?? "–"}
                </td>
              ))}
              <td className="py-3 pr-4 text-right font-display text-base">
                {row.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
