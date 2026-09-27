"use server";

import type { FormState } from "@/features/users/form-state";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { eq, ne } from "drizzle-orm";

import { notifyChallengePublished } from "@/features/notifications/server/notify";
import { MAX_VIDEO_BYTES, ROUTES } from "@/lib/constants";
import { crMondayOf, weekRange } from "@/lib/dates";
import { requireRole } from "@/server/auth/dal";
import { db } from "@/server/db/client";
import {
  challengeExercises,
  challenges,
  tournaments,
  tournamentWeeks,
} from "@/server/db/schema";
import { createUploadUrl, fileExists } from "@/server/storage/files";

import { getWeekById, listApprovedCompetitorIds } from "./server/admin-queries";
import {
  challengeSchema,
  createTournamentSchema,
  pointsSchema,
  tournamentSchema,
  weekDatesSchema,
} from "./schemas";

function refresh() {
  revalidatePath(ROUTES.admin, "layout");
  revalidatePath(ROUTES.dashboard, "layout");
}

function isUniqueViolation(error: unknown) {
  return (error as { cause?: { code?: string } })?.cause?.code === "23505";
}

// Crea el torneo (borrador) y sus semanas de lunes a domingo (§13, §38)
export async function createTournamentAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireRole("admin");
  const parsed = createTournamentSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success)
    return { errors: z.flattenError(parsed.error).fieldErrors };

  const { startDate, weeks, ...data } = parsed.data;
  const firstMonday = crMondayOf(startDate);

  try {
    await db.transaction(async (tx) => {
      const [tournament] = await tx
        .insert(tournaments)
        .values({ ...data, status: "draft" })
        .returning({ id: tournaments.id });

      await tx.insert(tournamentWeeks).values(
        Array.from({ length: weeks }, (_, i) => ({
          tournamentId: tournament.id,
          weekNumber: i + 1,
          ...weekRange(firstMonday, i + 1),
        })),
      );
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { errors: { name: ["Ya existe un torneo con ese nombre"] } };
    }
    throw error;
  }

  refresh();
  redirect(ROUTES.adminTournament);
}

export async function updateTournamentAction(
  tournamentId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireRole("admin");
  const parsed = tournamentSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success)
    return { errors: z.flattenError(parsed.error).fieldErrors };

  try {
    await db.transaction(async (tx) => {
      // MVP: un solo torneo activo a la vez
      if (parsed.data.status === "active") {
        await tx
          .update(tournaments)
          .set({ status: "finished" })
          .where(ne(tournaments.id, tournamentId));
      }
      await tx
        .update(tournaments)
        .set(parsed.data)
        .where(eq(tournaments.id, tournamentId));
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { errors: { name: ["Ya existe un torneo con ese nombre"] } };
    }
    throw error;
  }

  refresh();

  return { success: true, message: "Torneo actualizado" };
}

export async function updateWeekDatesAction(
  weekId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireRole("admin");
  const parsed = weekDatesSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success)
    return { errors: z.flattenError(parsed.error).fieldErrors };

  await db
    .update(tournamentWeeks)
    .set(parsed.data)
    .where(eq(tournamentWeeks.id, weekId));
  refresh();

  return { success: true, message: "Fechas guardadas" };
}

// El editor manda el reto como JSON (reglas y ejercicios son listas dinámicas)
export async function saveChallengeAction(
  weekId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireRole("admin");

  let payload: unknown;

  try {
    payload = JSON.parse(String(formData.get("challenge")));
  } catch {
    return { message: "Datos inválidos." };
  }

  const parsed = challengeSchema.safeParse(payload);

  if (!parsed.success) return { message: parsed.error.issues[0].message };

  const { exercises, ...data } = parsed.data;

  await db.transaction(async (tx) => {
    const [challenge] = await tx
      .insert(challenges)
      .values({ ...data, weekId })
      .onConflictDoUpdate({ target: challenges.weekId, set: data })
      .returning({ id: challenges.id });

    // Las revisiones guardan el nombre y los segundos de cada penalización,
    // así que reemplazar los ejercicios no altera resultados ya registrados.
    await tx
      .delete(challengeExercises)
      .where(eq(challengeExercises.challengeId, challenge.id));
    await tx.insert(challengeExercises).values(
      exercises.map((e, sortOrder) => ({
        ...e,
        sortOrder,
        challengeId: challenge.id,
      })),
    );
  });

  refresh();

  return { success: true, message: "Reto guardado" };
}

