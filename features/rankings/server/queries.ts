import "server-only";

import type {
  AccumulatedRow,
  Category,
  Rankings,
  RankingWeek,
  WeeklyRow,
} from "../types";

import { and, asc, eq } from "drizzle-orm";

import { getWeekStatus } from "@/features/tournaments/week-status";
import { db } from "@/server/db/client";
import {
  challenges,
  profiles,
  registrations,
  submissions,
  tournaments,
  tournamentWeeks,
} from "@/server/db/schema";

// Puntos por posición (§22): 100, 95, 90… (mínimo 5).
// TODO(Fase 5): leerlos de una points_table configurable por el admin.
export function pointsFor(position: number) {
  return Math.max(100 - (position - 1) * 5, 5);
}

// Ranking de competición: empates comparten posición (1, 2, 2, 4)
function rank<T>(rows: T[], score: (row: T) => number, asc: boolean) {
  const sorted = [...rows].sort((a, b) =>
    asc ? score(a) - score(b) : score(b) - score(a),
  );

  return sorted.map((row) => ({
    row,
    position: sorted.findIndex((other) => score(other) === score(row)) + 1,
  }));
}

function displayName(firstName: string, lastName: string) {
  return `${firstName} ${lastName.charAt(0)}.`;
}

// Clasificación con los resultados oficiales: solo videos aprobados (§52) y
// el mejor resultado válido de cada competidor por semana (§29).
// Con ~40 competidores se calcula en memoria; no hace falta tabla results.
export async function getRankings(
  category: Category,
  meUserId: string,
  now = new Date(),
): Promise<Rankings | null> {
  const [tournament] = await db
    .select()
    .from(tournaments)
    .where(eq(tournaments.status, "active"))
    .limit(1);

  if (!tournament) return null;

  const weekRows = await db
    .select({ week: tournamentWeeks, challengeName: challenges.name })
    .from(tournamentWeeks)
    .leftJoin(challenges, eq(challenges.weekId, tournamentWeeks.id))
    .where(eq(tournamentWeeks.tournamentId, tournament.id))
    .orderBy(asc(tournamentWeeks.weekNumber));

  const weeks: RankingWeek[] = weekRows.map(({ week, challengeName }) => {
    const status = getWeekStatus(week, now);

    return {
      number: week.weekNumber,
      status,
      challengeName:
        status === "upcoming" ? undefined : (challengeName ?? undefined),
    };
  });

  const results = await db
    .select({
      userId: submissions.userId,
      weekNumber: tournamentWeeks.weekNumber,
      rawTimeMs: submissions.rawTimeMs,
      penaltyMs: submissions.penaltyMs,
      finalTimeMs: submissions.finalTimeMs,
      firstName: profiles.firstName,
      lastName: profiles.lastName,
    })
    .from(submissions)
    .innerJoin(challenges, eq(challenges.id, submissions.challengeId))
    .innerJoin(tournamentWeeks, eq(tournamentWeeks.id, challenges.weekId))
    .innerJoin(profiles, eq(profiles.id, submissions.userId))
    .innerJoin(
      registrations,
      and(
        eq(registrations.userId, submissions.userId),
        eq(registrations.tournamentId, tournament.id),
      ),
    )
    .where(
      and(
        eq(tournamentWeeks.tournamentId, tournament.id),
        eq(submissions.status, "approved"),
        eq(registrations.status, "approved"),
        eq(registrations.category, category),
      ),
    );

  const weekly: Record<number, WeeklyRow[]> = {};

  for (const week of weeks) {
    // Mejor resultado válido por competidor en esta semana
    const best = new Map<string, (typeof results)[number]>();

    for (const r of results) {
      if (r.weekNumber !== week.number || r.finalTimeMs === null) continue;
      const current = best.get(r.userId);

      if (!current || r.finalTimeMs < current.finalTimeMs!)
        best.set(r.userId, r);
    }

    if (best.size === 0) continue;

    weekly[week.number] = rank(
      Array.from(best.values()),
      (r) => r.finalTimeMs!,
      true,
    ).map(({ row, position }) => ({
      id: row.userId,
      name: displayName(row.firstName, row.lastName),
      isMe: row.userId === meUserId,
      position,
      rawTimeMs: row.rawTimeMs ?? row.finalTimeMs!,
      penaltyMs: row.penaltyMs ?? 0,
      finalTimeMs: row.finalTimeMs!,
      points: pointsFor(position),
    }));
  }

  // Acumulada (§24): suma de puntos de las semanas
  const competitors = new Map<string, { name: string }>();

  for (const rows of Object.values(weekly)) {
    for (const r of rows) competitors.set(r.id, { name: r.name });
  }

  const totals = Array.from(competitors.entries()).map(([id, { name }]) => {
    const weekPoints = weeks.map(
      (w) => weekly[w.number]?.find((r) => r.id === id)?.points ?? null,
    );

    return {
      id,
      name,
      isMe: id === meUserId,
      weekPoints,
      total: weekPoints.reduce<number>((sum, p) => sum + (p ?? 0), 0),
    };
  });

  const accumulated: AccumulatedRow[] = rank(totals, (r) => r.total, false).map(
    ({ row, position }) => ({ ...row, position }),
  );

  return {
    weeks,
    accumulated,
    weekly,
    isFinal: weeks.length > 0 && weeks.every((w) => w.status === "closed"),
  };
}
