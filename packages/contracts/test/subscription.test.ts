import { describe, expect, it } from "vitest";
import { createSubscriptionSchema } from "../src/index.ts";

const validSubscription = {
  name: "Music service",
  merchant: "Example Ltd",
  amountMinor: 1299,
  currency: "EUR",
  billingInterval: "monthly" as const,
  nextBillingDate: "2028-02-29"
};

describe("subscription input", () => {
  it("rejects impossible calendar dates at the public boundary", () => {
    expect(createSubscriptionSchema.safeParse({ ...validSubscription, nextBillingDate: "2027-02-29" }).success).toBe(false);
  });

  it("accepts a real leap-day date", () => {
    expect(createSubscriptionSchema.safeParse(validSubscription).success).toBe(true);
  });
});
