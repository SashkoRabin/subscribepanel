import { and, desc, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema.ts";

type Database = NodePgDatabase<typeof schema>;

/** Provider-agnostic connection store. Secrets and bank credentials are never persisted here. */
export function createIntegrationRepository(database: Database) {
  return {
    async list(userId: string) {
      return database.select().from(schema.integrations).where(eq(schema.integrations.userId, userId)).orderBy(desc(schema.integrations.connectedAt));
    },
    async connectDevelopmentMock(userId: string) {
      const [integration] = await database.insert(schema.integrations).values({ userId, provider: "mock-open-banking", status: "connected", lastSyncedAt: new Date() })
        .onConflictDoUpdate({ target: [schema.integrations.userId, schema.integrations.provider], set: { status: "connected", lastSyncedAt: new Date() } }).returning();
      await database.insert(schema.bankAccounts).values({ userId, integrationId: integration!.id, providerAccountId: "development-checking", currency: "EUR", status: "active" })
        .onConflictDoNothing();
      return integration!;
    },
    async revoke(userId: string, integrationId: string) {
      const [integration] = await database.update(schema.integrations).set({ status: "revoked", encryptedAccessToken: null }).where(and(eq(schema.integrations.id, integrationId), eq(schema.integrations.userId, userId))).returning();
      return integration ?? null;
    },
    async connectPlaid(userId: string, itemId: string, encryptedAccessToken: string, accounts: Array<{ id: string; currency: string }>) {
      const [integration] = await database.insert(schema.integrations).values({ userId, provider: "plaid", providerItemId: itemId, encryptedAccessToken, status: "connected", lastSyncedAt: new Date() })
        .onConflictDoUpdate({ target: [schema.integrations.userId, schema.integrations.provider, schema.integrations.providerItemId], set: { encryptedAccessToken, status: "connected", lastSyncedAt: new Date() } }).returning();
      for (const account of accounts) await database.insert(schema.bankAccounts).values({ userId, integrationId: integration!.id, providerAccountId: account.id, currency: account.currency, status: "active" }).onConflictDoNothing();
      return integration!;
    }
  };
}
