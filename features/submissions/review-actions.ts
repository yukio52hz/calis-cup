"use server";

import type { FormState } from "@/features/users/form-state";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { ROUTES } from "@/lib/constants";
import { requireRole } from "@/server/auth/dal";
import { db } from "@/server/db/client";
import { submissions } from "@/server/db/schema";

import {
  getNextPendingSubmissionId,
  getSubmissionForReview,
} from "./server/review-queries";

// "2:34" o "02:34" → ms
const timeSchema = z
  .string()
  .trim()
  .regex(/^\d{1,2}:[0-5]\d$/, "Usa el formato mm:ss, por ejemplo 02:34")
  .transform((value) => {
    const [minutes, seconds] = value.split(":").map(Number);

    return (minutes * 60 + seconds) * 1000;
  });

const reviewSchema = z.discriminatedUnion("decision", [
  z.object({
    decision: z.literal("approve"),
    rawTime: timeSchema,
    notes: z.string().trim().max(500).optional(),
  }),
  z.object({
    decision: z.literal("reject"),
    notes: z.string().trim().min(3, "Escribe el motivo del rechazo").max(500),
  }),
]);

// Revisión del admin (§19-21): tiempo + penalizaciones = resultado final
export async function reviewSubmissionAction(
  submissionId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await requireRole("admin");
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const current = await getSubmissionForReview(submissionId);

  if (!current) return { message: "El video ya no existe." };

  const reviewed = { reviewedBy: admin.id, reviewedAt: new Date() };

  if (parsed.data.decision === "reject") {
    await db
      .update(submissions)
      .set({
        ...reviewed,
        status: "rejected",
        rawTimeMs: null,
        penaltyMs: null,
        finalTimeMs: null,
        penalties: [],
        reviewerNotes: parsed.data.notes,
      })
      .where(eq(submissions.id, submissionId));
  } else {
    // Penalizaciones calculadas en el servidor a partir de la config del reto
    const penalties = current.exercises
      .map((exercise) => ({
        exercise: exercise.name,
        seconds: exercise.penaltySeconds,
        count: Math.max(
          0,
          Math.min(99, Number(formData.get(`penalty-${exercise.id}`)) || 0),
        ),
      }))
      .filter((penalty) => penalty.count > 0);
    const penaltyMs = penalties.reduce(
      (sum, p) => sum + p.count * p.seconds * 1000,
      0,
    );

    await db
      .update(submissions)
      .set({
        ...reviewed,
        status: "approved",
        rawTimeMs: parsed.data.rawTime,
        penaltyMs,
        penalties,
        finalTimeMs: parsed.data.rawTime + penaltyMs,
        reviewerNotes: parsed.data.notes || null,
      })
      .where(eq(submissions.id, submissionId));
  }

  revalidatePath(ROUTES.admin, "layout");
  revalidatePath(ROUTES.dashboard, "layout");

  const next =
    formData.get("next") === "1" ? await getNextPendingSubmissionId() : null;

  redirect(
    next ? `${ROUTES.adminVideos}/${next}` : `${ROUTES.adminVideos}?revisado=1`,
  );
}
