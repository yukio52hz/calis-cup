import {
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { categoryEnum, profiles } from "./profiles";

const timestamps = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const tournamentStatusEnum = pgEnum("tournament_status", [
  "draft",
  "active",
  "finished",
]);

// §37
export const tournaments = pgTable("tournaments", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull().unique(),
  description: text(),
  registrationFee: integer().notNull(),
  extraVideoFee: integer().notNull(),
  sinpeNumber: text(),
  status: tournamentStatusEnum().notNull().default("draft"),
  ...timestamps,
}).enableRLS();

// §38. El estado (upcoming/active/closed) se deriva de las fechas.
export const tournamentWeeks = pgTable(
  "tournament_weeks",
  {
    id: uuid().primaryKey().defaultRandom(),
    tournamentId: uuid()
      .notNull()
      .references(() => tournaments.id, { onDelete: "cascade" }),
    weekNumber: integer().notNull(),
    startsAt: timestamp({ withTimezone: true }).notNull(),
    endsAt: timestamp({ withTimezone: true }).notNull(),
    // null = el reto aún no se publica (§14)
    publishedAt: timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (t) => [unique().on(t.tournamentId, t.weekNumber)],
).enableRLS();

// §39. Un reto por semana.
export const challenges = pgTable("challenges", {
  id: uuid().primaryKey().defaultRandom(),
  weekId: uuid()
    .notNull()
    .unique()
    .references(() => tournamentWeeks.id, { onDelete: "cascade" }),
  name: text().notNull(),
  objective: text(),
  rules: text().array().notNull().default([]),
  exampleVideoPath: text(),
  ...timestamps,
}).enableRLS();

// §40
export const challengeExercises = pgTable("challenge_exercises", {
  id: uuid().primaryKey().defaultRandom(),
  challengeId: uuid()
    .notNull()
    .references(() => challenges.id, { onDelete: "cascade" }),
  name: text().notNull(),
  repetitions: integer().notNull(),
  penaltySeconds: integer().notNull().default(0),
  sortOrder: integer().notNull().default(0),
}).enableRLS();

export const paymentKindEnum = pgEnum("payment_kind", [
  "registration",
  "extra_video",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending_review",
  "approved",
  "rejected",
]);

// Pagos SINPE revisados a mano (§9, §26). Compartida por inscripción y video extra.
export const payments = pgTable("payments", {
  id: uuid().primaryKey().defaultRandom(),
  kind: paymentKindEnum().notNull(),
  tournamentId: uuid()
    .notNull()
    .references(() => tournaments.id, { onDelete: "cascade" }),
  userId: uuid()
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  amount: integer().notNull(),
  reference: text().notNull(),
  paidOn: date({ mode: "string" }).notNull(),
  // Ruta dentro del bucket privado "receipts"
  receiptPath: text().notNull(),
  status: paymentStatusEnum().notNull().default("pending_review"),
  rejectionReason: text(),
  reviewedBy: uuid().references(() => profiles.id),
  reviewedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

export const registrationStatusEnum = pgEnum("registration_status", [
  "pending_review",
  "approved",
  "rejected",
]);

// §41 (mínima). Los datos del pago SINPE se agregan en la Fase 2.
export const registrations = pgTable(
  "registrations",
  {
    id: uuid().primaryKey().defaultRandom(),
    tournamentId: uuid()
      .notNull()
      .references(() => tournaments.id, { onDelete: "cascade" }),
    userId: uuid()
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    category: categoryEnum().notNull(),
    status: registrationStatusEnum().notNull().default("pending_review"),
    // Último pago enviado; si se rechaza, el competidor envía uno nuevo
    paymentId: uuid().references(() => payments.id),
    rejectionReason: text(),
    reviewedBy: uuid().references(() => profiles.id),
    reviewedAt: timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (t) => [unique().on(t.tournamentId, t.userId)],
).enableRLS();

export const submissionStatusEnum = pgEnum("submission_status", [
  "pending",
  "under_review",
  "approved",
  "rejected",
]);

// §42. Cada video es un intento independiente.
export const submissions = pgTable(
  "submissions",
  {
    id: uuid().primaryKey().defaultRandom(),
    challengeId: uuid()
      .notNull()
      .references(() => challenges.id, { onDelete: "cascade" }),
    userId: uuid()
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    attemptNumber: integer().notNull(),
    // Ruta dentro del bucket privado "videos"
    videoPath: text().notNull().unique(),
    fileSize: integer().notNull(),
    mimeType: text().notNull(),
    durationMs: integer(),
    status: submissionStatusEnum().notNull().default("pending"),
    rawTimeMs: integer(),
    penaltyMs: integer(),
    // Desglose registrado por el admin (§20): repeticiones incorrectas por ejercicio
    penalties: jsonb()
      .$type<{ exercise: string; count: number; seconds: number }[]>()
      .notNull()
      .default([]),
    finalTimeMs: integer(),
    reviewerNotes: text(),
    reviewedBy: uuid().references(() => profiles.id),
    reviewedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.challengeId, t.userId, t.attemptNumber)],
).enableRLS();
