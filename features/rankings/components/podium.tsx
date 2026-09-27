import type { AccumulatedRow } from "../types";

import clsx from "clsx";

import { Avatar, RankBadge } from "./rank-badge";

// Top 3 de la acumulada; el 1.º al centro y más alto
export function Podium({ rows }: { rows: AccumulatedRow[] }) {
  const [first, second, third] = rows;

  if (!first) return null;

  return (
    <ol className="grid grid-cols-3 items-end gap-2">
      {[second, first, third].map((row, i) =>
        row ? (
          <li
            key={row.id}
            className={clsx(
              "flex flex-col items-center gap-2 rounded-2xl border px-2 pb-3 text-center",
              i === 1
                ? "border-[#e8b923]/40 bg-gradient-to-b from-[#e8b923]/15 to-surface/60 pt-5"
                : "border-white/10 bg-surface/60 pt-4",
              row.isMe && "ring-2 ring-accent",
            )}
          >
            <div className="relative">
              <Avatar
                className={
                  i === 1 ? "h-14 w-14 text-base" : "h-11 w-11 text-sm"
                }
                name={row.name}
              />
              <RankBadge
                className="absolute -bottom-1.5 -right-2.5 h-5 w-5 text-[0.6rem] ring-2 ring-surface"
                position={row.position}
              />
            </div>
            <span className="w-full truncate text-sm font-bold">
              {row.isMe ? "Tú" : row.name}
            </span>
            <span className="font-display text-lg leading-none">
              {row.total}
              <span className="ml-1 font-sans text-xs text-muted">pts</span>
            </span>
          </li>
        ) : (
          <li key={i} />
        ),
      )}
    </ol>
  );
}
