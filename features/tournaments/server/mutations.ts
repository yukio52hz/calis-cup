import "server-only";

import type { CreateTournamentInput } from "../schemas";

// TODO: insertar en la DB cuando exista server/db/client.ts.
export async function createTournament(_input: CreateTournamentInput) {
  throw new Error("createTournament: la base de datos aún no está configurada");
}
