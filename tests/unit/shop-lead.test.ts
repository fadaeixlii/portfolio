import { describe, it, expect, vi, beforeEach } from "vitest";

// The free-PDF email flow on a mocked database: POST /api/shop/lead (validate,
// limit per visitor, store, send once per window, alert the owner under the
// daily cap), the unsubscribe link, and the owner's CSV export. No network,
// no real Resend call.

const afterFns: (() => unknown)[] = [];
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: (fn: () => unknown) => afterFns.push(fn),
}));

const sendFreePdfEmail = vi.fn();
const sendShopAlertEmail = vi.fn();
vi.mock("@/lib/email/shop", () => ({
  sendFreePdfEmail: (...args: unknown[]) => sendFreePdfEmail(...args),
  sendShopAlertEmail: (...args: unknown[]) => sendShopAlertEmail(...args),
  unsubscribeUrl: (token: string) => `https://fadaeixlii.dev/api/shop/unsubscribe/${token}`,
}));

const isSignedIn = vi.fn();
vi.mock("@/lib/auth", () => ({ isSignedIn: () => isSignedIn() }));

/** Every `sql`...`` call: its joined text and its interpolated values. */
const queries: { text: string; values: unknown[] }[] = [];
/** Queued results, one per `sql` call. An Error rejects instead. */
let results: unknown[] = [];

vi.mock("@/lib/db", () => {
  const sql = (strings: TemplateStringsArray | Record<string, unknown>, ...values: unknown[]) => {
    if (!Array.isArray((strings as TemplateStringsArray).raw)) return { __columns: strings };
    queries.push({ text: (strings as TemplateStringsArray).join("?").replace(/\s+/g, " ").trim(), values });
    const next = results.shift();
    return next instanceof Error ? Promise.reject(next) : Promise.resolve(next ?? []);
  };
  return { sql };
});

const TOKEN = "ab".repeat(32);

const lead = (body: Record<string, unknown> = {}) =>
  new Request("http://localhost/api/shop/lead", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.5" },
    body: JSON.stringify({ productId: "motion-tips", email: "ada@example.com", locale: "en", ...body }),
  });

const find = (needle: string) => queries.find((q) => q.text.includes(needle));

beforeEach(() => {
  queries.length = 0;
  results = [];
  afterFns.length = 0;
  sendFreePdfEmail.mockReset();
  sendShopAlertEmail.mockReset();
  isSignedIn.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/shop/lead", () => {
  it("400s a bad address or a paid product before any query", async () => {
    const { POST } = await import("@/app/api/shop/lead/route");
    for (const body of [{ email: "not-an-email" }, { email: "" }, { productId: "ink-motion" }, { locale: "xx" }]) {
      const res = await POST(lead(body));
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: "invalid" });
    }
    expect(queries).toHaveLength(0);
  });

  it("503s and sends nothing when the database is unreachable", async () => {
    const { POST } = await import("@/app/api/shop/lead/route");
    results = [new Error("DATABASE_URL is not set")];
    const res = await POST(lead());
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "server" });
    expect(sendFreePdfEmail).not.toHaveBeenCalled();
    expect(afterFns).toHaveLength(0);
  });

  it("429s at the per-visitor cap without storing or sending", async () => {
    const { POST } = await import("@/app/api/shop/lead/route");
    results = [[{ mine: 5, emailed: 0 }]];
    const res = await POST(lead());
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: "rate_limited" });
    expect(find("insert into shop_leads")).toBeUndefined();
    expect(sendFreePdfEmail).not.toHaveBeenCalled();
  });

  it("stores a new address trimmed and lowercased, emails the PDF and alerts the owner", async () => {
    const { POST } = await import("@/app/api/shop/lead/route");
    results = [[{ mine: 0, emailed: 0 }], [], [{ id: "lead-1", unsubscribe_token: TOKEN, send: true, fresh: true }], []];
    const res = await POST(lead({ email: "  Ada@Example.COM ", locale: "de" }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(find("insert into shop_leads")!.values).toEqual(expect.arrayContaining(["ada@example.com", "motion-tips", "de"]));
    // Asking again is joining again, for every product of that address.
    expect(find("update shop_leads set unsubscribed_at = null")!.values).toContain("ada@example.com");
    expect(sendFreePdfEmail).toHaveBeenCalledWith({
      to: "ada@example.com",
      productId: "motion-tips",
      locale: "de",
      unsubscribeToken: TOKEN,
    });
    const event = find("insert into shop_events")!.values[0] as { __columns: Record<string, unknown> };
    expect(event.__columns).toMatchObject({ kind: "signup", product_id: "motion-tips", emailed: true });
    expect(JSON.stringify(event)).not.toContain("203.0.113.5");

    for (const fn of afterFns) await fn();
    expect(sendShopAlertEmail).toHaveBeenCalledWith({ kind: "signup", productId: "motion-tips" });
  });

  it("accepts the second free product, ai-video-editor, and sends its PDF", async () => {
    const { POST } = await import("@/app/api/shop/lead/route");
    results = [[{ mine: 0, emailed: 0 }], [], [{ id: "lead-2", unsubscribe_token: TOKEN, send: true, fresh: true }], []];
    const res = await POST(lead({ productId: "ai-video-editor" }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(find("insert into shop_leads")!.values).toContain("ai-video-editor");
    expect(sendFreePdfEmail).toHaveBeenCalledWith(expect.objectContaining({ productId: "ai-video-editor" }));
  });

  it("answers an address already on the list the same way, with no second email inside the window", async () => {
    const { POST } = await import("@/app/api/shop/lead/route");
    results = [[{ mine: 1, emailed: 0 }], [], [{ id: "lead-1", unsubscribe_token: TOKEN, send: false, fresh: false }], []];
    const res = await POST(lead());

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(sendFreePdfEmail).not.toHaveBeenCalled();
    expect(afterFns).toHaveLength(0);
    // The window is decided in the upsert itself, so two requests at once cannot both send.
    expect(find("insert into shop_leads")!.text).toMatch(/on conflict \(email, product_id\) do update/);
    expect(find("insert into shop_leads")!.text).toMatch(/last_sent_at < \?/);
  });

  it("sends no owner alert once the daily alert cap is spent", async () => {
    const { POST } = await import("@/app/api/shop/lead/route");
    results = [[{ mine: 0, emailed: 50 }], [], [{ id: "lead-1", unsubscribe_token: TOKEN, send: true, fresh: true }], []];
    const res = await POST(lead());

    expect(res.status).toBe(200);
    expect(sendFreePdfEmail).toHaveBeenCalledOnce();
    expect(afterFns).toHaveLength(0);
    const event = find("insert into shop_events")!.values[0] as { __columns: Record<string, unknown> };
    expect(event.__columns.emailed).toBe(false);
  });

  it("frees the window and answers 502 when the email does not go out", async () => {
    const { POST } = await import("@/app/api/shop/lead/route");
    results = [[{ mine: 0, emailed: 0 }], [], [{ id: "lead-1", unsubscribe_token: TOKEN, send: true, fresh: true }], [], []];
    sendFreePdfEmail.mockRejectedValueOnce(new Error("resend send failed: 500"));
    const res = await POST(lead());

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "server" });
    expect(find("set last_sent_at = null")!.values).toContain("lead-1");
  });
});

