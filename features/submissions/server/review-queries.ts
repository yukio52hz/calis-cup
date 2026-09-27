import "server-only";

import { and, asc, desc, eq, inArray } from "drizzle-orm";

import { db } from "@/server/db/client";
import {
  challengeExercises,
  challenges,
  profiles,
  registrations,
  submissions,
  tournamentWeeks,
} from "@/server/db/schema";

export type ReviewFilter = "pending" | "approved" | "rejected";

const STATUSES: Record<
  ReviewFilter,
  ("pending" | "under_review" | "approved" | "rejected")[]
> = {
  pending: ["pending", "under_review"],
  approved: ["approved"],
  rejected: ["rejected"],
};

const competitorColumns = {
  submission: submissions,
  firstName: profiles.firstName,
  lastName: profiles.lastName,
  email: profiles.email,
  // Categoría con la que se inscribió (§41); si no hay inscripción, la del perfil
  category: registrations.category,
  profileCategory: profiles.category,
  weekNumber: tournamentWeeks.weekNumber,
  weekEndsAt: tournamentWeeks.endsAt,
  challengeName: challenges.name,
};

function baseQuery() {
  return db
    .select(competitorColumns)
    .from(submissions)
    .innerJoin(profiles, eq(profiles.id, submissions.userId))
    .innerJoin(challenges, eq(challenges.id, submissions.challengeId))
    .innerJoin(tournamentWeeks, eq(tournamentWeeks.id, challenges.weekId))
    .leftJoin(
      registrations,
      and(
        eq(registrations.userId, submissions.userId),
        eq(registrations.tournamentId, tournamentWeeks.tournamentId),
      ),
    );
}

// Bandeja del admin (§18). Pendientes: los más antiguos primero.
export async function listSubmissionsForReview(filter: ReviewFilter) {
  return baseQuery()
    .where(inArray(submissions.status, STATUSES[filter]))
    .orderBy(
      filter === "pending"
        ? asc(submissions.createdAt)
        : desc(submissions.reviewedAt),
    )
    .limit(100);
}

export async function getSubmissionForReview(id: string) {
  const [row] = await baseQuery().where(eq(submissions.id, id)).limit(1);

  if (!row) return null;

  const exercises = await db
    .select()
    .from(challengeExercises)
    .where(eq(challengeExercises.challengeId, row.submission.challengeId))
    .orderBy(asc(challengeExercises.sortOrder));

  return { ...row, exercises };
}

// Siguiente video pendiente (para "Guardar y revisar el siguiente")
export async function getNextPendingSubmissionId() {
  const [row] = await db
    .select({ id: submissions.id })
    .from(submissions)
    .where(inArray(submissions.status, STATUSES.pending))
    .orderBy(asc(submissions.createdAt))
    .limit(1);

  return row?.id ?? null;
}
