import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  dialect: "postgresql",
  schema: "./server/db/schema/index.ts",
  out: "./server/db/migrations",
  casing: "snake_case",
  // Solo gestionamos "public"; auth.* pertenece a Supabase.
  schemaFilter: ["public"],
  entities: { roles: { provider: "supabase" } },
  // Migraciones por el session pooler (5432); la app usa el transaction pooler.
  dbCredentials: { url: (process.env.DIRECT_URL ?? process.env.DATABASE_URL)! },
});
