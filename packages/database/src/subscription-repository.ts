import { and, asc, eq, ilike } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { CreateSubscriptionInput, UpdateSubscriptionInput } from "@subscript/contracts";
import * as schema from "./schema.ts";

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

    async list(userId: string, query?: string, status?: "active" | "trial" | "paused" | "cancelled" | "archived") {
      const predicates = [eq(schema.subscriptions.userId, userId)];
      if (query) predicates.push(ilike(schema.subscriptions.name, `%${query}%`));
      if (status) predicates.push(eq(schema.subscriptions.status, status));
      const predicate = and(...predicates);
      return database.select().from(schema.subscriptions).where(predicate).orderBy(asc(schema.subscriptions.nextBillingDate));
    },

    async findById(userId: string, subscriptionId: string) {
      const [subscription] = await database.select().from(schema.subscriptions)
        .where(and(eq(schema.subscriptions.id, subscriptionId), eq(schema.subscriptions.userId, userId)));
      return subscription ?? null;
    },

    async update(userId: string, subscriptionId: string, input: UpdateSubscriptionInput) {
      const existing = await this.findById(userId, subscriptionId);
      if (!existing) return null;
      const [subscription] = await database.update(schema.subscriptions).set({
        name: input.name,
        merchant: input.merchant,
        categoryId: input.categoryId ?? null,
        amountMinor: input.amountMinor,
        currency: input.currency,
        billingInterval: input.billingInterval,
        customIntervalDays: input.customIntervalDays ?? null,
        nextBillingDate: input.nextBillingDate,
        trialEndDate: input.trialEndDate ?? null,
        status: input.status ?? existing.status,
        updatedAt: new Date()
      }).where(and(eq(schema.subscriptions.id, subscriptionId), eq(schema.subscriptions.userId, userId))).returning();
      if (!subscription) return null;
      if (existing.amountMinor !== subscription.amountMinor || existing.currency !== subscription.currency) {
        await database.insert(schema.subscriptionPrices).values({
          subscriptionId,
          amountMinor: subscription.amountMinor,
          currency: subscription.currency,
          effectiveDate: subscription.nextBillingDate
        }).onConflictDoNothing();
      }
      return subscription;
    },

    async archive(userId: string, subscriptionId: string) {
      const [subscription] = await database.update(schema.subscriptions).set({ status: "archived", updatedAt: new Date() })
        .where(and(eq(schema.subscriptions.id, subscriptionId), eq(schema.subscriptions.userId, userId))).returning();
      return subscription ?? null;
    },

    async cancel(userId: string, subscriptionId: string) {
      const [subscription] = await database.update(schema.subscriptions).set({ status: "cancelled", updatedAt: new Date() })
        .where(and(eq(schema.subscriptions.id, subscriptionId), eq(schema.subscriptions.userId, userId))).returning();
      return subscription ?? null;
    },

    async delete(userId: string, subscriptionId: string) {
      const [subscription] = await database.delete(schema.subscriptions)
        .where(and(eq(schema.subscriptions.id, subscriptionId), eq(schema.subscriptions.userId, userId))).returning({ id: schema.subscriptions.id });
      return subscription ?? null;
    }
  };
}
