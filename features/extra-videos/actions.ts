"use server";

import type { FormState } from "@/features/users/form-state";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import {
  notifyExtraRequested,
  notifyExtraReviewed,
} from "@/features/notifications/server/notify";
import {
  paymentSchema,
  receiptExtension,
  receiptFileSchema,
} from "@/features/payments/schemas";
import { ROUTES } from "@/lib/constants";
import { requireProfile, requireRole } from "@/server/auth/dal";
import { db } from "@/server/db/client";
import { extraAttempts, payments } from "@/server/db/schema";
import { createUploadUrl, fileExists } from "@/server/storage/files";

import {
  getExtraRequestForReview,
  getNextPendingExtraId,
} from "./server/queries";
import { getExtraPurchaseEligibility } from "./server/eligibility";

function receiptFolder(tournamentId: string, userId: string) {
  return `extra-videos/${tournamentId}/${userId}/`;
}

function refresh() {
  revalidatePath(ROUTES.dashboard, "layout");
  revalidatePath(ROUTES.admin, "layout");
}

export async function requestExtraReceiptUploadAction(input: {
  size: number;
  type: string;
}): Promise<
  { ok: true; signedUrl: string; path: string } | { ok: false; message: string }
> {
  const profile = await requireProfile();
  const parsed = receiptFileSchema.safeParse(input);

  if (!parsed.success)
    return { ok: false, message: parsed.error.issues[0].message };

  const eligibility = await getExtraPurchaseEligibility(profile.id);

  if (!eligibility.ok) return { ok: false, message: eligibility.message };

  const path = `${receiptFolder(eligibility.tournament.id, profile.id)}${crypto.randomUUID()}.${receiptExtension(parsed.data.type)}`;

  return { ok: true, path, signedUrl: await createUploadUrl("receipts", path) };
}

// §26: registra el pago; el intento queda bloqueado hasta la aprobación (§27)
export async function submitExtraPaymentAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const profile = await requireProfile();
  const parsed = paymentSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success)
    return { errors: z.flattenError(parsed.error).fieldErrors };

  const eligibility = await getExtraPurchaseEligibility(profile.id);

  if (!eligibility.ok) return { message: eligibility.message };

  const { tournament, active, bestTimeMs } = eligibility;
  const { receiptPath, ...payment } = parsed.data;

  if (
    !receiptPath.startsWith(receiptFolder(tournament.id, profile.id)) ||
    !(await fileExists("receipts", receiptPath))
  ) {
    return { errors: { receiptPath: ["Vuelve a subir el comprobante."] } };
  }

  const extraId = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(payments)
      .values({
        ...payment,
        kind: "extra_video",
        tournamentId: tournament.id,
        userId: profile.id,
        receiptPath,
      })
      .returning({ id: payments.id });

    const [extra] = await tx
      .insert(extraAttempts)
      .values({
        paymentId: created.id,
        challengeId: active.challenge.id,
        userId: profile.id,
      })
      .returning({ id: extraAttempts.id });

    return extra.id;
  });

  after(() =>
    notifyExtraRequested({
      extraId,
      competitor: profile,
      tournamentName: tournament.name,
      weekNumber: active.week.weekNumber,
      challengeName: active.challenge.name,
      bestTimeMs,
      payment,
    }),
  );
  refresh();
  redirect(ROUTES.extraVideo);
}

const reviewSchema = z.discriminatedUnion("decision", [
  z.object({ decision: z.literal("approve") }),
  z.object({
    decision: z.literal("reject"),
    reason: z.string().trim().min(3, "Escribe el motivo del rechazo").max(300),
  }),
]);

// Revisión del admin (§26-28)
export async function reviewExtraAction(
  extraId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await requireRole("admin");
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success)
    return { errors: z.flattenError(parsed.error).fieldErrors };

  const current = await getExtraRequestForReview(extraId);

  if (!current) return { message: "La solicitud ya no existe." };

  const approved = parsed.data.decision === "approve";
  const reason = parsed.data.decision === "reject" ? parsed.data.reason : null;

  await db
    .update(payments)
    .set({
      status: approved ? "approved" : "rejected",
      rejectionReason: reason,
      reviewedBy: admin.id,
      reviewedAt: new Date(),
    })
    .where(eq(payments.id, current.payment.id));

  after(() =>
    notifyExtraReviewed({
      competitor: { firstName: current.firstName, email: current.email },
      weekNumber: current.weekNumber,
      approved,
      reason,
    }),
  );
  refresh();

  const next =
    formData.get("next") === "1" ? await getNextPendingExtraId() : null;

  redirect(
    next ? `${ROUTES.adminExtras}/${next}` : `${ROUTES.adminExtras}?revisado=1`,
  );
}
