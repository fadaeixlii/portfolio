import { describe, it, expect, vi, beforeEach } from "vitest";

// Pure branching on a mocked Supabase response — no network, no real Resend
// call. Covers: honeypot -> 200 without an insert, rate limit -> 429, and
// insert failure -> 500. Mirrors tests/unit/book-route.test.ts.

const sendContactEmailMock = vi.fn();
const fromMock = vi.fn();

vi.mock("@/lib/email/contact", () => ({
  sendContactEmail: (...args: unknown[]) => sendContactEmailMock(...args),
}));
vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({ from: (...args: unknown[]) => fromMock(...args) }),
}));

type QueryResult = { count?: number | null; data?: unknown; error?: unknown };

/** Chainable stand-in for a Supabase query builder — every filter method
 *  returns itself, resolving to `result` whether the caller awaits it
 *  directly (the count query) or calls `.single()` (the insert). */
function makeBuilder(result: QueryResult) {
  const builder: Record<string, unknown> = {};
  const chain = () => builder;
  builder.select = vi.fn(chain);
  builder.insert = vi.fn(chain);
  builder.eq = vi.fn(chain);
  builder.gte = vi.fn(chain);
  builder.retry = vi.fn(chain);
  builder.single = vi.fn(() => Promise.resolve(result));
  builder.then = (resolve: (v: QueryResult) => void, reject?: (e: unknown) => void) =>
    Promise.resolve(result).then(resolve, reject);
  return builder;
}

function contactRequest(overrides: Record<string, unknown> = {}) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.5" },
    body: JSON.stringify({
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "This message is well past the twenty character floor.",
      locale: "en",
      ...overrides,
    }),
  });
}

beforeEach(() => {
  fromMock.mockReset();
  sendContactEmailMock.mockReset();
});

describe("POST /api/contact", () => {
  it("drops a tripped honeypot with 200 and never inserts", async () => {
    const { POST } = await import("@/app/api/contact/route");

    const res = await POST(contactRequest({ company: "bots-r-us" }));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(fromMock).not.toHaveBeenCalled();
    expect(sendContactEmailMock).not.toHaveBeenCalled();
  });

  it("400s a schema violation, not the honeypot drop path", async () => {
    // A filled honeypot that were `z.string().max(0)` would 400 here instead
    // of reaching the 200-and-drop branch — this is the exact bug the brief
    // calls out as already found and fixed once. Assert the real failure
    // mode (too-short message) still 400s, distinct from the honeypot case.
    const { POST } = await import("@/app/api/contact/route");

    const res = await POST(contactRequest({ message: "short" }));

    expect(res.status).toBe(400);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("rate limits at the IP cap without inserting", async () => {
    const { POST } = await import("@/app/api/contact/route");

    fromMock.mockReturnValueOnce(makeBuilder({ count: 5 })); // ip cap query

    const res = await POST(contactRequest());

    expect(res.status).toBe(429);
    await expect(res.json()).resolves.toEqual({ error: "rate_limited" });
    expect(sendContactEmailMock).not.toHaveBeenCalled();
  });

  it("500s and never emails when the insert fails", async () => {
    const { POST } = await import("@/app/api/contact/route");

    fromMock
      .mockReturnValueOnce(makeBuilder({ count: 0 })) // ip cap
      .mockReturnValueOnce(makeBuilder({ data: null, error: { message: "boom" } })); // insert

    const res = await POST(contactRequest());

    expect(res.status).toBe(500);
    expect(sendContactEmailMock).not.toHaveBeenCalled();
  });

  it("stores the message, emails the owner, and returns 200 on success", async () => {
    const { POST } = await import("@/app/api/contact/route");

    fromMock
      .mockReturnValueOnce(makeBuilder({ count: 0 })) // ip cap
      .mockReturnValueOnce(makeBuilder({ data: { id: "row-1" }, error: null })); // insert
    sendContactEmailMock.mockResolvedValueOnce(undefined);

    const res = await POST(contactRequest());

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(sendContactEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: "row-1", email: "ada@example.com" }),
    );
  });
});
