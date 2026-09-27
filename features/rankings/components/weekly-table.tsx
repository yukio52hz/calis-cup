import type { WeeklyRow } from "../types";

import clsx from "clsx";

import { formatDuration } from "@/lib/format";

import { Avatar, RankBadge } from "./rank-badge";

// Clasificación semanal (§21, §23): tiempo final = tiempo + penalizaciones
export function WeeklyTable({ rows }: { rows: WeeklyRow[] }) {
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
            <th className="w-24 py-3 text-right" scope="col">
              Tiempo
            </th>
            <th className="w-16 py-3 pr-4 text-right" scope="col">
              Pts
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
                  <p className="truncate font-semibold">
                    {row.name}
                    {row.isMe && (
                      <span className="ml-1.5 rounded bg-accent px-1.5 py-0.5 text-[0.6rem] font-bold uppercase text-accent-foreground">
                        Tú
                      </span>
                    )}
                  </p>
                </div>
              </td>
              <td className="py-3 text-right">
                <span className="font-display tabular-nums">
                  {formatDuration(row.finalTimeMs)}
                </span>
                {row.penaltyMs > 0 && (
                  <span className="block text-[0.7rem] text-accent">
                    +{row.penaltyMs / 1000}s penal.
                  </span>
                )}
              </td>
              <td className="py-3 pr-4 text-right font-display">
                {row.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
