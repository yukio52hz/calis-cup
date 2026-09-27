"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";

import { notifyVideoSubmitted } from "@/features/notifications/server/notify";
import { MAX_VIDEO_BYTES, ROUTES } from "@/lib/constants";
import { requireProfile } from "@/server/auth/dal";
import { db } from "@/server/db/client";
import { submissions } from "@/server/db/schema";
import { createUploadUrl, fileExists } from "@/server/storage/files";

import { BLOCKED_MESSAGES, getUploadEligibility } from "./server/eligibility";

export type UploadResult<T = object> =
  ({ ok: true } & T) | { ok: false; message: string };

const fileSchema = z.object({
  size: z
    .number()
    .int()
    .positive()
    .max(MAX_VIDEO_BYTES, "El video pesa más de 50 MB."),
  type: z.string().startsWith("video/", "El archivo debe ser un video."),
  durationMs: z.number().int().positive().nullable(),
});

const EXTENSIONS: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
  "video/3gpp": "3gp",
};

// Carpeta del usuario dentro del bucket: {torneo}/week-{n}/{usuario}/
function userFolder(tournamentId: string, weekNumber: number, userId: string) {
  return `${tournamentId}/week-${weekNumber}/${userId}/`;
}

// Paso 1: valida las reglas y devuelve una URL firmada para subir directo a Storage
export async function requestVideoUploadAction(
  input: z.input<typeof fileSchema>,
): Promise<UploadResult<{ signedUrl: string; path: string }>> {
  const profile = await requireProfile();
  const parsed = fileSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  const eligibility = await getUploadEligibility(profile.id);

  if (!eligibility.ok) {
    return { ok: false, message: BLOCKED_MESSAGES[eligibility.reason] };
  }

  const { tournamentId, active, nextAttempt } = eligibility;
  const extension = EXTENSIONS[parsed.data.type] ?? "mp4";
  const path = `${userFolder(tournamentId, active.week.weekNumber, profile.id)}attempt-${nextAttempt}-${crypto.randomUUID()}.${extension}`;

  return { ok: true, path, signedUrl: await createUploadUrl("videos", path) };
}

// Paso 2: tras la subida, verifica el archivo y registra el intento (§42)
export async function confirmVideoUploadAction(
  input: z.input<typeof fileSchema> & { path: string },
): Promise<UploadResult> {
  const profile = await requireProfile();
  const parsed = fileSchema
    .extend({ path: z.string().min(1) })
    .safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  // 15 min de margen: la subida pudo empezar justo antes del cierre del domingo
  const eligibility = await getUploadEligibility(profile.id, {
    graceMs: 15 * 60 * 1000,
  });

  if (!eligibility.ok) {
    return { ok: false, message: BLOCKED_MESSAGES[eligibility.reason] };
  }

  const { tournamentId, active, nextAttempt } = eligibility;
  const { path, size, type, durationMs } = parsed.data;

  // La ruta tiene que ser de la carpeta de este usuario y de esta semana
  if (
    !path.startsWith(
      userFolder(tournamentId, active.week.weekNumber, profile.id),
    )
  ) {
    return { ok: false, message: "Ruta de video inválida." };
  }
  if (!(await fileExists("videos", path))) {
    return {
      ok: false,
      message: "No encontramos el video subido. Inténtalo de nuevo.",
    };
  }

  const [created] = await db
    .insert(submissions)
    .values({
      challengeId: active.challenge.id,
      userId: profile.id,
      attemptNumber: nextAttempt,
      videoPath: path,
      fileSize: size,
      mimeType: type,
      durationMs,
    })
    .returning({ id: submissions.id });

  after(() =>
    notifyVideoSubmitted({
      submissionId: created.id,
      competitor: profile,
      weekNumber: active.week.weekNumber,
      challengeName: active.challenge.name,
      attemptNumber: nextAttempt,
    }),
  );

  revalidatePath(ROUTES.videos);
  revalidatePath(ROUTES.dashboard);

  return { ok: true };
}
