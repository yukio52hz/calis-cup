import "server-only";

import { cache } from "react";
import { eq } from "drizzle-orm";

import { db } from "@/server/db/client";
import { profiles } from "@/server/db/schema";
import { createSupabaseServerClient } from "@/server/supabase/server";

export type Role = (typeof profiles.$inferSelect)["role"];

export type AuthUser = {
  id: string;
  email: string;
  // Datos guardados en el registro (options.data de signUp)
  metadata: Record<string, unknown>;
};

export type Session = AuthUser & {
  // null mientras el usuario no haya completado el onboarding.
  profile: typeof profiles.$inferSelect | null;
};

// Solo verifica el JWT (sin consultar la DB). Úsalo para saber si hay login.
export const getAuthUser = cache(async (): Promise<AuthUser | null> => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims?.sub || !claims.email) return null;

  return {
    id: claims.sub,
    email: claims.email,
    metadata: (claims.user_metadata as Record<string, unknown>) ?? {},
  };
});

export const getSession = cache(async (): Promise<Session | null> => {
  const user = await getAuthUser();

  if (!user) return null;

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  return { ...user, profile: profile ?? null };
});
