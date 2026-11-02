import { createPlaidLinkToken } from "../../../../../lib/plaid";
import { requireSubscriptionContext } from "../../../../../lib/subscriptions";
export async function POST() { const context = await requireSubscriptionContext(); if (!context) return Response.json({ error: "Unauthorized" }, { status: 401 }); try { return Response.json({ linkToken: await createPlaidLinkToken(context.user.id) }); } catch { return Response.json({ error: "Plaid is unavailable." }, { status: 503 }); } }
