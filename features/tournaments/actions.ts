"use server";

import { requireRole } from "@/server/auth/dal";

import { createTournamentSchema } from "./schemas";
import { createTournament } from "./server/mutations";

// Patrón de toda Server Action: autorizar → validar → delegar en server/.
export async function createTournamentAction(formData: FormData) {
  await requireRole("admin");

  const input = createTournamentSchema.parse(Object.fromEntries(formData));

  await createTournament(input);
}
