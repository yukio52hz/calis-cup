import "server-only";

import type {
  AccumulatedRow,
  Category,
  Rankings,
  RankingWeek,
  WeeklyRow,
} from "../types";

// TODO(Fase 5): calcular con SQL a partir de submissions aprobadas
// (mejor final_time por usuario y reto → RANK() → points_table).
// Mientras tanto genera datos de ejemplo deterministas.

const NAMES: Record<Category, string[]> = {
  female: [
    "Marina S.",
    "Ana R.",
    "Valeria C.",
    "Sofía M.",
    "Daniela V.",
    "Camila J.",
    "Laura P.",
    "María F.",
    "Andrea L.",
    "Paula G.",
    "Natalia B.",
  ],
  male: [
    "Juan P.",
    "Pedro M.",
    "Carlos R.",
    "Luis A.",
    "Diego H.",
    "Andrés Q.",
    "José V.",
    "Marco S.",
    "Esteban C.",
    "Pablo N.",
    "Kevin D.",
  ],
};

const WEEKS: RankingWeek[] = [
  { number: 1, status: "closed", challengeName: "Pull up" },
  { number: 2, status: "active", challengeName: "Muscle up" },
  { number: 3, status: "upcoming" },
  { number: 4, status: "upcoming" },
];

// Puntos por posición (§22). En producción vienen de points_table.
function pointsFor(position: number) {
  return Math.max(100 - (position - 1) * 5, 5);
}

// Pseudoaleatorio determinista para que los datos no cambien entre recargas
function noise(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;

  return x - Math.floor(x);
}

function rankBy<T>(rows: T[], score: (row: T) => number, asc: boolean) {
  const sorted = [...rows].sort((a, b) =>
    asc ? score(a) - score(b) : score(b) - score(a),
  );

  // Ranking de competición: empates comparten posición (1, 2, 2, 4)
  return sorted.map((row, index) => {
    const tiedWith = sorted.findIndex((other) => score(other) === score(row));

    return { row, position: (tiedWith === -1 ? index : tiedWith) + 1 };
  });
}

export async function getRankings(
  category: Category,
  me: { id: string; name: string; category: Category },
): Promise<Rankings> {
  const competitors = NAMES[category].map((name, i) => ({
    id: `${category}-${i}`,
    name,
  }));

  if (me.category === category) {
    competitors.splice(3, 0, { id: me.id, name: me.name });
  }

  const weekly: Record<number, WeeklyRow[]> = {};

  for (const week of WEEKS.filter((w) => w.status !== "upcoming")) {
    // En la semana activa no todos han enviado su video todavía
    const participants =
      week.status === "active"
        ? competitors.filter(
            (_, i) => i % 4 !== 3 || competitors[i].id === me.id,
          )
        : competitors;

    const results = participants.map((c, i) => {
      const seed = week.number * 100 + i + (category === "female" ? 50 : 0);
      const rawTimeMs = Math.round((120 + i * 6 + noise(seed) * 25) * 1000);
      const penaltyMs =
        (noise(seed + 7) > 0.6 ? 5000 : 0) + (noise(seed + 3) > 0.8 ? 3000 : 0);

      return { ...c, rawTimeMs, penaltyMs, finalTimeMs: rawTimeMs + penaltyMs };
    });

    weekly[week.number] = rankBy(results, (r) => r.finalTimeMs, true).map(
      ({ row, position }) => ({
        ...row,
        position,
        points: pointsFor(position),
        isMe: row.id === me.id,
      }),
    );
  }

  const totals = competitors.map((c) => {
    const weekPoints = WEEKS.map(
      (w) => weekly[w.number]?.find((r) => r.id === c.id)?.points ?? null,
    );

    return {
      ...c,
      weekPoints,
      total: weekPoints.reduce<number>((sum, p) => sum + (p ?? 0), 0),
    };
  });

  const accumulated: AccumulatedRow[] = rankBy(
    totals,
    (r) => r.total,
    false,
  ).map(({ row, position }) => ({ ...row, position, isMe: row.id === me.id }));

  return {
    weeks: WEEKS,
    accumulated,
    weekly,
    isFinal: WEEKS.every((w) => w.status === "closed"),
  };
}
