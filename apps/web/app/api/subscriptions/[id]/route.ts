import { subscriptionIdSchema, updateSubscriptionSchema } from "@subscript/contracts";
import { requireSubscriptionContext, subscriptionDto } from "../../../../lib/subscriptions";

async function subscriptionId(context: RouteContext<"/api/subscriptions/[id]">) {
  const { id } = await context.params;
  return subscriptionIdSchema.safeParse(id);
}

export async function GET(_request: Request, context: RouteContext<"/api/subscriptions/[id]">) {
  const session = await requireSubscriptionContext();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsedId = await subscriptionId(context);
  if (!parsedId.success) return Response.json({ error: "Invalid subscription ID" }, { status: 400 });
  const subscription = await session.subscriptions.findById(session.user.id, parsedId.data);
  return subscription ? Response.json({ data: subscriptionDto(subscription) }) : Response.json({ error: "Not found" }, { status: 404 });
}

export async function PATCH(request: Request, context: RouteContext<"/api/subscriptions/[id]">) {
  const session = await requireSubscriptionContext();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = updateSubscriptionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid subscription input", details: parsed.error.flatten() }, { status: 422 });
  const parsedId = await subscriptionId(context);
  if (!parsedId.success) return Response.json({ error: "Invalid subscription ID" }, { status: 400 });
  const subscription = await session.subscriptions.update(session.user.id, parsedId.data, parsed.data);
  return subscription ? Response.json({ data: subscriptionDto(subscription) }) : Response.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(_request: Request, context: RouteContext<"/api/subscriptions/[id]">) {
  const session = await requireSubscriptionContext();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsedId = await subscriptionId(context);
  if (!parsedId.success) return Response.json({ error: "Invalid subscription ID" }, { status: 400 });
  const deleted = await session.subscriptions.delete(session.user.id, parsedId.data);
  return deleted ? new Response(null, { status: 204 }) : Response.json({ error: "Not found" }, { status: 404 });
}
