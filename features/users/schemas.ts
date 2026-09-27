import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => value || null);

export const profileSchema = z.object({
  firstName: z.string().trim().min(1, "Ingresa tu nombre").max(50),
  lastName: z.string().trim().min(1, "Ingresa tu apellido").max(50),
  category: z.enum(["female", "male"], "Elige una categoría"),
  phone: optionalText.pipe(
    z
      .string()
      .regex(/^[0-9+\-\s]{8,15}$/, "Teléfono inválido")
      .nullable(),
  ),
  username: optionalText.pipe(
    z
      .string()
      .regex(/^[a-z0-9_.]{3,20}$/, "3-20 caracteres: a-z, 0-9, _ o .")
      .nullable(),
  ),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const CATEGORY_LABELS = {
  female: "Femenino",
  male: "Masculino",
} as const;

const email = z.email("Email inválido").trim().toLowerCase();
const password = z.string().min(8, "Mínimo 8 caracteres").max(72);

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export const registerSchema = z
  .object({
    firstName: profileSchema.shape.firstName,
    lastName: profileSchema.shape.lastName,
    category: profileSchema.shape.category,
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({ password, confirmPassword: z.string() })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });
