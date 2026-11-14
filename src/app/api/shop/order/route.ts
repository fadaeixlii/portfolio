import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { clientIp } from "@/lib/http/client-ip";
import { SHOP_CHAINS, SHOP_PRODUCTS, SHOP_RULES, type ProductId } from "@/content/shop";

export const dynamic = "force-dynamic";

const orderSchema = z.object({
  productId: z.enum(Object.keys(SHOP_PRODUCTS) as [ProductId, ...ProductId[]]),
  chain: z.enum(["eth", "tron"]),
  token: z.enum(["USDT", "USDC"]),
});

export async function POST(request: Request) {
  const json: unknown = await request.json().catch(() => null);
  const parsed = orderSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const input = parsed.data;
  const chain = SHOP_CHAINS[input.chain];
  const token = chain.tokens[input.token];
  if (!token) {
    // USDC on Tron, and anything else the config does not list.
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const ip = clientIp(request);
  const since = new Date(Date.now() - 86_400_000).toISOString();

  // Fails closed: a failed count must never read as "zero orders".
  try {
    const [{ count }] = await sql<{ count: string }[]>`
      select count(*)::int as count from shop_orders
      where ip = ${ip} and created_at >= ${since}
    `;
    if (Number(count) >= SHOP_RULES.maxOrdersPerIpPerDay) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
  } catch (error) {
    console.error("shop order rate limit check failed", error);
    return NextResponse.json({ error: "server" }, { status: 503 });
  }

  const priceUsd = SHOP_PRODUCTS[input.productId].priceUsd;
  const amount = Math.round(priceUsd * 10 ** token.decimals);

  let row: { id: string };
  try {
    [row] = await sql<{ id: string }[]>`
      insert into shop_orders ${sql({
        product_id: input.productId,
        chain: input.chain,
        token: input.token,
        amount,
        address: chain.wallet,
        ip,
      })}
      returning id
    `;
  } catch (error) {
    console.error("shop order insert failed", error);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }

  return NextResponse.json({
    orderId: row.id,
    address: chain.wallet,
    amount: String(amount / 10 ** token.decimals),
    token: input.token,
    chain: input.chain,
  });
}
