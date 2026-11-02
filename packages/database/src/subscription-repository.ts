import { and, asc, eq, ilike } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { CreateSubscriptionInput } from "@subscript/contracts";
import * as schema from "./schema.js";

type Database = NodePgDatabase<typeof schema>;

/**
 * Server-only persistence boundary. Its userId argument must come from an
 * authenticated session, never an HTTP request body.
 */
export function createSubscriptionRepository(database: Database) {
  return {
    async create(userId: string, input: CreateSubscriptionInput) {
      const [subscription] = await database.insert(schema.subscriptions).values({
        userId,
        name: input.name,
        merchant: input.merchant,
        categoryId: input.categoryId ?? null,
        amountMinor: input.amountMinor,
        currency: input.currency,
        billingInterval: input.billingInterval,
        customIntervalDays: input.customIntervalDays ?? null,
        nextBillingDate: input.nextBillingDate,
        trialEndDate: input.trialEndDate ?? null,
        status: input.trialEndDate ? "trial" : "active",
        source: "manual"
      }).returning();
      return subscription!;
    },

    async list(userId: string, query?: string) {
      const predicate = query
        ? and(eq(schema.subscriptions.userId, userId), ilike(schema.subscriptions.name, `%${query}%`))
        : eq(schema.subscriptions.userId, userId);
      return database.select().from(schema.subscriptions).where(predicate).orderBy(asc(schema.subscriptions.nextBillingDate));
    },

    async findById(userId: string, subscriptionId: string) {
      const [subscription] = await database.select().from(schema.subscriptions)
        .where(and(eq(schema.subscriptions.id, subscriptionId), eq(schema.subscriptions.userId, userId)));
      return subscription ?? null;
    }
  };
}
