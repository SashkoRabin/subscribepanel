import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.ts";
export * from "./schema.ts";
export * from "./subscription-repository.ts";
export * from "./user-repository.ts";
export * from "./integration-repository.ts";

export function createDatabase(supabaseDatabaseUrl: string) {
  if (!supabaseDatabaseUrl) throw new Error("SUPABASE_DATABASE_URL is required.");
  const pool = new Pool({ connectionString: supabaseDatabaseUrl, max: 5 });
  return drizzle({ client: pool, schema });
}

