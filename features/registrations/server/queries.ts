import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";

import { db } from "@/server/db/client";
import {
  payments,
  profiles,
  registrations,
  tournaments,
} from "@/server/db/schema";

// Inscripción del competidor con su último pago
export async function getMyRegistration(tournamentId: string, userId: string) {
  const [row] = await db
    .select({ registration: registrations, payment: payments })
    .from(registrations)
    .leftJoin(payments, eq(payments.id, registrations.paymentId))
    .where(
      and(
        eq(registrations.tournamentId, tournamentId),
        eq(registrations.userId, userId),
      ),
    )
    .limit(1);

  return row ?? null;
}

export type RegistrationFilter = "pending_review" | "approved" | "rejected";

const reviewColumns = {
  registration: registrations,
  payment: payments,
  firstName: profiles.firstName,
  lastName: profiles.lastName,
  email: profiles.email,
  phone: profiles.phone,
  expectedFee: tournaments.registrationFee,
};

function reviewQuery() {
  return db
    .select(reviewColumns)
    .from(registrations)
    .innerJoin(profiles, eq(profiles.id, registrations.userId))
    .innerJoin(tournaments, eq(tournaments.id, registrations.tournamentId))
    .leftJoin(payments, eq(payments.id, registrations.paymentId));
}

// Bandeja del admin. Pendientes: las más antiguas primero.
export async function listRegistrationsForReview(filter: RegistrationFilter) {
  return reviewQuery()
    .where(eq(registrations.status, filter))
    .orderBy(
      filter === "pending_review"
        ? asc(registrations.updatedAt)
        : desc(registrations.reviewedAt),
    )
    .limit(200);
}

export async function getRegistrationForReview(id: string) {
  const [row] = await reviewQuery().where(eq(registrations.id, id)).limit(1);

  return row ?? null;
}

export async function getNextPendingRegistrationId() {
  const [row] = await db
    .select({ id: registrations.id })
    .from(registrations)
    .where(eq(registrations.status, "pending_review"))
    .orderBy(asc(registrations.updatedAt))
    .limit(1);

  return row?.id ?? null;
}
