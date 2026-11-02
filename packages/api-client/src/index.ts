import { createSubscriptionSchema, subscriptionDtoSchema, updateSubscriptionSchema, type CreateSubscriptionInput, type SubscriptionDto, type UpdateSubscriptionInput } from "@subscript/contracts";

export class SubscriptApiClient {
  constructor(private readonly baseUrl: string, private readonly fetcher: typeof fetch = fetch) {}
  async createSubscription(input: CreateSubscriptionInput): Promise<SubscriptionDto> {
    const body = createSubscriptionSchema.parse(input);
    const response = await this.fetcher(new URL("/api/subscriptions", this.baseUrl), { method: "POST", headers: { "content-type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    if (!response.ok) throw new Error("Unable to create subscription.");
    return subscriptionDtoSchema.parse((await response.json()).data);
  }

  async listSubscriptions(query?: string): Promise<SubscriptionDto[]> {
    const url = new URL("/api/subscriptions", this.baseUrl);
    if (query) url.searchParams.set("q", query);
    const response = await this.fetcher(url, { credentials: "include" });
    if (!response.ok) throw new Error("Unable to load subscriptions.");
    return subscriptionDtoSchema.array().parse((await response.json()).data);
  }

  async updateSubscription(id: string, input: UpdateSubscriptionInput): Promise<SubscriptionDto> {
    const body = updateSubscriptionSchema.parse(input);
    const response = await this.fetcher(new URL(`/api/subscriptions/${id}`, this.baseUrl), { method: "PATCH", headers: { "content-type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    if (!response.ok) throw new Error("Unable to update subscription.");
    return subscriptionDtoSchema.parse((await response.json()).data);
  }

  async deleteSubscription(id: string): Promise<void> {
    const response = await this.fetcher(new URL(`/api/subscriptions/${id}`, this.baseUrl), { method: "DELETE", credentials: "include" });
    if (!response.ok) throw new Error("Unable to delete subscription.");
  }
}

