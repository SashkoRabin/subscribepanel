import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { resolve } from "node:path";

// Drizzle runs from this package, while shared local configuration lives at
// the monorepo root. Loading it here makes db:* scripts work consistently.
config({ path: resolve(process.cwd(), "../..", ".env") });

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.SUPABASE_DATABASE_URL ?? "" },
  strict: true,
  verbose: true
});

