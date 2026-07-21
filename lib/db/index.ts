import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/drizzle/schema";

// Server-only: uses the Supabase connection pooler. Never import this file
// from client components.
//
// Cached on `globalThis` so Next.js dev Fast Refresh reuses the same client
// across module reloads instead of opening a new pooled connection every
// time this file is re-evaluated — without this, a few edits exhaust the
// pooler's session-mode connection limit ("max clients reached in session
// mode").
const globalForDb = globalThis as unknown as { dbClient?: ReturnType<typeof postgres> };

const client =
  globalForDb.dbClient ?? postgres(process.env.DATABASE_URL!, { prepare: false });

if (process.env.NODE_ENV !== "production") {
  globalForDb.dbClient = client;
}

export const db = drizzle(client, { schema, casing: "snake_case" });
