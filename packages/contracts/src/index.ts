import { z } from "zod";

export const currencySchema = z.string().regex(/^[A-Z]{3}$/, "Use an ISO 4217 currency code.");
export const calendarDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.");
export const billingIntervalSchema = z.enum(["weekly", "monthly", "quarterly", "semi_annually", "annually", "custom"]);
export const subscriptionStatusSchema = z.enum(["active", "trial", "paused", "cancelled", "archived"]);

export const createSubscriptionSchema = z.object({
  name: z.string().trim().min(1).max(160),
  merchant: z.string().trim().min(1).max(160),
  categoryId: z.uuid().nullable().optional(),
  amountMinor: z.int().positive(),
  currency: currencySchema,
  billingInterval: billingIntervalSchema,
  customIntervalDays: z.int().min(1).max(3660).nullable().optional(),
  nextBillingDate: calendarDateSchema,
  trialEndDate: calendarDateSchema.nullable().optional()
}).superRefine((value, context) => {
  if (value.billingInterval === "custom" && !value.customIntervalDays) context.addIssue({ code: "custom", path: ["customIntervalDays"], message: "Custom billing needs a day interval." });
  if (value.billingInterval !== "custom" && value.customIntervalDays) context.addIssue({ code: "custom", path: ["customIntervalDays"], message: "Only custom billing may have a day interval." });
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;

export const updateSubscriptionSchema = createSubscriptionSchema.extend({
  status: subscriptionStatusSchema.optional()
});

export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;

export const subscriptionDtoSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  merchant: z.string(),
  amountMinor: z.int().positive(),
  currency: currencySchema,
  billingInterval: billingIntervalSchema,
  customIntervalDays: z.int().positive().nullable(),
  nextBillingDate: calendarDateSchema,
  trialEndDate: calendarDateSchema.nullable(),
  status: subscriptionStatusSchema,
  source: z.enum(["manual", "email", "bank", "import"])
});

export type SubscriptionDto = z.infer<typeof subscriptionDtoSchema>;

