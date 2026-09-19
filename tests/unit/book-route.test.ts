import { describe, it, expect, vi, beforeEach } from "vitest";

// Pure branching on a mocked Supabase response — no network, no real
// Google/Resend calls. Covers the two branches the review flagged as
// untested: the 23505 (unique_violation) race -> 409, and the "calendar
// write failed after the row was inserted" -> row marked orphaned -> 502.

const insertEventMock = vi.fn();
const sendBookingEmailsMock = vi.fn();
const signBookingTokenMock = vi.fn((...args: unknown[]) => `${String(args[0])}.sig`);
const getAvailabilityMock = vi.fn();
const fromMock = vi.fn();

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
vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({ from: (...args: unknown[]) => fromMock(...args) }),
}));

type QueryResult = { count?: number | null; data?: unknown; error?: unknown };

/** Chainable stand-in for a Supabase query builder: every filter method
 *  returns itself, and it resolves to `result` whether the caller awaits
 *  it directly (the count queries) or calls `.single()` (the insert). */
function makeBuilder(result: QueryResult) {
  const builder: Record<string, unknown> = {};
  const chain = () => builder;
  builder.select = vi.fn(chain);
  builder.insert = vi.fn(chain);
  builder.update = vi.fn(chain);
  builder.eq = vi.fn(chain);
  builder.neq = vi.fn(chain);
  builder.gte = vi.fn(chain);
  builder.lte = vi.fn(chain);
  builder.retry = vi.fn(chain);
  builder.single = vi.fn(() => Promise.resolve(result));
  builder.then = (resolve: (v: QueryResult) => void, reject?: (e: unknown) => void) =>
    Promise.resolve(result).then(resolve, reject);
  return builder;
}

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

beforeEach(() => {
  fromMock.mockReset();
  insertEventMock.mockReset();
  sendBookingEmailsMock.mockReset();
  getAvailabilityMock.mockReset();
  getAvailabilityMock.mockResolvedValue([
    { start: new Date(START_ISO), end: new Date(END_ISO) },
  ]);
});

describe("POST /api/book", () => {
  it("503s and never inserts when the ip rate-limit count query errors", async () => {
    // A failed count must not read as "zero bookings" — that would let the
    // limiter fail open. count comes back null alongside a Supabase error.
    const { POST } = await import("@/app/api/book/route");

    fromMock.mockReturnValueOnce(
      makeBuilder({ count: null, error: { message: "connection reset" } }),
    ); // ip cap query fails

    const res = await POST(bookRequest());

    expect(res.status).toBe(503);
    expect(fromMock).toHaveBeenCalledTimes(1);
    expect(insertEventMock).not.toHaveBeenCalled();
  });

  it("503s and never inserts when the email rate-limit count query errors", async () => {
    const { POST } = await import("@/app/api/book/route");

    fromMock
      .mockReturnValueOnce(makeBuilder({ count: 0 })) // ip cap ok
      .mockReturnValueOnce(
        makeBuilder({ count: null, error: { message: "connection reset" } }),
      ); // email cap query fails

    const res = await POST(bookRequest());

    expect(res.status).toBe(503);
    expect(insertEventMock).not.toHaveBeenCalled();
  });

  it("maps a 23505 unique_violation on insert to 409 slot_taken", async () => {
    const { POST } = await import("@/app/api/book/route");

    fromMock
      .mockReturnValueOnce(makeBuilder({ count: 0 })) // ip cap
      .mockReturnValueOnce(makeBuilder({ count: 0 })) // email cap
      .mockReturnValueOnce(
        makeBuilder({ data: null, error: { code: "23505", message: "duplicate" } }),
      ); // insert

    const res = await POST(bookRequest());

    expect(res.status).toBe(409);
    await expect(res.json()).resolves.toEqual({ error: "slot_taken" });
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
    };
    const orphanBuilder = makeBuilder({});

    fromMock
      .mockReturnValueOnce(makeBuilder({ count: 0 })) // ip cap
      .mockReturnValueOnce(makeBuilder({ count: 0 })) // email cap
      .mockReturnValueOnce(makeBuilder({ data: row, error: null })) // insert
      .mockReturnValueOnce(orphanBuilder); // status: orphaned update

    insertEventMock.mockRejectedValueOnce(new Error("google unreachable"));

    const res = await POST(bookRequest());

    expect(res.status).toBe(502);
    await expect(res.json()).resolves.toEqual({ error: "calendar_write_failed" });
    expect(orphanBuilder.update).toHaveBeenCalledWith({ status: "orphaned" });
    expect(orphanBuilder.eq).toHaveBeenCalledWith("id", "row-1");
    expect(sendBookingEmailsMock).not.toHaveBeenCalled();
  });
});