describe("GET /api/shop/unsubscribe/[token]", () => {
  const get = async (token: string) => {
    const { GET } = await import("@/app/api/shop/unsubscribe/[token]/route");
    return GET(new Request(`http://localhost/api/shop/unsubscribe/${token}`), { params: Promise.resolve({ token }) });
  };

  it("404s a malformed token before any query", async () => {
    const res = await get("not-a-token");
    expect(res.status).toBe(404);
    expect(queries).toHaveLength(0);
  });

  it("marks every row of that address and lands on the page in its language", async () => {
    results = [[{ locale: "fa" }, { locale: "fa" }]];
    const res = await get(TOKEN);
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("/fa/unsubscribed");
    expect(queries[0].text).toMatch(/update shop_leads set unsubscribed_at/);
    expect(queries[0].text).toMatch(/shop_leads.email = lead.email/);
    expect(queries[0].values).toContain(TOKEN);
  });

  it("lands on the English page for a token it does not know", async () => {
    results = [[]];
    const res = await get(TOKEN);
    expect(res.headers.get("location")).toBe("/en/unsubscribed");
  });

  it("503s when the database is unreachable, so nobody is told they are off the list when they are not", async () => {
    results = [new Error("connection reset")];
    const res = await get(TOKEN);
    expect(res.status).toBe(503);
  });
});

describe("GET /admin/leads.csv", () => {
  const get = async () => {
    const { GET } = await import("@/app/admin/leads.csv/route");
    return GET();
  };

  it("sends a signed-out visitor to the login page without reading the list", async () => {
    isSignedIn.mockResolvedValueOnce(false);
    const res = await get();
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("/auth/login");
    expect(queries).toHaveLength(0);
  });

  it("gives the owner every row as CSV, quoted, with formulas defused", async () => {
    isSignedIn.mockResolvedValueOnce(true);
    results = [
      [
        { email: "ada@example.com", product_id: "motion-tips", locale: "en", created_at: "2026-11-28 10:00:00+00", unsubscribed_at: null, unsubscribe_token: TOKEN },
        { email: "-2+3@example.com", product_id: "motion-tips", locale: "fa", created_at: "2026-11-28 11:00:00+00", unsubscribed_at: "2026-11-28 12:00:00+00", unsubscribe_token: TOKEN },
      ],
    ];
    const res = await get();
    expect(res.headers.get("content-type")).toBe("text/csv; charset=utf-8");
    expect(res.headers.get("content-disposition")).toContain("attachment");
    expect((await res.text()).split("\r\n")).toEqual([
      '"email","product","locale","created_at","unsubscribed_at","unsubscribe_url"',
      `"ada@example.com","motion-tips","en","2026-11-28 10:00:00+00","","https://fadaeixlii.dev/api/shop/unsubscribe/${TOKEN}"`,
      `"'-2+3@example.com","motion-tips","fa","2026-11-28 11:00:00+00","2026-11-28 12:00:00+00","https://fadaeixlii.dev/api/shop/unsubscribe/${TOKEN}"`,
      "",
    ]);
  });
});