// §14: publicar habilita el reto desde el inicio de la semana
export async function setWeekPublishedAction(weekId: string, publish: boolean) {
  await requireRole("admin");
  const row = await getWeekById(weekId);

  if (!row) return;
  if (publish && !row.challenge) return;

  await db
    .update(tournamentWeeks)
    .set({ publishedAt: publish ? new Date() : null })
    .where(eq(tournamentWeeks.id, weekId));
  refresh();
}

// §31: email "Nuevo reto" a los inscritos aprobados (una sola vez)
export async function announceWeekAction(weekId: string) {
  await requireRole("admin");
  const row = await getWeekById(weekId);

  if (!row?.challenge || !row.week.publishedAt || row.week.announcedAt) return;

  const userIds = await listApprovedCompetitorIds(row.tournament.id);

  await db
    .update(tournamentWeeks)
    .set({ announcedAt: new Date() })
    .where(eq(tournamentWeeks.id, weekId));

  after(() =>
    notifyChallengePublished({
      userIds,
      weekNumber: row.week.weekNumber,
      challengeName: row.challenge!.name,
      endsAt: row.week.endsAt,
    }),
  );
  refresh();
}

// Video de ejemplo (§15): mismo flujo firmado que los videos de los competidores
export async function requestExampleUploadAction(
  weekId: string,
  input: { size: number; type: string },
): Promise<
  { ok: true; signedUrl: string; path: string } | { ok: false; message: string }
> {
  await requireRole("admin");

  if (!input.type.startsWith("video/"))
    return { ok: false, message: "Debe ser un video." };
  if (input.size > MAX_VIDEO_BYTES) {
    return { ok: false, message: "El video pesa más de 50 MB." };
  }

  const row = await getWeekById(weekId);

  if (!row?.challenge)
    return { ok: false, message: "Guarda el reto antes de subir el video." };

  const extension =
    input.type === "video/quicktime"
      ? "mov"
      : input.type.split("/")[1] || "mp4";
  const path = `examples/${row.tournament.id}/week-${row.week.weekNumber}/${crypto.randomUUID()}.${extension}`;

  return { ok: true, path, signedUrl: await createUploadUrl("videos", path) };
}

export async function setExampleVideoAction(
  weekId: string,
  path: string | null,
) {
  await requireRole("admin");
  const row = await getWeekById(weekId);

  if (!row?.challenge) return { ok: false as const };

  const prefix = `examples/${row.tournament.id}/week-${row.week.weekNumber}/`;

  if (
    path &&
    (!path.startsWith(prefix) || !(await fileExists("videos", path)))
  ) {
    return { ok: false as const };
  }

  await db
    .update(challenges)
    .set({ exampleVideoPath: path })
    .where(eq(challenges.id, row.challenge.id));
  refresh();

  return { ok: true as const };
}

// §22: puntos configurables desde el panel (el ranking se recalcula al leerlo)
export async function updatePointsAction(
  tournamentId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireRole("admin");

  let payload: unknown;

  try {
    payload = JSON.parse(String(formData.get("points")));
  } catch {
    return { message: "Datos inválidos." };
  }

  const parsed = pointsSchema.safeParse(payload);

  if (!parsed.success) return { message: parsed.error.issues[0].message };

  await db
    .update(tournaments)
    .set(parsed.data)
    .where(eq(tournaments.id, tournamentId));
  refresh();
  revalidatePath("/");

  return {
    success: true,
    message: "Puntos guardados. La clasificación ya los usa.",
  };
}
