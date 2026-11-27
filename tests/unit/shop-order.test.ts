import { describe, it, expect, vi, beforeEach } from "vitest";

// /api/shop/order with free and paid products in one SHOP_PRODUCTS: a free
// PDF never gets an order (and never touches the database); a paid product
// is still priced exactly as before.

vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: () => {},
}));
vi.mock("@/lib/email/shop", () => ({ sendShopAlertEmail: () => {} }));

const queries: string[] = [];
let results: unknown[] = [];

vi.mock("@/lib/db", () => {
  const sql = (strings: TemplateStringsArray | Record<string, unknown>) => {
    if (!Array.isArray((strings as TemplateStringsArray).raw)) return { __columns: strings };
    queries.push((strings as TemplateStringsArray).join("?"));
    return Promise.resolve(results.shift() ?? []);
  };
  return { sql };
});

const order = (productId: string) =>
  new Request("http://localhost/api/shop/order", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.5" },
    body: JSON.stringify({ productId, chain: "eth", token: "USDT" }),
  });

describe("POST /api/shop/order", () => {
  beforeEach(() => {
    queries.length = 0;
    results = [];
  });

  it("refuses a free product before any query", async () => {
    const { POST } = await import("@/app/api/shop/order/route");
    const res = await POST(order("motion-tips"));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid" });
    expect(queries).toHaveLength(0);
  });

  it("still prices a paid product from its entry", async () => {
    results = [[{ count: 0 }], [{ id: "order-1" }]];
    const { POST } = await import("@/app/api/shop/order/route");
    const res = await POST(order("one-folder-studio"));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ orderId: "order-1", amount: "12", token: "USDT", chain: "eth" });
  });
});
