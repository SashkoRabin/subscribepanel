import { sql } from "drizzle-orm";
import { check, date, index, integer, pgEnum, pgSchema, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

const id = () => uuid("id").defaultRandom().primaryKey();
const auditTimes = { createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(), updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull() };
/** Isolated from any unrelated tables that already exist in the Supabase project. */
export const subscript = pgSchema("subscript");

export const billingInterval = subscript.enum("billing_interval", ["weekly", "monthly", "quarterly", "semi_annually", "annually", "custom"]);
export const subscriptionStatus = subscript.enum("subscription_status", ["active", "trial", "paused", "cancelled", "archived"]);
export const subscriptionSource = subscript.enum("subscription_source", ["manual", "email", "bank", "import"]);
export const paymentStatus = subscript.enum("payment_status", ["pending", "completed", "failed", "refunded"]);
export const integrationStatus = subscript.enum("integration_status", ["connected", "revoked", "error"]);

export const users = subscript.table("users", {
  id: id(), email: text("email").notNull(), locale: text("locale").notNull().default("en"), timezone: text("timezone").notNull().default("Europe/Prague"), defaultCurrency: text("default_currency").notNull().default("EUR"), ...auditTimes
}, (table) => [uniqueIndex("users_email_unique").on(table.email), check("users_default_currency_iso", sql`default_currency ~ '^[A-Z]{3}$'`)]);

export const categories = subscript.table("categories", {
  id: id(), userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), name: text("name").notNull(), color: text("color"), ...auditTimes
}, (table) => [uniqueIndex("categories_user_name_unique").on(table.userId, table.name)]);

export const subscriptions = subscript.table("subscriptions", {
  id: id(), userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), name: text("name").notNull(), merchant: text("merchant").notNull(), categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }), amountMinor: integer("amount_minor").notNull(), currency: text("currency").notNull(), billingInterval: billingInterval("billing_interval").notNull(), customIntervalDays: integer("custom_interval_days"), nextBillingDate: date("next_billing_date", { mode: "string" }).notNull(), trialEndDate: date("trial_end_date", { mode: "string" }), status: subscriptionStatus("status").notNull().default("active"), source: subscriptionSource("source").notNull().default("manual"), ...auditTimes
}, (table) => [index("subscriptions_user_status_idx").on(table.userId, table.status), index("subscriptions_user_next_billing_idx").on(table.userId, table.nextBillingDate), check("subscriptions_amount_positive", sql`amount_minor > 0`), check("subscriptions_currency_iso", sql`currency ~ '^[A-Z]{3}$'`), check("subscriptions_custom_interval", sql`(billing_interval = 'custom' AND custom_interval_days IS NOT NULL AND custom_interval_days > 0) OR (billing_interval <> 'custom' AND custom_interval_days IS NULL)`)]);

export const payments = subscript.table("payments", {
  id: id(), subscriptionId: uuid("subscription_id").notNull().references(() => subscriptions.id, { onDelete: "cascade" }), amountMinor: integer("amount_minor").notNull(), currency: text("currency").notNull(), paymentDate: date("payment_date", { mode: "string" }).notNull(), status: paymentStatus("status").notNull().default("completed"), sourceReference: text("source_reference"), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [index("payments_subscription_date_idx").on(table.subscriptionId, table.paymentDate), uniqueIndex("payments_source_reference_unique").on(table.sourceReference).where(sql`source_reference is not null`), check("payments_amount_positive", sql`amount_minor > 0`), check("payments_currency_iso", sql`currency ~ '^[A-Z]{3}$'`)]);

export const subscriptionPrices = subscript.table("subscription_prices", {
  id: id(), subscriptionId: uuid("subscription_id").notNull().references(() => subscriptions.id, { onDelete: "cascade" }), amountMinor: integer("amount_minor").notNull(), currency: text("currency").notNull(), effectiveDate: date("effective_date", { mode: "string" }).notNull(), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [uniqueIndex("subscription_prices_effective_unique").on(table.subscriptionId, table.effectiveDate), check("subscription_prices_amount_positive", sql`amount_minor > 0`), check("subscription_prices_currency_iso", sql`currency ~ '^[A-Z]{3}$'`)]);

export const integrations = subscript.table("integrations", {
  id: id(), userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), provider: text("provider").notNull(), providerItemId: text("provider_item_id"), encryptedAccessToken: text("encrypted_access_token"), status: integrationStatus("status").notNull().default("connected"), connectedAt: timestamp("connected_at", { withTimezone: true }).defaultNow().notNull(), lastSyncedAt: timestamp("last_synced_at", { withTimezone: true })
}, (table) => [uniqueIndex("integrations_user_provider_item_unique").on(table.userId, table.provider, table.providerItemId), index("integrations_user_status_idx").on(table.userId, table.status)]);

export const bankAccounts = subscript.table("bank_accounts", {
  id: id(), userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), integrationId: uuid("integration_id").notNull().references(() => integrations.id, { onDelete: "cascade" }), providerAccountId: text("provider_account_id").notNull(), currency: text("currency").notNull(), status: text("status").notNull().default("active")
}, (table) => [uniqueIndex("bank_accounts_provider_account_unique").on(table.integrationId, table.providerAccountId), index("bank_accounts_user_idx").on(table.userId), check("bank_accounts_currency_iso", sql`currency ~ '^[A-Z]{3}$'`)]);

