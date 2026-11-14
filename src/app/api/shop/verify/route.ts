import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { sql, isUniqueViolation } from "@/lib/db";
import { clientIp } from "@/lib/http/client-ip";
import { SHOP_CHAINS, SHOP_RULES, type Chain, type Token } from "@/content/shop";
import { verifyPayment } from "@/lib/shop/chain";
import { normalizeEthHash } from "@/lib/shop/evm";
import { normalizeTronHash } from "@/lib/shop/tron";
import { sendShopSaleEmail } from "@/lib/email/shop";

export const dynamic = "force-dynamic";

const verifySchema = z.object({
  orderId: z.uuid(),
  txHash: z.string().max(100),
});

type OrderRow = {
  id: string;
  product_id: string;
  chain: Chain;
  token: Token;
  amount: string;
  created_at: string;
  status: "pending" | "paid";
};

// ponytail: any amount >= price on the right token to the wallet is accepted,
// so someone watching the wallet could paste a stranger's fresh hash before
// its owner does. Acceptable for a 5 EUR item; the upgrade path is a unique
// per-order amount (price + a few base units) or a message signed by the
// paying address.
export async function POST(request: Request) {
  const json: unknown = await request.json().catch(() => null);
  const parsed = verifySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const input = parsed.data;
  const ip = clientIp(request);
  const since = new Date(Date.now() - 86_400_000).toISOString();

  // Every attempt counts, failed ones included — each can cost three calls
  // to a public node. Fails closed like the contact limiter.
  try {
    const [{ count }] = await sql<{ count: string }[]>`
      select count(*)::int as count from shop_verify_attempts
      where ip = ${ip} and created_at >= ${since}
    `;
    if (Number(count) >= SHOP_RULES.maxVerifiesPerIpPerDay) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    await sql`insert into shop_verify_attempts ${sql({ ip })}`;
  } catch (error) {
    console.error("shop verify rate limit check failed", error);
    return NextResponse.json({ error: "server" }, { status: 503 });
  }

  let order: OrderRow | undefined;
  try {
    [order] = await sql<OrderRow[]>`
      select id, product_id, chain, token, amount, created_at, status
      from shop_orders where id = ${input.orderId}
    `;
  } catch (error) {
    console.error("shop order load failed", error);
    return NextResponse.json({ error: "server" }, { status: 503 });
  }
  if (!order) {
    return NextResponse.json({ error: "order_not_found" }, { status: 404 });
  }
  if (order.status !== "pending") {
    return NextResponse.json({ error: "already_used" }, { status: 409 });
  }

  const txHash =
    order.chain === "eth" ? normalizeEthHash(input.txHash) : normalizeTronHash(input.txHash);
  if (!txHash) {
    return NextResponse.json({ error: "invalid_hash" }, { status: 400 });
  }

  let verdict: Awaited<ReturnType<typeof verifyPayment>>;
  try {
    verdict = await verifyPayment(
      { chain: order.chain, token: order.token, amount: order.amount, createdAt: order.created_at },
      txHash,
    );
  } catch (error) {
    console.error("shop chain lookup failed", order.id, error);
    return NextResponse.json({ error: "rpc_error" }, { status: 502 });
  }
  if ("code" in verdict) {
    return NextResponse.json({ error: verdict.code }, { status: 422 });
  }

  // Only the hash is stored: a database leak hands out no working links.
  const downloadToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(downloadToken).digest("hex");

  // The unique (chain, tx_hash) index is the real one-hash-one-order guard;
  // `status = 'pending'` stops a double submit paying the same order twice.
  let paid: { id: string } | undefined;
  try {
    [paid] = await sql<{ id: string }[]>`
      update shop_orders
      set status = 'paid', tx_hash = ${txHash}, download_token_hash = ${tokenHash},
          paid_at = now()
      where id = ${order.id} and status = 'pending'
      returning id
    `;
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json({ error: "already_used" }, { status: 409 });
    }
    console.error("shop order mark paid failed", order.id, error);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
  if (!paid) {
    return NextResponse.json({ error: "already_used" }, { status: 409 });
  }

  const decimals = SHOP_CHAINS[order.chain].tokens[order.token]?.decimals ?? 6;
  // Never throws — the sale is recorded and the buyer gets the link regardless.
  await sendShopSaleEmail({
    orderId: order.id,
    productId: order.product_id,
    chain: order.chain,
    token: order.token,
    amount: String(Number(verdict.amount) / 10 ** decimals),
    txHash,
  });

  return NextResponse.json({ downloadUrl: `/api/shop/download/${downloadToken}` });
}
