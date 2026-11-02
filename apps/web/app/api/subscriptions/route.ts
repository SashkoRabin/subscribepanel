import { createSubscriptionSchema } from "@subscript/contracts";
import { requireSubscriptionContext, subscriptionDto } from "../../../lib/subscriptions";

export async function GET(request: Request) {
  const context = await requireSubscriptionContext();
  if (!context) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const query = new URL(request.url).searchParams.get("q") ?? undefined;
  const subscriptions = await context.subscriptions.list(context.user.id, query);
  return Response.json({ data: subscriptions.map(subscriptionDto) });
}

export async function POST(request: Request) {
  const context = await requireSubscriptionContext();
  if (!context) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = createSubscriptionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid subscription input", details: parsed.error.flatten() }, { status: 422 });
  const subscription = await context.subscriptions.create(context.user.id, parsed.data);
  return Response.json({ data: subscriptionDto(subscription) }, { status: 201 });
}
