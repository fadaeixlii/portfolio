import { describe, it, expect, vi, beforeEach } from "vitest";

// Pure branching on a mocked database — no network, no real Google/Resend
// calls. Covers the branches a review flagged as untested: a rate-limit
// query that errors must fail *closed*, the 23505 unique_violation race must
// become a 409, and a calendar write that fails after the row exists must
// mark it orphaned rather than leave a booking the calendar never heard of.
//
// Ported from the Supabase query-builder mock to a `postgres` tagged-template
// mock. The old version asserted builder calls (`.update({status})`, `.eq()`);
// this one asserts the SQL text, which is what actually runs now.

const insertEventMock = vi.fn();
const sendBookingEmailsMock = vi.fn();
const signBookingTokenMock = vi.fn((...args: unknown[]) => `${String(args[0])}.sig`);
const getAvailabilityMock = vi.fn();

/** Every `sql\`...\`` call, in order, as joined query text. */
const queries: string[] = [];
/** Queued results, one per `sql` call. A thrown value rejects instead. */
let results: unknown[] = [];

vi.mock("@/lib/calendar/google", () => ({
  insertEvent: (...args: unknown[]) => insertEventMock(...args),
}));
vi.mock("@/lib/email/booking", () => ({
  sendBookingEmails: (...args: unknown[]) => sendBookingEmailsMock(...args),
}));
vi.mock("@/lib/calendar/token", () => ({
  signBookingToken: (...args: unknown[]) => signBookingTokenMock(...args),
}));
vi.mock("@/lib/calendar/availability", () => ({
  getAvailability: (...args: unknown[]) => getAvailabilityMock(...args),
}));

vi.mock("@/lib/db", () => {
  // `sql` is callable two ways: tagged (a query) and as a helper for an
  // insert's column list, `sql({ ... })`. The helper returns a marker; only
  // tagged calls consume a queued result.
  const sql = (strings: TemplateStringsArray | Record<string, unknown>) => {
    if (!Array.isArray((strings as TemplateStringsArray).raw)) {
      return { __columns: strings };
    }
    queries.push((strings as TemplateStringsArray).join("?").replace(/\s+/g, " ").trim());
    const next = results.shift();
    if (next instanceof Error) return Promise.reject(next);
    return Promise.resolve(next ?? []);
  };
  return {
    sql,
    isUniqueViolation: (e: unknown) =>
      typeof e === "object" && e !== null && (e as { code?: string }).code === "23505",
  };
});

const START_ISO = "2026-10-05T05:30:00.000Z";
const END_ISO = "2026-10-05T06:00:00.000Z";

function bookRequest(overrides: Record<string, unknown> = {}) {
  return new Request("http://localhost/api/book", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      start: START_ISO,
      name: "Ada Lovelace",
      email: "ada@example.com",
      locale: "en",
      visitorTz: "Europe/Berlin",
      // Well past the 3s minimum-time-on-form floor.
      formRenderedAt: Date.now() - 60_000,
      ...overrides,
    }),
  });
}

const okCounts = [[{ count: 0 }], [{ count: 0 }]];

beforeEach(() => {
  queries.length = 0;
  results = [];
  insertEventMock.mockReset();
  sendBookingEmailsMock.mockReset();
  getAvailabilityMock.mockReset();
  getAvailabilityMock.mockResolvedValue([
    { start: new Date(START_ISO), end: new Date(END_ISO) },
  ]);
});

describe("POST /api/book", () => {
  it("503s and never inserts when a rate-limit count query errors", async () => {
    // A failed count must not read as "zero bookings" — that would let the
    // limiter fail open and hand an attacker an unlimited calendar.
    const { POST } = await import("@/app/api/book/route");
    results = [new Error("connection reset")];

    const res = await POST(bookRequest());

    expect(res.status).toBe(503);
    expect(queries.some((q) => q.includes("insert into bookings"))).toBe(false);
    expect(insertEventMock).not.toHaveBeenCalled();
  });

  it("maps a 23505 unique_violation on insert to 409 slot_taken", async () => {
    const { POST } = await import("@/app/api/book/route");
    results = [...okCounts, Object.assign(new Error("duplicate key"), { code: "23505" })];

    const res = await POST(bookRequest());

    expect(res.status).toBe(409);
    await expect(res.json()).resolves.toEqual({ error: "slot_taken" });
    // The row never existed, so no calendar event may be created for it.
    expect(insertEventMock).not.toHaveBeenCalled();
  });

  it("marks the row orphaned and returns 502 when the calendar write fails after insert", async () => {
    const { POST } = await import("@/app/api/book/route");
    const row = {
      id: "row-1",
      start_at: START_ISO,
      end_at: END_ISO,
      name: "Ada Lovelace",
      email: "ada@example.com",
      topic: null,
      notes: null,
      locale: "en",
      visitor_tz: "Europe/Berlin",
      meet_url: null,
    };
    results = [...okCounts, [row], []];
    insertEventMock.mockRejectedValueOnce(new Error("google unreachable"));

    const res = await POST(bookRequest());

    expect(res.status).toBe(502);
    await expect(res.json()).resolves.toEqual({ error: "calendar_write_failed" });
    expect(queries.at(-1)).toContain("set status = 'orphaned'");
    // No confirmation may go out for a booking the calendar does not hold.
    expect(sendBookingEmailsMock).not.toHaveBeenCalled();
  });

  it("drops a tripped honeypot with 200 and never touches the database", async () => {
    const { POST } = await import("@/app/api/book/route");

    const res = await POST(bookRequest({ company: "spam corp" }));

    expect(res.status).toBe(200);
    expect(queries).toHaveLength(0);
  });
});
