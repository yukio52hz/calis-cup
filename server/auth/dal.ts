import "server-only";

import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/constants";

import { getSession, type Role } from "./session";

// Autorización real (Supabase Auth + tabla profiles). Llamar en cada layout
// protegido, Server Action y query sensible; proxy.ts solo hace redirecciones
// optimistas.
export async function verifySession() {
  const session = await getSession();

  if (!session) redirect(ROUTES.login);

  return session;
}

export async function requireProfile() {
  const session = await verifySession();

  if (!session.profile) redirect(ROUTES.onboarding);

  return session.profile;
}

export async function requireRole(role: Role) {
  const profile = await requireProfile();

  if (profile.role !== role) redirect(ROUTES.dashboard);

  return profile;
}
