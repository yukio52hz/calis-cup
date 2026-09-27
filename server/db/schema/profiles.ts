import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";

export const categoryEnum = pgEnum("category", ["female", "male"]);
export const roleEnum = pgEnum("role", ["admin", "competitor"]);

// RLS activado y sin políticas: la API pública de Supabase (anon key) no puede
// leer ni escribir. La app accede con Drizzle como rol "postgres", que ignora RLS.
export const profiles = pgTable("profiles", {
  // Mismo id que auth.users
  id: uuid()
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  firstName: text().notNull(),
  lastName: text().notNull(),
  username: text().unique(),
  email: text().notNull(),
  phone: text(),
  photoPath: text(),
  category: categoryEnum().notNull(),
  role: roleEnum().notNull().default("competitor"),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}).enableRLS();
