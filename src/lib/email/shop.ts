import "server-only";
import { sql } from "@/lib/db";
import { sendResendEmail, escapeHtml } from "@/lib/email/resend";
import { SHOP_PRODUCTS, type ProductId } from "@/content/shop";

export type ShopSaleEmailInput = {
  orderId: string;
  productId: string;
  chain: "eth" | "tron";
  token: string;
  /** Human units, as received on chain. */
  amount: string;
  txHash: string;
};

export type ShopAlert =
  | { kind: "visit"; productId: ProductId; referrer: string | null; locale: string | null }
  | { kind: "whatsapp"; productId: ProductId }
  | { kind: "order"; productId: ProductId; chain: "eth" | "tron"; token: string; amount: string };

const EXPLORER = {
  eth: "https://etherscan.io/tx/",
  tron: "https://tronscan.org/#/transaction/",
};

const CHAIN_NAME = { eth: "Ethereum", tron: "Tron" };

/** Shop alerts may go to their own inbox; otherwise the contact inbox. */
function ownerEmail(): string | undefined {
  return process.env.SHOP_NOTIFY_EMAIL || process.env.CONTACT_TO_EMAIL;
}

function fromEmail(): string {
  return process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>";
}

function productName(productId: string): string {
  return SHOP_PRODUCTS[productId as ProductId]?.name ?? productId;
}

/** The last 24 hours on one product, for the footer of every shop email. */
async function last24h(productId: string): Promise<string> {
  try {
    const [row] = await sql<{ visitors: number; whatsapp: number; orders: number; paid: number }[]>`
      select
        (select count(distinct visitor)::int from shop_events
          where kind = 'visit' and product_id = ${productId}
            and created_at > now() - interval '24 hours') as visitors,
        (select count(*)::int from shop_events
          where kind = 'whatsapp' and product_id = ${productId}
            and created_at > now() - interval '24 hours') as whatsapp,
        (select count(*)::int from shop_orders
          where product_id = ${productId}
            and created_at > now() - interval '24 hours') as orders,
        (select count(*)::int from shop_orders
          where product_id = ${productId} and status = 'paid'
            and paid_at > now() - interval '24 hours') as paid
    `;
    return (
      `<p>Last 24 hours on ${escapeHtml(productName(productId))}:</p><ul>` +
      `<li>Visitors: ${row.visitors}</li>` +
      `<li>WhatsApp taps: ${row.whatsapp}</li>` +
      `<li>Crypto orders started: ${row.orders}</li>` +
      `<li>Paid: ${row.paid}</li></ul>`
    );
  } catch (error) {
    console.error("shop totals failed", error);
    return "";
  }
}

/**
 * Tells the owner someone opened a shop page, tapped WhatsApp or started a
 * crypto order. Never throws: it runs after the response, and a lost alert
 * must not break the page or the checkout.
 */
export async function sendShopAlertEmail(alert: ShopAlert): Promise<void> {
  try {
    const to = ownerEmail();
    if (!to) return;

    const name = productName(alert.productId);
    let subject: string;
    let body: string;
    if (alert.kind === "visit") {
      subject = `${name}: someone opened the page`;
      body =
        `<ul><li>Came from: ${escapeHtml(alert.referrer ?? "direct or the Instagram app")}</li>` +
        `<li>Page language: ${escapeHtml(alert.locale ?? "unknown")}</li></ul>`;
    } else if (alert.kind === "whatsapp") {
      subject = `${name}: someone tapped WhatsApp`;
      body = "<p>They may message you on WhatsApp in a moment.</p>";
    } else {
      subject = `${name}: crypto order started (${alert.amount} ${alert.token} on ${CHAIN_NAME[alert.chain]})`;
      body = "<p>They have the wallet address now. Another email comes if the payment is verified.</p>";
    }

    await sendResendEmail({
      from: fromEmail(),
      to,
      subject: escapeHtml(subject),
      html: body + (await last24h(alert.productId)),
    });
  } catch (error) {
    console.error("shop alert email failed", alert.kind, error);
  }
}

/**
 * Tells the owner a sale went through. Never throws: the order is already
 * marked paid and the buyer already has the link, so a Resend failure is
 * logged, not surfaced.
 */
export async function sendShopSaleEmail(input: ShopSaleEmailInput): Promise<void> {
  try {
    const to = ownerEmail();
    if (!to) return;

    const rows = [
      ["Product", productName(input.productId)],
      ["Chain", CHAIN_NAME[input.chain]],
      ["Token", input.token],
      ["Amount", input.amount],
      ["Tx hash", input.txHash],
      ["Order", input.orderId],
    ]
      .map(([label, value]) => `<li>${label}: ${escapeHtml(value)}</li>`)
      .join("");
    const link = escapeHtml(`${EXPLORER[input.chain]}${input.txHash}`);

    await sendResendEmail({
      from: fromEmail(),
      to,
      subject: `Sold: ${escapeHtml(productName(input.productId))} (${input.amount} ${escapeHtml(input.token)})`,
      html: `<ul>${rows}</ul><p><a href="${link}">${link}</a></p>` + (await last24h(input.productId)),
    });
  } catch (error) {
    console.error("shop sale email failed", input.orderId, error);
  }
}
