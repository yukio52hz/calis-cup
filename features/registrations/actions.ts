"use server";

import type { FormState } from "@/features/users/form-state";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import {
  notifyRegistrationReviewed,
  notifyRegistrationSubmitted,
} from "@/features/notifications/server/notify";
import { getActiveTournament } from "@/features/submissions/server/queries";
import { ROUTES } from "@/lib/constants";
import { requireProfile, requireRole } from "@/server/auth/dal";
import { db } from "@/server/db/client";
import { payments, registrations } from "@/server/db/schema";
import { createUploadUrl, fileExists } from "@/server/storage/files";
import {
  paymentSchema,
  receiptExtension,
  receiptFileSchema,
} from "@/features/payments/schemas";

import {
  getMyRegistration,
  getNextPendingRegistrationId,
  getRegistrationForReview,
} from "./server/queries";

function receiptFolder(tournamentId: string, userId: string) {
  return `registrations/${tournamentId}/${userId}/`;
}

// Se puede enviar si no hay inscripción o si la anterior fue rechazada (§10)
async function getEnrollContext(userId: string) {
  const tournament = await getActiveTournament();

  if (!tournament)
    return { error: "No hay un torneo con inscripción abierta." } as const;

  const current = await getMyRegistration(tournament.id, userId);

  if (current?.registration.status === "approved") {
    return { error: "Tu inscripción ya está aprobada." } as const;
  }
  if (current?.registration.status === "pending_review") {
    return { error: "Tu inscripción ya está en revisión." } as const;
  }

  return { tournament } as const;
}

// Paso 1: URL firmada para subir el comprobante directo a Storage
export async function requestReceiptUploadAction(input: {
  size: number;
  type: string;
}): Promise<
  { ok: true; signedUrl: string; path: string } | { ok: false; message: string }
> {
  const profile = await requireProfile();
  const parsed = receiptFileSchema.safeParse(input);

  if (!parsed.success)
    return { ok: false, message: parsed.error.issues[0].message };

  const context = await getEnrollContext(profile.id);

  if ("error" in context) return { ok: false, message: context.error! };

  const path = `${receiptFolder(context.tournament.id, profile.id)}${crypto.randomUUID()}.${receiptExtension(parsed.data.type)}`;

  return { ok: true, path, signedUrl: await createUploadUrl("receipts", path) };
}

// Paso 2: registra el pago y deja la inscripción pendiente de revisión (§7)
export async function submitRegistrationAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const profile = await requireProfile();
  const parsed = paymentSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const context = await getEnrollContext(profile.id);

  if ("error" in context) return { message: context.error };

  const { tournament } = context;
  const { receiptPath, ...payment } = parsed.data;

  if (
    !receiptPath.startsWith(receiptFolder(tournament.id, profile.id)) ||
    !(await fileExists("receipts", receiptPath))
  ) {
    return { errors: { receiptPath: ["Vuelve a subir el comprobante."] } };
  }

  const registrationId = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(payments)
      .values({
        ...payment,
        kind: "registration",
        tournamentId: tournament.id,
        userId: profile.id,
        receiptPath,
      })
      .returning({ id: payments.id });

    const values = {
      category: profile.category,
      status: "pending_review" as const,
      paymentId: created.id,
      rejectionReason: null,
      reviewedBy: null,
      reviewedAt: null,
    };

    const [registration] = await tx
      .insert(registrations)
      .values({ ...values, tournamentId: tournament.id, userId: profile.id })
      .onConflictDoUpdate({
        target: [registrations.tournamentId, registrations.userId],
        set: values,
      })
      .returning({ id: registrations.id });

    return registration.id;
  });

  after(() =>
    notifyRegistrationSubmitted({
      registrationId,
      competitor: profile,
      payment,
    }),
  );
  revalidatePath(ROUTES.dashboard, "layout");
  redirect(ROUTES.enroll);
}

const reviewSchema = z.discriminatedUnion("decision", [
  z.object({ decision: z.literal("approve") }),
  z.object({
    decision: z.literal("reject"),
    reason: z.string().trim().min(3, "Escribe el motivo del rechazo").max(300),
  }),
]);

// Revisión del admin (§10-11)
export async function reviewRegistrationAction(
  registrationId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await requireRole("admin");
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const current = await getRegistrationForReview(registrationId);

  if (!current) return { message: "La inscripción ya no existe." };

  const approved = parsed.data.decision === "approve";
  const reason = parsed.data.decision === "reject" ? parsed.data.reason : null;
  const reviewed = { reviewedBy: admin.id, reviewedAt: new Date() };

  await db.transaction(async (tx) => {
    await tx
      .update(registrations)
      .set({
        ...reviewed,
        status: approved ? "approved" : "rejected",
        rejectionReason: reason,
      })
      .where(eq(registrations.id, registrationId));

    if (current.payment) {
      await tx
        .update(payments)
        .set({
          ...reviewed,
          status: approved ? "approved" : "rejected",
          rejectionReason: reason,
        })
        .where(eq(payments.id, current.payment.id));
    }
  });

  after(() =>
    notifyRegistrationReviewed({
      competitor: { firstName: current.firstName, email: current.email },
      approved,
      reason,
    }),
  );
  revalidatePath(ROUTES.admin, "layout");
  revalidatePath(ROUTES.dashboard, "layout");

  const next =
    formData.get("next") === "1" ? await getNextPendingRegistrationId() : null;

  redirect(
    next
      ? `${ROUTES.adminRegistrations}/${next}`
      : `${ROUTES.adminRegistrations}?revisado=1`,
  );
}
