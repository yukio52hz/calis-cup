import "server-only";

import { and, asc, count, desc, eq, sql } from "drizzle-orm";

import { db } from "@/server/db/client";
import {
  challengeExercises,
  challenges,
  registrations,
  submissions,
  tournaments,
  tournamentWeeks,
} from "@/server/db/schema";

// Torneo que administra el panel: el activo; si no, el borrador más reciente
export async function getManagedTournament() {
  const [tournament] = await db
    .select()
    .from(tournaments)
    .orderBy(
      sql`case ${tournaments.status} when 'active' then 0 when 'draft' then 1 else 2 end`,
      desc(tournaments.createdAt),
    )
    .limit(1);

  return tournament ?? null;
}

export async function listWeeksForAdmin(tournamentId: string) {
  return db
    .select({
      week: tournamentWeeks,
      challengeName: challenges.name,
      hasExample: sql<boolean>`${challenges.exampleVideoPath} is not null`,
      exercises: sql<number>`(select count(*)::int from ${challengeExercises} where ${challengeExercises.challengeId} = ${challenges.id})`,
      videos: sql<number>`(select count(*)::int from ${submissions} where ${submissions.challengeId} = ${challenges.id})`,
    })
    .from(tournamentWeeks)
    .leftJoin(challenges, eq(challenges.weekId, tournamentWeeks.id))
    .where(eq(tournamentWeeks.tournamentId, tournamentId))
    .orderBy(asc(tournamentWeeks.weekNumber));
}

export async function getWeekForEdit(tournamentId: string, weekNumber: number) {
  const [row] = await db
    .select({ week: tournamentWeeks, challenge: challenges })
    .from(tournamentWeeks)
    .leftJoin(challenges, eq(challenges.weekId, tournamentWeeks.id))
    .where(
      and(
        eq(tournamentWeeks.tournamentId, tournamentId),
        eq(tournamentWeeks.weekNumber, weekNumber),
      ),
    )
    .limit(1);

  if (!row) return null;

  const [exercises, [videos]] = await Promise.all([
    row.challenge
      ? db
          .select()
          .from(challengeExercises)
          .where(eq(challengeExercises.challengeId, row.challenge.id))
          .orderBy(asc(challengeExercises.sortOrder))
      : Promise.resolve([]),
    row.challenge
      ? db
          .select({ n: count() })
          .from(submissions)
          .where(eq(submissions.challengeId, row.challenge.id))
      : Promise.resolve([{ n: 0 }]),
  ]);

  return { ...row, exercises, videoCount: videos.n };
}

export async function getWeekById(weekId: string) {
  const [row] = await db
    .select({
      week: tournamentWeeks,
      challenge: challenges,
      tournament: tournaments,
    })
    .from(tournamentWeeks)
    .innerJoin(tournaments, eq(tournaments.id, tournamentWeeks.tournamentId))
    .leftJoin(challenges, eq(challenges.weekId, tournamentWeeks.id))
    .where(eq(tournamentWeeks.id, weekId))
    .limit(1);

  return row ?? null;
}

// Destinatarios del aviso "Nuevo reto": inscritos aprobados
export async function listApprovedCompetitorIds(tournamentId: string) {
  const rows = await db
    .select({ userId: registrations.userId })
    .from(registrations)
    .where(
      and(
        eq(registrations.tournamentId, tournamentId),
        eq(registrations.status, "approved"),
      ),
    );

  return rows.map((row) => row.userId);
}
