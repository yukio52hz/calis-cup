import "server-only";

import type { ProfileInput } from "../schemas";

import { eq } from "drizzle-orm";

import { db } from "@/server/db/client";
import { profiles } from "@/server/db/schema";
import { env } from "@/lib/env";

export async function createProfile(
  userId: string,
  email: string,
  input: ProfileInput,
) {
  const role = env.ADMIN_EMAILS.includes(email.toLowerCase())
    ? "admin"
    : "competitor";

  await db
    .insert(profiles)
    .values({ ...input, id: userId, email, role })
    .onConflictDoNothing({ target: profiles.id });
}

export async function updateProfile(profileId: string, input: ProfileInput) {
  await db.update(profiles).set(input).where(eq(profiles.id, profileId));
}
