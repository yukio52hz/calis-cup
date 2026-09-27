import { z } from "zod";

// Compartido cliente/servidor: validación de formularios y de Server Actions.
export const createTournamentSchema = z.object({
  name: z.string().trim().min(3).max(100),
  startsAt: z.coerce.date(),
});

export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;
