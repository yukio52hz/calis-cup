"use server";

import type { FormState } from "./form-state";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { ROUTES } from "@/lib/constants";
import { verifySession } from "@/server/auth/dal";
import { createSupabaseServerClient } from "@/server/supabase/server";

import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "./schemas";

const AUTH_ERRORS: Record<string, string> = {
  invalid_credentials: "Email o contraseña incorrectos.",
  email_not_confirmed: "Confirma tu email antes de iniciar sesión.",
  user_already_exists: "Ya existe una cuenta con ese email.",
  weak_password: "La contraseña es demasiado débil.",
  over_email_send_rate_limit:
    "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
  same_password: "La nueva contraseña debe ser distinta a la anterior.",
};

function authError(code: string | undefined): FormState {
  return {
    message:
      (code && AUTH_ERRORS[code]) ?? "Algo salió mal. Inténtalo de nuevo.",
  };
}

// Evita open redirects: solo rutas internas.
function safeNext(value: FormDataEntryValue | null, fallback: string) {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
    ? value
    : fallback;
}

async function confirmUrl(next: string) {
  const origin = (await headers()).get("origin") ?? "";

  return `${origin}${ROUTES.authConfirm}?next=${encodeURIComponent(next)}`;
}

export async function signInAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) return authError(error.code);

  redirect(safeNext(formData.get("next"), ROUTES.dashboard));
}

export async function signUpAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const { email, password, firstName, lastName, category } = parsed.data;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: await confirmUrl(`${ROUTES.onboarding}?confirmado=1`),
      // Se usa para precargar el paso "Completar perfil".
      data: { first_name: firstName, last_name: lastName, category },
    },
  });

  if (error) return authError(error.code);

  // Sin confirmación de email activada, Supabase ya devuelve la sesión.
  if (data.session) redirect(ROUTES.onboarding);

  return {
    success: true,
    message: `Te enviamos un email a ${email}. Ábrelo para confirmar tu cuenta.`,
  };
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();
  redirect(ROUTES.home);
}

export async function forgotPasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    { redirectTo: await confirmUrl(ROUTES.resetPassword) },
  );

  if (error?.code === "over_email_send_rate_limit") {
    return authError(error.code);
  }

  // Misma respuesta exista o no la cuenta, para no revelar emails.
  return {
    success: true,
    message: "Si existe una cuenta con ese email, te enviamos un enlace.",
  };
}

export async function resetPasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await verifySession();

  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) return authError(error.code);

  redirect(ROUTES.dashboard);
}
