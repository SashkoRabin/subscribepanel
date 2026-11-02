import { createSubscriptionSchema, type CreateSubscriptionInput } from "@subscript/contracts";

export class SubscriptApiClient {
  constructor(private readonly baseUrl: string, private readonly fetcher: typeof fetch = fetch) {}
  async createSubscription(input: CreateSubscriptionInput): Promise<void> {
    const body = createSubscriptionSchema.parse(input);
    const response = await this.fetcher(new URL("/api/subscriptions", this.baseUrl), { method: "POST", headers: { "content-type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    if (!response.ok) throw new Error("Unable to create subscription.");
  }
}

