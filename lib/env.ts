import "server-only";

import { z } from "zod";

// Añade aquí cada variable nueva: la app falla al arrancar si falta o es inválida.
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  // Supabase → Connect → "Transaction pooler" (puerto 6543)
  DATABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  // Supabase → Project Settings → API Keys → Secret key (sb_secret_…).
  // Solo servidor: firma URLs de Storage. Nunca con prefijo NEXT_PUBLIC_.
  SUPABASE_SECRET_KEY: z
    .string()
    .startsWith("sb_secret_", "Debe ser la secret key (sb_secret_…)"),
  // URL pública de la app, para los enlaces de los emails
  APP_URL: z.url().default("http://localhost:3000"),
  // Resend: sin clave, los emails se registran en consola y no se envían
  RESEND_API_KEY: z
    .string()
    .startsWith("re_", "Debe ser una API key de Resend (re_…)")
    .optional(),
  // Remitente de un dominio verificado en Resend. onboarding@resend.dev solo
  // entrega al email dueño de la cuenta de Resend (útil para probar).
  EMAIL_FROM: z.string().default("Calis Cup <onboarding@resend.dev>"),
  // Emails separados por coma que reciben rol admin al crear su perfil.
  ADMIN_EMAILS: z
    .string()
    .default("")
    .transform((value) =>
      value
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    ),
});

// Tolera errores típicos al copiar variables en el panel de Vercel:
// espacios o saltos de línea, comillas envolventes y valores vacíos
// (vacío = no definida, para que apliquen los valores por defecto).
function clean(value: string | undefined) {
  const trimmed = value
    ?.trim()
    .replace(/^(["'])(.*)\1$/, "$2")
    .trim();

  return trimmed ? trimmed : undefined;
}

const parsed = envSchema.safeParse(
  Object.fromEntries(
    Object.keys(envSchema.shape).map((key) => [key, clean(process.env[key])]),
  ),
);

if (!parsed.success) {
  // Solo nombres y motivos: nunca imprimir los valores (son secretos)
  const problems = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(`Variables de entorno inválidas:\n${problems}`);
}

export const env = parsed.data;
