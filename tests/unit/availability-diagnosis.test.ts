import { describe, it, expect } from "vitest";
import { describeFailure } from "@/app/api/availability/route";

/**
 * The booker degrades to "email me instead" whenever availability fails, so
 * the only way anyone learns *why* is this log line. It has been wrong in
 * practice — printing a DOMException's 25 legacy constants with the cause
 * buried in them — and each failure now has a different fix, so naming the
 * wrong one sends someone to the wrong place.
 */
describe("describeFailure", () => {
  it("tells you to start the database when nothing is listening", () => {
    const refused = Object.assign(new Error("connect ECONNREFUSED 127.0.0.1:5433"), {
      code: "ECONNREFUSED",
    });
    expect(describeFailure(refused)).toMatch(/db:up/);
  });

  it("tells you to migrate when the table is absent", () => {
    const missing = Object.assign(new Error('relation "bookings" does not exist'), {
      code: "42P01",
    });
    expect(describeFailure(missing)).toMatch(/db:migrate/);
  });

  it("does not confuse the two — they have different fixes", () => {
    const refused = Object.assign(new Error("x"), { code: "ECONNREFUSED" });
    expect(describeFailure(refused)).not.toMatch(/migrate/);
  });

  it("passes anything else through rather than guessing", () => {
    expect(describeFailure(new Error("invalid_grant"))).toBe("invalid_grant");
  });
});
