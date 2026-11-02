"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSubscriptionContext } from "../../lib/subscriptions";
export async function connectDevelopmentBank() { const context = await requireSubscriptionContext(); if (!context) redirect("/auth"); await context.integrations.connectDevelopmentMock(context.user.id); revalidatePath("/integrations"); }
export async function revokeIntegration(id: string) { const context = await requireSubscriptionContext(); if (!context) redirect("/auth"); await context.integrations.revoke(context.user.id, id); revalidatePath("/integrations"); }
