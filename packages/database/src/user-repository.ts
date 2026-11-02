import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema.ts";

type Database = NodePgDatabase<typeof schema>;

/** Maintains the local profile corresponding to an authenticated Supabase user. */
export function createUserRepository(database: Database) {
  return {
    async ensure(user: { id: string; email: string }) {
      const [profile] = await database.insert(schema.users).values({ id: user.id, email: user.email })
        .onConflictDoUpdate({ target: schema.users.id, set: { email: user.email, updatedAt: new Date() } })
        .returning();
      return profile!;
    },

    async findById(userId: string) {
      const [profile] = await database.select().from(schema.users).where(eq(schema.users.id, userId));
      return profile ?? null;
    }
  };
}
