import { describe, expect, it } from "vitest";
import { isCalendarDate } from "../src/index.js";

describe("isCalendarDate", () => {
  it("accepts leap days and rejects invalid dates", () => {
    expect(isCalendarDate("2028-02-29")).toBe(true);
    expect(isCalendarDate("2027-02-29")).toBe(false);
    expect(isCalendarDate("2026-04-31")).toBe(false);
  });
});

