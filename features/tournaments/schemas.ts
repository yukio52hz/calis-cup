import { z } from "zod";

import { fromCrDateTimeInput } from "@/lib/dates";

const money = z.coerce
  .number("Ingresa un monto")
  .int("Sin decimales")
  .min(0)
  .max(1_000_000);

// §37: información y configuración del torneo
export const tournamentSchema = z.object({
  name: z.string().trim().min(3, "Mínimo 3 caracteres").max(80),
  description: z
    .string()
    .trim()
    .max(300)
    .transform((v) => v || null),
  registrationFee: money,
  extraVideoFee: money,
  sinpeNumber: z
    .string()
    .trim()
    .regex(/^[0-9\s-]{8,12}$/, "Número inválido (ej.: 8888-8888)"),
  status: z.enum(["draft", "active", "finished"]),
});

export const createTournamentSchema = tournamentSchema
  .omit({ status: true })
  .extend({
    // Cualquier día de la semana 1; se ajusta al lunes
    startDate: z.iso.date("Elige la fecha de inicio"),
    weeks: z.coerce.number().int().min(1).max(8).default(4),
  });

const crDateTime = z.string().transform((value, ctx) => {
  const date = fromCrDateTimeInput(value);

  if (!date) {
    ctx.addIssue({ code: "custom", message: "Fecha inválida" });

    return z.NEVER;
  }

  return date;
});

// §38: fechas de la semana (hora de Costa Rica)
export const weekDatesSchema = z
  .object({ startsAt: crDateTime, endsAt: crDateTime })
  .refine((w) => w.endsAt > w.startsAt, {
    path: ["endsAt"],
    message: "Debe ser posterior al inicio",
  });

// §39-40: reto con sus ejercicios y penalizaciones
export const challengeSchema = z.object({
  name: z.string().trim().min(2, "Ingresa el nombre del reto").max(60),
  objective: z.string().trim().max(300),
  rules: z.array(z.string().trim().min(1).max(200)).max(15),
  exercises: z
    .array(
      z.object({
        name: z.string().trim().min(2, "Nombre del ejercicio").max(60),
        repetitions: z.coerce.number().int().min(1, "Mínimo 1").max(1000),
        penaltySeconds: z.coerce.number().int().min(0).max(120),
      }),
    )
    .min(1, "Agrega al menos un ejercicio")
    .max(15),
});

export type ChallengeInput = z.infer<typeof challengeSchema>;

export const TOURNAMENT_STATUS_LABELS = {
  draft: "Borrador",
  active: "Activo",
  finished: "Finalizado",
} as const;

const points = z.coerce
  .number("Ingresa los puntos")
  .int("Sin decimales")
  .min(0)
  .max(10_000);

// §22: tabla de puntos. Un mejor puesto nunca recibe menos puntos.
export const pointsSchema = z
  .object({
    pointsByPosition: z
      .array(points)
      .min(1, "Agrega al menos una posición")
      .max(100),
    pointsBeyond: points,
  })
  .superRefine((value, ctx) => {
    const list = value.pointsByPosition;

    for (let i = 1; i < list.length; i++) {
      if (list[i] > list[i - 1]) {
        ctx.addIssue({
          code: "custom",
          message: `El ${i + 1}.º lugar no puede tener más puntos que el ${i}.º.`,
        });

        return;
      }
    }
    if (value.pointsBeyond > list[list.length - 1]) {
      ctx.addIssue({
        code: "custom",
        message:
          "Las demás posiciones no pueden tener más puntos que la última de la lista.",
      });
    }
  });
