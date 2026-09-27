import "server-only";

import { and, count, eq, inArray } from "drizzle-orm";

import { getWeekStatus } from "@/features/tournaments/week-status";
import { db } from "@/server/db/client";
import {
  payments,
  profiles,
  registrations,
  submissions,
  tournaments,
  tournamentWeeks,
} from "@/server/db/schema";

// Resumen del panel administrativo (§34)
export async function getAdminStats() {
  const [tournament] = await db
    .select()
    .from(tournaments)
    .where(eq(tournaments.status, "active"))
    .limit(1);

  const [
    [competitors],
    [pendingVideos],
    [pendingPayments],
    registrationRows,
    weeks,
  ] = await Promise.all([
    db
      .select({ n: count() })
      .from(profiles)
      .where(eq(profiles.role, "competitor")),
    db
      .select({ n: count() })
      .from(submissions)
      .where(inArray(submissions.status, ["pending", "under_review"])),
    db
      .select({ n: count() })
      .from(payments)
      .where(
        and(
          eq(payments.status, "pending_review"),
          eq(payments.kind, "extra_video"),
        ),
      ),
    tournament
      ? db
          .select({ status: registrations.status, n: count() })
          .from(registrations)
          .where(eq(registrations.tournamentId, tournament.id))
          .groupBy(registrations.status)
      : Promise.resolve([]),
    tournament
      ? db
          .select()
          .from(tournamentWeeks)
          .where(eq(tournamentWeeks.tournamentId, tournament.id))
      : Promise.resolve([]),
  ]);

  const byStatus = Object.fromEntries(
    registrationRows.map((r) => [r.status, r.n]),
  );
  const activeWeek = weeks.find((week) => getWeekStatus(week) === "active");

  return {
    tournamentName: tournament?.name ?? null,
    competitors: competitors.n,
    registrationsPending: byStatus.pending_review ?? 0,
    registrationsApproved: byStatus.approved ?? 0,
    pendingVideos: pendingVideos.n,
    pendingExtraPayments: pendingPayments.n,
    activeWeek: activeWeek?.weekNumber ?? null,
    totalWeeks: weeks.length,
  };
}
