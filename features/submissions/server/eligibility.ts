import "server-only";

import { listMyExtras } from "@/features/extra-videos/server/queries";

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
  | { reason: "already_submitted" }
  | { reason: "extra_pending" };

type Active = NonNullable<Awaited<ReturnType<typeof getActiveChallenge>>>;

export type Eligibility =
  | ({ ok: false } & Blocked & { active?: Active })
  | {
      ok: true;
      tournamentId: string;
      active: Active;
      nextAttempt: number;
      // Intento extra pagado que se usará (null = intento incluido de la semana)
      extraAttemptId: string | null;
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

  const [previous, extras] = await Promise.all([
    listChallengeSubmissions(active.challenge.id, userId),
    listMyExtras(active.challenge.id, userId),
  ]);
  const ok = {
    ok: true as const,
    tournamentId: tournament.id,
    active,
    nextAttempt: previous.length + 1,
  };

  // Un video rechazado no consume el intento: se puede volver a enviar.
  const linkedToExtra = new Set(
    extras.map((e) => e.extra.submissionId).filter(Boolean),
  );
  const baseUsed = previous.some(
    (s) => s.status !== "rejected" && !linkedToExtra.has(s.id),
  );

  if (!baseUsed) return { ...ok, extraAttemptId: null };

  // §27: un intento extra solo se usa con el pago aprobado
  const available = extras.find((e) => e.status === "available");

  if (available) return { ...ok, extraAttemptId: available.extra.id };
  if (extras.some((e) => e.status === "pending_review")) {
    return { ok: false, reason: "extra_pending", active };
  }

  return { ok: false, reason: "already_submitted", active };
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
  extra_pending:
    "Esperando la aprobación del pago de tu video extra. Te avisaremos por email.",
};
