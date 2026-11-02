import { createDatabase, createIntegrationRepository, createSubscriptionRepository, createUserRepository } from "@subscript/database";
import type { SubscriptionDto } from "@subscript/contracts";
import "./runtime-env";
import { createServerSupabaseClient } from "./supabase/server";

function database() {
  const url = process.env.SUPABASE_DATABASE_URL;
  if (!url) throw new Error("SUPABASE_DATABASE_URL must be configured.");
  return createDatabase(url);
}

export async function requireSubscriptionContext() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;
  const db = database();
  await createUserRepository(db).ensure({ id: user.id, email: user.email });
  return { user, subscriptions: createSubscriptionRepository(db), integrations: createIntegrationRepository(db) };
}

export function subscriptionDto(subscription: {
  id: string; name: string; merchant: string; amountMinor: number; currency: string;
  billingInterval: SubscriptionDto["billingInterval"]; customIntervalDays: number | null;
  nextBillingDate: string; trialEndDate: string | null; status: SubscriptionDto["status"];
  source: SubscriptionDto["source"];
}): SubscriptionDto {
  return subscription;
}
