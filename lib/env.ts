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

export const env = envSchema.parse(process.env);
