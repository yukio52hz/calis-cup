"use server";

import type { FormState } from "./form-state";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireProfile, verifySession } from "@/server/auth/dal";
import { notifyWelcome } from "@/features/notifications/server/notify";
import { ROUTES } from "@/lib/constants";

import { profileSchema } from "./schemas";
import { createProfile, updateProfile } from "./server/mutations";

function parseProfile(formData: FormData) {
  return profileSchema.safeParse(Object.fromEntries(formData));
}

function isUniqueViolation(error: unknown) {
  const cause = (error as { cause?: { code?: string } })?.cause;

  return cause?.code === "23505";
}

const USERNAME_TAKEN: FormState = {
  errors: { username: ["Ese nombre de usuario ya está en uso"] },
};

export async function completeOnboardingAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await verifySession();

  if (session.profile) redirect(ROUTES.dashboard);

  const parsed = parseProfile(formData);

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  try {
    await createProfile(session.id, session.email, parsed.data);
  } catch (error) {
    if (isUniqueViolation(error)) return USERNAME_TAKEN;
    throw error;
  }

  after(() =>
    notifyWelcome({ firstName: parsed.data.firstName, email: session.email }),
  );

  redirect(ROUTES.dashboard);
}

export async function updateProfileAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const profile = await requireProfile();
  const parsed = parseProfile(formData);

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  try {
    await updateProfile(profile.id, parsed.data);
  } catch (error) {
    if (isUniqueViolation(error)) return USERNAME_TAKEN;
    throw error;
  }

  revalidatePath(ROUTES.profile);

  return { success: true, message: "Perfil actualizado" };
}
