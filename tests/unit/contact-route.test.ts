import { describe, it, expect, vi, beforeEach } from "vitest";

// Pure branching on a mocked database — no network, no real Resend call.
// Covers: honeypot -> 200 without an insert, rate limit -> 429, a count
// query that errors -> 503 (the limiter must fail closed), and an insert
// failure -> 500. Mirrors tests/unit/book-route.test.ts.

const sendContactEmailMock = vi.fn();

vi.mock("@/lib/email/contact", () => ({
  sendContactEmail: (...args: unknown[]) => sendContactEmailMock(...args),
}));
/** Every `sql`...`` call, in order, as joined query text. */
const queries: string[] = [];
/** Queued results, one per `sql` call. A thrown value rejects instead. */
let results: unknown[] = [];

vi.mock("@/lib/db", () => {
  const sql = (strings: TemplateStringsArray | Record<string, unknown>) => {
    if (!Array.isArray((strings as TemplateStringsArray).raw)) {
      return { __columns: strings };
    }
    queries.push((strings as TemplateStringsArray).join("?").replace(/\s+/g, " ").trim());
    const next = results.shift();
    if (next instanceof Error) return Promise.reject(next);
    return Promise.resolve(next ?? []);
  };
  return { sql, isUniqueViolation: () => false };
});

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
  queries.length = 0;
  results = [];
  sendContactEmailMock.mockReset();
});

describe("POST /api/contact", () => {
  it("drops a tripped honeypot with 200 and never inserts", async () => {
    const { POST } = await import("@/app/api/contact/route");

    const res = await POST(contactRequest({ company: "bots-r-us" }));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(queries).toHaveLength(0);
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
    expect(queries).toHaveLength(0);
  });

  it("rate limits at the IP cap without inserting", async () => {
    const { POST } = await import("@/app/api/contact/route");

    results = [[{ count: 5 }]]; // ip cap query says the cap is reached

    const res = await POST(contactRequest());

    expect(res.status).toBe(429);
    await expect(res.json()).resolves.toEqual({ error: "rate_limited" });
    expect(sendContactEmailMock).not.toHaveBeenCalled();
  });

  it("503s and never emails when the rate-limit count query errors", async () => {
    // A failed count must not read as "zero messages" — that would let the
    // limiter fail open, allowing unlimited submissions. This is the
    // regression case: count comes back null alongside a database error.
    const { POST } = await import("@/app/api/contact/route");

    results = [new Error("connection reset")]; // ip cap query fails

    const res = await POST(contactRequest());

    expect(res.status).toBe(503);
    expect(queries.some((q) => q.includes("insert into"))).toBe(false);
    expect(sendContactEmailMock).not.toHaveBeenCalled();
  });

  it("500s and never emails when the insert fails", async () => {
    const { POST } = await import("@/app/api/contact/route");

    results = [[{ count: 0 }], new Error("boom")]; // ip cap ok, insert fails

    const res = await POST(contactRequest());

    expect(res.status).toBe(500);
    expect(sendContactEmailMock).not.toHaveBeenCalled();
  });

  it("stores the message, emails the owner, and returns 200 on success", async () => {
    const { POST } = await import("@/app/api/contact/route");

    results = [[{ count: 0 }], [{ id: "row-1" }]]; // ip cap ok, insert returns the row
    sendContactEmailMock.mockResolvedValueOnce(undefined);

    const res = await POST(contactRequest());

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(sendContactEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: "row-1", email: "ada@example.com" }),
    );
  });
});
