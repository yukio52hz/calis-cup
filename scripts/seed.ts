// Carga un torneo de ejemplo para desarrollo. Idempotente: se puede correr
// varias veces (actualiza fechas para que la semana 2 sea la semana actual).
//
//   bun run db:seed                       → torneo, semanas y retos
//   bun run db:seed tu@email.com otro@…   → además aprueba la inscripción
//                                            de esos perfiles (ya creados)
import { eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "../server/db/schema";

const {
  tournaments,
  tournamentWeeks,
  challenges,
  challengeExercises,
  registrations,
  profiles,
} = schema;

const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!url) throw new Error("Falta DIRECT_URL/DATABASE_URL en .env.local");

const sql = postgres(url, { prepare: false });
const db = drizzle(sql, { schema, casing: "snake_case" });

const DAY = 24 * 60 * 60 * 1000;
const CR_OFFSET = 6 * 60 * 60 * 1000; // Costa Rica = UTC-6

// Lunes 00:00 (hora CR) de la semana actual
function currentMonday() {
  const cr = new Date(Date.now() - CR_OFFSET);
  const daysSinceMonday = (cr.getUTCDay() + 6) % 7;

  return new Date(
    Date.UTC(cr.getUTCFullYear(), cr.getUTCMonth(), cr.getUTCDate() - daysSinceMonday) +
      CR_OFFSET,
  );
}

const CHALLENGES = [
  {
    name: "Pull up",
    objective: "Completa el set en el menor tiempo posible.",
    exercises: [
      { name: "Pull up", repetitions: 15, penaltySeconds: 5 },
      { name: "Push up", repetitions: 30, penaltySeconds: 3 },
    ],
  },
  {
    name: "Muscle up",
    objective: "Completa el set en el menor tiempo posible.",
    exercises: [
      { name: "Muscle up", repetitions: 10, penaltySeconds: 5 },
      { name: "Dip", repetitions: 20, penaltySeconds: 3 },
      { name: "Push up", repetitions: 30, penaltySeconds: 3 },
    ],
  },
  {
    name: "Pistol squat",
    objective: "Completa el set en el menor tiempo posible.",
    exercises: [
      { name: "Pistol squat", repetitions: 10, penaltySeconds: 5 },
      { name: "Squat con salto", repetitions: 20, penaltySeconds: 3 },
    ],
  },
  {
    name: "Toes to bar",
    objective: "Completa el set en el menor tiempo posible.",
    exercises: [
      { name: "Toes to bar", repetitions: 15, penaltySeconds: 5 },
      { name: "Chin up", repetitions: 15, penaltySeconds: 5 },
    ],
  },
];

const RULES = [
  "Video continuo, sin cortes ni edición.",
  "Todo el cuerpo debe verse en la toma.",
  "Brazos totalmente extendidos al inicio de cada repetición.",
];

const TOURNAMENT_NAME = "Torneo Online · Temporada 1";
const ACTIVE_WEEK = 2;

async function main() {
  const [tournament] = await db
    .insert(tournaments)
    .values({
      name: TOURNAMENT_NAME,
      description: "4 semanas · 4 retos · 1 clasificación",
      registrationFee: 2500,
      extraVideoFee: 500,
      sinpeNumber: "8888-8888",
      status: "active",
    })
    .onConflictDoUpdate({ target: tournaments.name, set: { status: "active" } })
    .returning();

  const monday = currentMonday();

  for (let index = 0; index < CHALLENGES.length; index++) {
    const data = CHALLENGES[index];
    const weekNumber = index + 1;
    const startsAt = new Date(monday.getTime() + (weekNumber - ACTIVE_WEEK) * 7 * DAY);
    const endsAt = new Date(startsAt.getTime() + 7 * DAY - 1000); // domingo 23:59:59
    // Publicados: semanas pasadas y la actual
    const publishedAt = weekNumber <= ACTIVE_WEEK ? startsAt : null;

    const [week] = await db
      .insert(tournamentWeeks)
      .values({ tournamentId: tournament.id, weekNumber, startsAt, endsAt, publishedAt })
      .onConflictDoUpdate({
        target: [tournamentWeeks.tournamentId, tournamentWeeks.weekNumber],
        set: { startsAt, endsAt, publishedAt },
      })
      .returning();

    const [challenge] = await db
      .insert(challenges)
      .values({ weekId: week.id, name: data.name, objective: data.objective, rules: RULES })
      .onConflictDoUpdate({
        target: challenges.weekId,
        set: { name: data.name, objective: data.objective, rules: RULES },
      })
      .returning();

    await db.delete(challengeExercises).where(eq(challengeExercises.challengeId, challenge.id));
    await db.insert(challengeExercises).values(
      data.exercises.map((exercise, sortOrder) => ({
        ...exercise,
        challengeId: challenge.id,
        sortOrder,
      })),
    );

    console.log(
      `Semana ${weekNumber}: ${data.name} · ${startsAt.toISOString()} → ${endsAt.toISOString()}`,
    );
  }

  const emails = process.argv.slice(2).map((email) => email.toLowerCase());

  if (emails.length) {
    const found = await db.select().from(profiles).where(inArray(profiles.email, emails));

    for (const profile of found) {
      await db
        .insert(registrations)
        .values({
          tournamentId: tournament.id,
          userId: profile.id,
          category: profile.category,
          status: "approved",
          reviewedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [registrations.tournamentId, registrations.userId],
          set: { status: "approved", reviewedAt: new Date(), rejectionReason: null },
        });
      console.log(`Inscripción aprobada: ${profile.email}`);
    }

    const missing = emails.filter((e) => !found.some((p) => p.email === e));

    if (missing.length) {
      console.log(`Sin perfil (regístrate y completa el onboarding primero): ${missing.join(", ")}`);
    }
  }

  await sql.end();
  console.log("Listo.");
}

void main();
