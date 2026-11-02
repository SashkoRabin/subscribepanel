export const supportedCurrencies = ["EUR", "CZK"] as const;
export type SupportedCurrency = (typeof supportedCurrencies)[number];

export function formatMinorUnits(amountMinor: number, currency: string, locale = "en-IE"): string {
  if (!Number.isSafeInteger(amountMinor)) throw new Error("Amount must be a safe integer in minor units.");
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amountMinor / 100);
}

export function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year!, month! - 1, day!));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month! - 1 && date.getUTCDate() === day;
}

export function formatCalendarDate(value: string, locale = "ru-RU"): string {
  if (!isCalendarDate(value)) return value;
  const [year, month, day] = value.split("-");
  return locale === "ru-RU" ? `${day}.${month}.${year}` : `${day}.${month}.${year}`;
}

