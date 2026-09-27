import "server-only";

import { and, asc, desc, eq, inArray } from "drizzle-orm";

import { db } from "@/server/db/client";
import {
  challenges,
  extraAttempts,
  payments,
  profiles,
  registrations,
  submissions,
  tournamentWeeks,
} from "@/server/db/schema";

export type ExtraStatus =
  "pending_review" | "rejected" | "available" | "used" | "expired";

// Estado derivado del intento extra (ver schema)
export function extraStatus(input: {
  paymentStatus: "pending_review" | "approved" | "rejected";
  submissionStatus: string | null;
  weekEndsAt: Date;
  now?: Date;
}): ExtraStatus {
  if (input.paymentStatus !== "approved") return input.paymentStatus;
  if (input.submissionStatus && input.submissionStatus !== "rejected")
    return "used";
  if ((input.now ?? new Date()) > input.weekEndsAt) return "expired";

  return "available";
}

// Intentos extra del competidor en un reto, con su estado
export async function listMyExtras(challengeId: string, userId: string) {
  const rows = await db
    .select({
      extra: extraAttempts,
      payment: payments,
      submissionStatus: submissions.status,
      weekEndsAt: tournamentWeeks.endsAt,
    })
    .from(extraAttempts)
    .innerJoin(payments, eq(payments.id, extraAttempts.paymentId))
    .innerJoin(challenges, eq(challenges.id, extraAttempts.challengeId))
    .innerJoin(tournamentWeeks, eq(tournamentWeeks.id, challenges.weekId))
    .leftJoin(submissions, eq(submissions.id, extraAttempts.submissionId))
    .where(
      and(
        eq(extraAttempts.challengeId, challengeId),
        eq(extraAttempts.userId, userId),
      ),
    )
    .orderBy(asc(extraAttempts.createdAt));

  return rows.map((row) => ({
    ...row,
    status: extraStatus({
      paymentStatus: row.payment.status,
      submissionStatus: row.submissionStatus,
      weekEndsAt: row.weekEndsAt,
    }),
  }));
}

export type ExtraRequestFilter = "pending_review" | "approved" | "rejected";

const reviewColumns = {
  extra: extraAttempts,
  payment: payments,
  firstName: profiles.firstName,
  lastName: profiles.lastName,
  email: profiles.email,
  category: registrations.category,
  weekNumber: tournamentWeeks.weekNumber,
  weekEndsAt: tournamentWeeks.endsAt,
  challengeName: challenges.name,
};

function reviewQuery() {
  return db
    .select(reviewColumns)
    .from(extraAttempts)
    .innerJoin(payments, eq(payments.id, extraAttempts.paymentId))
    .innerJoin(profiles, eq(profiles.id, extraAttempts.userId))
    .innerJoin(challenges, eq(challenges.id, extraAttempts.challengeId))
    .innerJoin(tournamentWeeks, eq(tournamentWeeks.id, challenges.weekId))
    .leftJoin(
      registrations,
      and(
        eq(registrations.userId, extraAttempts.userId),
        eq(registrations.tournamentId, payments.tournamentId),
      ),
    );
}

// Bandeja del admin (§26). Pendientes: las más antiguas primero.
export async function listExtraRequestsForReview(filter: ExtraRequestFilter) {
  return reviewQuery()
    .where(eq(payments.status, filter))
    .orderBy(
      filter === "pending_review"
        ? asc(payments.createdAt)
        : desc(payments.reviewedAt),
    )
    .limit(200);
}

export async function getExtraRequestForReview(extraId: string) {
  const [row] = await reviewQuery()
    .where(eq(extraAttempts.id, extraId))
    .limit(1);

  if (!row) return null;

  // Resultado actual del competidor en ese reto (§28: "resultado actual")
  const attempts = await db
    .select({
      attemptNumber: submissions.attemptNumber,
      status: submissions.status,
      finalTimeMs: submissions.finalTimeMs,
    })
    .from(submissions)
    .where(
      and(
        eq(submissions.challengeId, row.extra.challengeId),
        eq(submissions.userId, row.extra.userId),
      ),
    )
    .orderBy(asc(submissions.attemptNumber));

  return { ...row, attempts };
}

export async function getNextPendingExtraId() {
  const [row] = await db
    .select({ id: extraAttempts.id })
    .from(extraAttempts)
    .innerJoin(payments, eq(payments.id, extraAttempts.paymentId))
    .where(inArray(payments.status, ["pending_review"]))
    .orderBy(asc(payments.createdAt))
    .limit(1);

  return row?.id ?? null;
}
