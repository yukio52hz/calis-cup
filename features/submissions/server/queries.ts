import "server-only";

import { and, asc, desc, eq, gte, isNotNull, lte } from "drizzle-orm";

import { db } from "@/server/db/client";
import {
  challengeExercises,
  challenges,
  registrations,
  submissions,
  tournaments,
  tournamentWeeks,
} from "@/server/db/schema";

// MVP: un solo torneo activo a la vez
export async function getActiveTournament() {
  const [tournament] = await db
    .select()
    .from(tournaments)
    .where(eq(tournaments.status, "active"))
    .orderBy(desc(tournaments.createdAt))
    .limit(1);

  return tournament ?? null;
}

// Semana publicada cuyo rango de fechas incluye `now` (§14, §33)
export async function getActiveChallenge(
  tournamentId: string,
  now = new Date(),
) {
  const [row] = await db
    .select({ week: tournamentWeeks, challenge: challenges })
    .from(tournamentWeeks)
    .innerJoin(challenges, eq(challenges.weekId, tournamentWeeks.id))
    .where(
      and(
        eq(tournamentWeeks.tournamentId, tournamentId),
        isNotNull(tournamentWeeks.publishedAt),
        lte(tournamentWeeks.startsAt, now),
        gte(tournamentWeeks.endsAt, now),
      ),
    )
    .limit(1);

  if (!row) return null;

  const exercises = await db
    .select()
    .from(challengeExercises)
    .where(eq(challengeExercises.challengeId, row.challenge.id))
    .orderBy(asc(challengeExercises.sortOrder));

  return { ...row, exercises };
}

export async function getRegistration(tournamentId: string, userId: string) {
  const [registration] = await db
    .select()
    .from(registrations)
    .where(
      and(
        eq(registrations.tournamentId, tournamentId),
        eq(registrations.userId, userId),
      ),
    )
    .limit(1);

  return registration ?? null;
}

export async function listChallengeSubmissions(
  challengeId: string,
  userId: string,
) {
  return db
    .select()
    .from(submissions)
    .where(
      and(
        eq(submissions.challengeId, challengeId),
        eq(submissions.userId, userId),
      ),
    )
    .orderBy(asc(submissions.attemptNumber));
}

// Historial de intentos del competidor en el torneo (§29)
export async function listMySubmissions(tournamentId: string, userId: string) {
  return db
    .select({
      submission: submissions,
      weekNumber: tournamentWeeks.weekNumber,
      challengeName: challenges.name,
    })
    .from(submissions)
    .innerJoin(challenges, eq(challenges.id, submissions.challengeId))
    .innerJoin(tournamentWeeks, eq(tournamentWeeks.id, challenges.weekId))
    .where(
      and(
        eq(tournamentWeeks.tournamentId, tournamentId),
        eq(submissions.userId, userId),
      ),
    )
    .orderBy(desc(tournamentWeeks.weekNumber), desc(submissions.attemptNumber));
}
