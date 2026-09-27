import "server-only";

import type {
  CompetitorDashboard,
  RegistrationStatus,
} from "../dashboard-types";

import { tournamentInfo } from "@/config/site";

// TODO(Fase 2-4): reemplazar por queries reales. Mientras tanto devuelve datos
// de ejemplo con fechas relativas a hoy para que el reto se vea "en curso".

export const MOCK_STATES = [
  "not_registered",
  "pending_review",
  "approved",
  "rejected",
] as const satisfies readonly RegistrationStatus[];

const DAY = 24 * 60 * 60 * 1000;
const CR_OFFSET = 6 * 60 * 60 * 1000; // Costa Rica = UTC-6, sin horario de verano

// Lunes 00:00 (hora CR) de la semana actual
function currentMonday(now: Date) {
  const cr = new Date(now.getTime() - CR_OFFSET);
  const daysSinceMonday = (cr.getUTCDay() + 6) % 7;
  const mondayCr = Date.UTC(
    cr.getUTCFullYear(),
    cr.getUTCMonth(),
    cr.getUTCDate() - daysSinceMonday,
  );

  return new Date(mondayCr + CR_OFFSET);
}

export async function getCompetitorDashboard(
  _profileId: string,
  state: RegistrationStatus = "approved",
): Promise<CompetitorDashboard> {
  const now = new Date();
  const activeStart = currentMonday(now);
  const activeWeek = 2;
  const weekStart = (n: number) =>
    new Date(activeStart.getTime() + (n - activeWeek) * 7 * DAY);
  // Domingo 23:59:59
  const weekEnd = (n: number) =>
    new Date(weekStart(n).getTime() + 7 * DAY - 1000);

  const names = ["Pull up", "Muscle up", "Pistol squat", "Toes to bar"];
  const isApproved = state === "approved";

  return {
    tournament: {
      name: "Torneo Online · Temporada 1",
      registrationFee: tournamentInfo.registrationFee,
      extraVideoFee: tournamentInfo.extraVideoFee,
    },
    registration: {
      status: state,
      rejectionReason:
        state === "rejected"
          ? "El comprobante es ilegible. Sube una captura más clara."
          : undefined,
    },
    weeks: [1, 2, 3, 4].map((n) => ({
      number: n,
      status:
        n < activeWeek ? "closed" : n === activeWeek ? "active" : "upcoming",
      challengeName: n <= activeWeek ? names[n - 1] : undefined,
      startsAt: weekStart(n),
      endsAt: weekEnd(n),
    })),
    activeChallenge: {
      week: activeWeek,
      name: "Muscle up",
      objective: "Completa el set en el menor tiempo posible.",
      exercises: [
        { name: "Muscle up", reps: 10, penaltySeconds: 5 },
        { name: "Dip", reps: 20, penaltySeconds: 3 },
        { name: "Push up", reps: 30, penaltySeconds: 3 },
      ],
      rules: [
        "Video continuo, sin cortes ni edición.",
        "Todo el cuerpo debe verse en la toma.",
        "Brazos totalmente extendidos al inicio de cada repetición.",
      ],
      endsAt: weekEnd(activeWeek),
    },
    attempts: isApproved
      ? [
          {
            number: 1,
            status: "approved",
            finalTimeMs: 155_000,
            submittedAt: new Date(weekStart(activeWeek).getTime() + 1.5 * DAY),
          },
        ]
      : [],
    extraVideo: isApproved ? "available" : "unavailable",
    standing: isApproved
      ? { position: 4, totalPoints: 170, competitors: 18 }
      : null,
    leaderboard: [
      { position: 1, name: "Juan P.", points: 195 },
      { position: 2, name: "Pedro M.", points: 190 },
      { position: 3, name: "Carlos R.", points: 185 },
      ...(isApproved
        ? [{ position: 4, name: "Tú", points: 170, isMe: true }]
        : []),
    ],
  };
}
