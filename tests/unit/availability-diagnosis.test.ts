import { describe, it, expect } from "vitest";
import { describeFailure } from "@/app/api/availability/route";

/**
 * The booker degrades to "email me instead" whenever availability fails, so
 * the only way anyone learns *why* is this log line. It has been wrong twice
 * in practice — once printing a DOMException's 25 legacy constants and
 * burying the cause, and once reading as a Supabase outage when the project
 * was healthy and only the local resolver was broken.
 */
describe("describeFailure", () => {
  it("names DNS for an abort, not a slow database", () => {
    const timeout = new Error("The operation was aborted due to timeout");
    timeout.name = "TimeoutError";
    expect(describeFailure(timeout)).toMatch(/DNS/);
    // The distinction that matters: this is not the host being down.
    expect(describeFailure(timeout)).not.toMatch(/outage|down/i);
  });

  it("names the unapplied migrations when the table is absent", () => {
    const missing = new Error(
      `bookings lookup failed: Could not find the table 'public.bookings' in the schema cache (PGRST205)`,
    );
    expect(describeFailure(missing)).toMatch(/migrations/);
  });

  it("passes anything else through rather than guessing", () => {
    expect(describeFailure(new Error("invalid_grant"))).toBe("invalid_grant");
  });
});
