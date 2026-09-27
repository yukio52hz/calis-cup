import { z } from "zod";

// Fecha de hoy en Costa Rica (YYYY-MM-DD)
export function todayInCostaRica() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Costa_Rica",
  }).format(new Date());
}

// Datos que registra el competidor tras hacer el SINPE (§9)
export const paymentSchema = z.object({
  amount: z.coerce
    .number("Ingresa el monto")
    .int("Sin decimales")
    .positive("Ingresa el monto")
    .max(1_000_000),
  reference: z
    .string()
    .trim()
    .min(4, "Ingresa el número de referencia")
    .max(40),
  paidOn: z.iso
    .date("Fecha inválida")
    .refine(
      (value) => value <= todayInCostaRica(),
      "La fecha no puede ser futura",
    ),
  receiptPath: z.string().min(1, "Sube el comprobante"),
});

export const REJECTION_REASONS = [
  "Comprobante ilegible.",
  "Monto incorrecto.",
  "Número de referencia inválido.",
];
