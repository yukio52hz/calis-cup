import "server-only";

import type { Tournament } from "../types";

// TODO: leer de la DB cuando exista server/db/client.ts.
export async function listPublicTournaments(): Promise<Tournament[]> {
  return [];
}
