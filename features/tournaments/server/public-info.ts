import "server-only";

import { count, eq } from "drizzle-orm";

import { tournamentInfo } from "@/config/site";
import { db } from "@/server/db/client";
import { tournaments, tournamentWeeks } from "@/server/db/schema";

export type PublicTournamentInfo = {
  registrationFee: number;
  extraVideoFee: number;
  weeks: number;
  // Primeras posiciones de la tabla de puntos (§22)
  points: number[];
};

// Datos del torneo activo para la landing; sin torneo, los valores de config/site
export async function getPublicTournamentInfo(): Promise<PublicTournamentInfo> {
  const [tournament] = await db
    .select()
    .from(tournaments)
    .where(eq(tournaments.status, "active"))
    .limit(1);

  if (!tournament) {
    return {
      registrationFee: tournamentInfo.registrationFee,
      extraVideoFee: tournamentInfo.extraVideoFee,
      weeks: tournamentInfo.weeks,
      points: tournamentInfo.points,
    };
  }

  const [weeks] = await db
    .select({ n: count() })
    .from(tournamentWeeks)
    .where(eq(tournamentWeeks.tournamentId, tournament.id));

  return {
    registrationFee: tournament.registrationFee,
    extraVideoFee: tournament.extraVideoFee,
    weeks: weeks.n || tournamentInfo.weeks,
    points: tournament.pointsByPosition.slice(0, 5),
  };
}
