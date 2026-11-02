import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
export * from "./schema.js";
export * from "./subscription-repository.js";

export function createDatabase(supabaseDatabaseUrl: string) {
  if (!supabaseDatabaseUrl) throw new Error("SUPABASE_DATABASE_URL is required.");
  const pool = new Pool({ connectionString: supabaseDatabaseUrl, max: 5 });
  return drizzle({ client: pool });
}

