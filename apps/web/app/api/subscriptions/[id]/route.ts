import { updateSubscriptionSchema } from "@subscript/contracts";
import { requireSubscriptionContext, subscriptionDto } from "../../../../lib/subscriptions";

export async function GET(_request: Request, context: RouteContext<"/api/subscriptions/[id]">) {
  const session = await requireSubscriptionContext();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const subscription = await session.subscriptions.findById(session.user.id, id);
  return subscription ? Response.json({ data: subscriptionDto(subscription) }) : Response.json({ error: "Not found" }, { status: 404 });
}

export async function PATCH(request: Request, context: RouteContext<"/api/subscriptions/[id]">) {
  const session = await requireSubscriptionContext();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = updateSubscriptionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid subscription input", details: parsed.error.flatten() }, { status: 422 });
  const { id } = await context.params;
  const subscription = await session.subscriptions.update(session.user.id, id, parsed.data);
  return subscription ? Response.json({ data: subscriptionDto(subscription) }) : Response.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(_request: Request, context: RouteContext<"/api/subscriptions/[id]">) {
  const session = await requireSubscriptionContext();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const deleted = await session.subscriptions.delete(session.user.id, id);
  return deleted ? new Response(null, { status: 204 }) : Response.json({ error: "Not found" }, { status: 404 });
}
