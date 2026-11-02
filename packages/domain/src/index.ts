import type { z } from "zod";
import { billingIntervalSchema } from "@subscript/contracts";
import { isCalendarDate } from "@subscript/utils";

export type BillingInterval = z.infer<typeof billingIntervalSchema>;

function daysInMonth(year: number, month: number): number { return new Date(Date.UTC(year, month, 0)).getUTCDate(); }

/** Advances a calendar billing date without converting it to a local timestamp. */
export function nextBillingDate(date: string, interval: BillingInterval, customIntervalDays?: number): string {
  if (!isCalendarDate(date)) throw new Error("Invalid billing date.");
  const [yearValue, monthValue, dayValue] = date.split("-").map(Number);
  let year = yearValue!; let month = monthValue!; const day = dayValue!;
  if (interval === "weekly" || interval === "custom") {
    const amount = interval === "weekly" ? 7 : customIntervalDays;
    if (!amount) throw new Error("Custom interval requires a day count.");
    const advanced = new Date(Date.UTC(year, month - 1, day + amount));
    return advanced.toISOString().slice(0, 10);
  }
  const months = { monthly: 1, quarterly: 3, semi_annually: 6, annually: 12 }[interval];
  if (!months) throw new Error("Unsupported interval.");
  month += months;
  year += Math.floor((month - 1) / 12);
  month = ((month - 1) % 12) + 1;
  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${Math.min(day, daysInMonth(year, month)).toString().padStart(2, "0")}`;
}

