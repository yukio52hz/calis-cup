import "server-only";

import {
  getActiveChallenge,
  getActiveTournament,
  getRegistration,
  listChallengeSubmissions,
} from "@/features/submissions/server/queries";

import { listMyExtras } from "./queries";

type Active = NonNullable<Awaited<ReturnType<typeof getActiveChallenge>>>;

export type PurchaseEligibility =
  | { ok: false; message: string }
  | {
      ok: true;
      tournament: NonNullable<Awaited<ReturnType<typeof getActiveTournament>>>;
      active: Active;
      bestTimeMs: number;
    };

// §30: reglas para comprar un video extra
export async function getExtraPurchaseEligibility(
  userId: string,
): Promise<PurchaseEligibility> {
  const tournament = await getActiveTournament();

  if (!tournament) return { ok: false, message: "No hay un torneo activo." };

  const [registration, active] = await Promise.all([
    getRegistration(tournament.id, userId),
    getActiveChallenge(tournament.id),
  ]);

  if (registration?.status !== "approved") {
    return { ok: false, message: "Necesitas una inscripción aprobada." };
  }
  if (!active) {
    return {
      ok: false,
      message: "No hay una semana activa: el plazo para videos extra terminó.",
    };
  }

  const [previous, extras] = await Promise.all([
    listChallengeSubmissions(active.challenge.id, userId),
    listMyExtras(active.challenge.id, userId),
  ]);

  if (
    previous.some((s) => s.status === "pending" || s.status === "under_review")
  ) {
    return {
      ok: false,
      message:
        "Tu video está en revisión. Cuando tengas tu resultado podrás comprar un video extra.",
    };
  }

  const approvedTimes = previous
    .filter((s) => s.status === "approved" && s.finalTimeMs !== null)
    .map((s) => s.finalTimeMs!);

  if (approvedTimes.length === 0) {
    return {
      ok: false,
      message:
        "El video extra es para mejorar un resultado: primero necesitas un video aprobado.",
    };
  }
  if (extras.some((e) => e.status === "pending_review")) {
    return {
      ok: false,
      message: "Ya tienes un pago de video extra en revisión.",
    };
  }
  if (extras.some((e) => e.status === "available")) {
    return {
      ok: false,
      message: "Ya tienes un video extra disponible: súbelo desde Videos.",
    };
  }

  return {
    ok: true,
    tournament,
    active,
    bestTimeMs: Math.min(...approvedTimes),
  };
}
