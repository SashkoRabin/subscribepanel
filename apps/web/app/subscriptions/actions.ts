"use server";

import { createSubscriptionSchema, subscriptionIdSchema, updateSubscriptionSchema } from "@subscript/contracts";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSubscriptionContext } from "../../lib/subscriptions";

function parseAmountMinor(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim().replace(",", ".");
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(normalized);
  if (!match) return null;
  return Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
}

function formInput(formData: FormData) {
  const customDays = String(formData.get("customIntervalDays") ?? "").trim();
  return {
    name: String(formData.get("name") ?? ""),
    merchant: String(formData.get("merchant") ?? ""),
    amountMinor: parseAmountMinor(formData.get("amount")),
    currency: String(formData.get("currency") ?? ""),
    billingInterval: String(formData.get("billingInterval") ?? ""),
    customIntervalDays: customDays ? Number(customDays) : undefined,
    nextBillingDate: String(formData.get("nextBillingDate") ?? ""),
    trialEndDate: String(formData.get("trialEndDate") ?? "") || undefined
  };
}

function revalidateSubscriptionViews(subscriptionId?: string) {
  revalidatePath("/");
  revalidatePath("/analytics");
  revalidatePath("/subscriptions");
  if (subscriptionId) revalidatePath(`/subscriptions/${subscriptionId}`);
}

function validSubscriptionId(value: string) {
  return subscriptionIdSchema.safeParse(value).success;
}

export async function createSubscription(formData: FormData) {
  const context = await requireSubscriptionContext();
  if (!context) redirect("/auth");
  const parsed = createSubscriptionSchema.safeParse(formInput(formData));
  if (!parsed.success) redirect(`/subscriptions?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Check the subscription details.")}`);
  await context.subscriptions.create(context.user.id, parsed.data);
  revalidateSubscriptionViews();
  redirect("/subscriptions?message=Subscription+added.");
}

export async function archiveSubscription(subscriptionId: string) {
  const context = await requireSubscriptionContext();
  if (!context) redirect("/auth");
  if (!validSubscriptionId(subscriptionId)) redirect("/subscriptions?error=Invalid+subscription.");
  await context.subscriptions.archive(context.user.id, subscriptionId);
  revalidateSubscriptionViews(subscriptionId);
  redirect("/subscriptions?message=Subscription+archived.");
}

export async function cancelSubscription(subscriptionId: string) {
  const context = await requireSubscriptionContext();
  if (!context) redirect("/auth");
  if (!validSubscriptionId(subscriptionId)) redirect("/subscriptions?error=Invalid+subscription.");
  await context.subscriptions.cancel(context.user.id, subscriptionId);
  revalidateSubscriptionViews(subscriptionId);
  redirect("/subscriptions?message=Subscription+marked+as+cancelled.+Contact+the+merchant+to+stop+their+charges.");
}

export async function updateSubscription(subscriptionId: string, formData: FormData) {
  const context = await requireSubscriptionContext();
  if (!context) redirect("/auth");
  if (!validSubscriptionId(subscriptionId)) redirect("/subscriptions?error=Invalid+subscription.");
  const parsed = updateSubscriptionSchema.safeParse({ ...formInput(formData), status: String(formData.get("status") ?? "active") });
  if (!parsed.success) redirect(`/subscriptions/${subscriptionId}?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Check the subscription details.")}`);
  const subscription = await context.subscriptions.update(context.user.id, subscriptionId, parsed.data);
  if (!subscription) redirect("/subscriptions?error=Subscription+not+found.");
  revalidateSubscriptionViews(subscriptionId);
  redirect("/subscriptions?message=Subscription+updated.");
}

export async function deleteSubscription(subscriptionId: string) {
  const context = await requireSubscriptionContext();
  if (!context) redirect("/auth");
  if (!validSubscriptionId(subscriptionId)) redirect("/subscriptions?error=Invalid+subscription.");
  const deleted = await context.subscriptions.delete(context.user.id, subscriptionId);
  if (!deleted) redirect("/subscriptions?error=Subscription+not+found.");
  revalidateSubscriptionViews(subscriptionId);
  redirect("/subscriptions?message=Subscription+deleted.");
}
