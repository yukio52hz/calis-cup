import "server-only";

import {
  getActiveChallenge,
  getActiveTournament,
  getRegistration,
  listChallengeSubmissions,
} from "./queries";

export type Blocked =
  | { reason: "no_tournament" }
  | { reason: "not_registered" }
  | { reason: "registration_pending" }
  | { reason: "registration_rejected" }
  | { reason: "no_active_week" }
  | { reason: "already_submitted" };

type Active = NonNullable<Awaited<ReturnType<typeof getActiveChallenge>>>;

export type Eligibility =
  | ({ ok: false } & Blocked & { active?: Active })
  | {
      ok: true;
      tournamentId: string;
      active: Active;
      nextAttempt: number;
    };

// Reglas del §52 que controla el servidor antes de aceptar un video.
// `graceMs` da margen para confirmar una subida que empezó antes del cierre.
export async function getUploadEligibility(
  userId: string,
  { graceMs = 0 } = {},
): Promise<Eligibility> {
  const tournament = await getActiveTournament();

  if (!tournament) return { ok: false, reason: "no_tournament" };

  const [registration, active] = await Promise.all([
    getRegistration(tournament.id, userId),
    getActiveChallenge(tournament.id, new Date(Date.now() - graceMs)),
  ]);

  if (!registration)
    return { ok: false, reason: "not_registered", active: active ?? undefined };
  if (registration.status === "pending_review") {
    return {
      ok: false,
      reason: "registration_pending",
      active: active ?? undefined,
    };
  }
  if (registration.status === "rejected") {
    return {
      ok: false,
      reason: "registration_rejected",
      active: active ?? undefined,
    };
  }
  if (!active) return { ok: false, reason: "no_active_week" };

  const previous = await listChallengeSubmissions(active.challenge.id, userId);
  // Un video rechazado no consume el intento: se puede volver a enviar.
  // Los intentos extra pagados (§25-27) se suman en la Fase 6.
  const hasValidAttempt = previous.some((s) => s.status !== "rejected");

  if (hasValidAttempt)
    return { ok: false, reason: "already_submitted", active };

  return {
    ok: true,
    tournamentId: tournament.id,
    active,
    nextAttempt: previous.length + 1,
  };
}

export const BLOCKED_MESSAGES: Record<Blocked["reason"], string> = {
  no_tournament: "Todavía no hay un torneo activo.",
  not_registered: "Inscríbete al torneo para poder subir tu video.",
  registration_pending:
    "Tu inscripción está en revisión. Podrás subir tu video cuando sea aprobada.",
  registration_rejected:
    "Tu inscripción fue rechazada. Revisa el motivo en tu panel y vuelve a enviarla.",
  no_active_week: "No hay un reto activo en este momento.",
  already_submitted: "Ya enviaste tu video de esta semana.",
};
