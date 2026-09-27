import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/lib/env";

import * as schema from "./schema";

// Reutiliza la conexión entre recargas en desarrollo.
const globalForDb = globalThis as unknown as { sql?: postgres.Sql };

// prepare: false → requerido por el transaction pooler de Supabase.
const sql = globalForDb.sql ?? postgres(env.DATABASE_URL, { prepare: false });

if (env.NODE_ENV !== "production") globalForDb.sql = sql;

export const db = drizzle(sql, { schema, casing: "snake_case" });
