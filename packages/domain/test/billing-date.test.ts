import { describe, expect, it } from "vitest";
import { nextBillingDate } from "../src/index.js";

describe("nextBillingDate", () => {
  it("preserves a month-end payment day where possible", () => {
    expect(nextBillingDate("2026-01-31", "monthly")).toBe("2026-02-28");
    expect(nextBillingDate("2028-01-31", "monthly")).toBe("2028-02-29");
    expect(nextBillingDate("2028-02-29", "annually")).toBe("2029-02-28");
  });
});
