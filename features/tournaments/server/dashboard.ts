import "server-only";

import type { CompetitorDashboard } from "../dashboard-types";

import { and, asc, eq } from "drizzle-orm";

import { getExtraPurchaseEligibility } from "@/features/extra-videos/server/eligibility";
import { listMyExtras } from "@/features/extra-videos/server/queries";
import { getRankings } from "@/features/rankings/server/queries";
import {
  getActiveChallenge,
  getActiveTournament,
  getRegistration,
  listChallengeSubmissions,
} from "@/features/submissions/server/queries";
import { db } from "@/server/db/client";
import { challenges, tournamentWeeks } from "@/server/db/schema";
import { createReadUrls } from "@/server/storage/files";

import { getWeekStatus } from "../week-status";

type Profile = { id: string; category: "female" | "male" };

// Datos del dashboard del competidor (§12-15, §23, §29). null = sin torneo activo.
export async function getCompetitorDashboard(
  profile: Profile,
): Promise<CompetitorDashboard | null> {
  const tournament = await getActiveTournament();

  if (!tournament) return null;

  const now = new Date();
  const [registration, active, weekRows] = await Promise.all([
    getRegistration(tournament.id, profile.id),
    getActiveChallenge(tournament.id, now),
    db
      .select({ week: tournamentWeeks, challengeName: challenges.name })
      .from(tournamentWeeks)
      .leftJoin(challenges, eq(challenges.weekId, tournamentWeeks.id))
      .where(and(eq(tournamentWeeks.tournamentId, tournament.id)))
      .orderBy(asc(tournamentWeeks.weekNumber)),
  ]);

  const category = registration?.category ?? profile.category;
  const isApproved = registration?.status === "approved";
  const [attempts, rankings, extras, purchase] = await Promise.all([
    active && isApproved
      ? listChallengeSubmissions(active.challenge.id, profile.id)
      : Promise.resolve([]),
    getRankings(category, profile.id, now),
    active && isApproved
      ? listMyExtras(active.challenge.id, profile.id)
      : Promise.resolve([]),
    isApproved
      ? getExtraPurchaseEligibility(profile.id)
      : Promise.resolve(null),
  ]);

  // §25-27: estado del video extra para el bloque "¿Quieres mejorar tu tiempo?"
  const extraVideo = extras.some((e) => e.status === "available")
    ? "approved"
    : extras.some((e) => e.status === "pending_review")
      ? "pending_review"
      : purchase?.ok
        ? "available"
        : "unavailable";

  const examplePath = active?.challenge.exampleVideoPath;
  const exampleVideoUrl = examplePath
    ? (await createReadUrls("videos", [examplePath])).get(examplePath)
    : undefined;
  const accumulated = rankings?.accumulated ?? [];
  const me = accumulated.find((row) => row.isMe);

  return {
    tournament: {
      name: tournament.name,
      registrationFee: tournament.registrationFee,
      extraVideoFee: tournament.extraVideoFee,
    },
    registration: {
      status: registration?.status ?? "not_registered",
      rejectionReason: registration?.rejectionReason ?? undefined,
    },
    weeks: weekRows.map(({ week, challengeName }) => {
      const status = getWeekStatus(week, now);

      return {
        number: week.weekNumber,
        status,
        challengeName:
          status === "upcoming" ? undefined : (challengeName ?? undefined),
        startsAt: week.startsAt,
        endsAt: week.endsAt,
      };
    }),
    activeChallenge: active
      ? {
          week: active.week.weekNumber,
          name: active.challenge.name,
          objective: active.challenge.objective ?? "",
          rules: active.challenge.rules,
          exercises: active.exercises.map((e) => ({
            name: e.name,
            reps: e.repetitions,
            penaltySeconds: e.penaltySeconds,
          })),
          endsAt: active.week.endsAt,
          exampleVideoUrl,
        }
      : null,
    attempts: attempts.map((s) => ({
      number: s.attemptNumber,
      status: s.status,
      finalTimeMs: s.finalTimeMs ?? undefined,
      submittedAt: s.createdAt,
    })),
    extraVideo,
    standing: me
      ? {
          position: me.position,
          totalPoints: me.total,
          competitors: accumulated.length,
        }
      : null,
    // Top 3 de la categoría + mi fila si no estoy en el podio
    leaderboard: [
      ...accumulated.slice(0, 3),
      ...(me && me.position > 3 ? [me] : []),
    ].map((row) => ({
      position: row.position,
      name: row.isMe ? "Tú" : row.name,
      points: row.total,
      isMe: row.isMe,
    })),
  };
}
