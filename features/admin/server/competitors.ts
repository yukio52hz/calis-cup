import "server-only";

import { and, asc, desc, eq, ilike, isNotNull, or, sql } from "drizzle-orm";

import { getRankings } from "@/features/rankings/server/queries";
import { getActiveTournament } from "@/features/submissions/server/queries";
import { db } from "@/server/db/client";
import {
  challenges,
  payments,
  profiles,
  registrations,
  submissions,
  tournamentWeeks,
} from "@/server/db/schema";

export type CompetitorFilter = "all" | "pending" | "approved" | "none";

// §35: competidores con su inscripción en el torneo activo y su progreso
export async function listCompetitors(
  filter: CompetitorFilter,
  search: string,
) {
  const tournament = await getActiveTournament();
  const term = search.trim();

  const rows = await db
    .select({
      profile: profiles,
      registrationStatus: registrations.status,
      registrationCategory: registrations.category,
      videos: sql<number>`(select count(*)::int from ${submissions} where ${submissions.userId} = ${profiles.id})`,
    })
    .from(profiles)
    .leftJoin(
      registrations,
      and(
        eq(registrations.userId, profiles.id),
        eq(registrations.tournamentId, tournament?.id ?? sql`null`),
      ),
    )
    .where(
      and(
        // Competidores y también admins que compiten (tienen inscripción)
        or(eq(profiles.role, "competitor"), isNotNull(registrations.id)),
        term
          ? or(
              ilike(profiles.firstName, `%${term}%`),
              ilike(profiles.lastName, `%${term}%`),
              ilike(profiles.email, `%${term}%`),
            )
          : undefined,
        filter === "pending"
          ? eq(registrations.status, "pending_review")
          : undefined,
        filter === "approved"
          ? eq(registrations.status, "approved")
          : undefined,
        filter === "none" ? sql`${registrations.id} is null` : undefined,
      ),
    )
    .orderBy(asc(profiles.firstName), asc(profiles.lastName));

  // Posición y puntos acumulados de cada categoría (§24)
  const standings = new Map<string, { position: number; total: number }>();

  if (tournament) {
    for (const category of ["female", "male"] as const) {
      const rankings = await getRankings(category, "");

      for (const row of rankings?.accumulated ?? []) {
        standings.set(row.id, { position: row.position, total: row.total });
      }
    }
  }

  return rows.map((row) => ({
    ...row,
    standing: standings.get(row.profile.id) ?? null,
  }));
}

// Ficha del competidor
export async function getCompetitorDetail(userId: string) {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  if (!profile) return null;

  const tournament = await getActiveTournament();

  const [registration, paymentRows, attempts] = await Promise.all([
    tournament
      ? db
          .select()
          .from(registrations)
          .where(
            and(
              eq(registrations.userId, userId),
              eq(registrations.tournamentId, tournament.id),
            ),
          )
          .limit(1)
          .then((r) => r[0] ?? null)
      : Promise.resolve(null),
    db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt)),
    db
      .select({
        submission: submissions,
        weekNumber: tournamentWeeks.weekNumber,
        challengeName: challenges.name,
      })
      .from(submissions)
      .innerJoin(challenges, eq(challenges.id, submissions.challengeId))
      .innerJoin(tournamentWeeks, eq(tournamentWeeks.id, challenges.weekId))
      .where(eq(submissions.userId, userId))
      .orderBy(
        desc(tournamentWeeks.weekNumber),
        desc(submissions.attemptNumber),
      ),
  ]);

  const category = registration?.category ?? profile.category;
  const rankings = tournament ? await getRankings(category, userId) : null;
  const standing = rankings?.accumulated.find((row) => row.isMe) ?? null;

  return {
    profile,
    registration,
    payments: paymentRows,
    attempts,
    standing,
    rankings,
  };
}
