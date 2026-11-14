import "server-only";
import { sendResendEmail, escapeHtml } from "@/lib/email/resend";

export type ShopSaleEmailInput = {
  orderId: string;
  productId: string;
  chain: "eth" | "tron";
  token: string;
  /** Human units, as received on chain. */
  amount: string;
  txHash: string;
};

const EXPLORER = {
  eth: "https://etherscan.io/tx/",
  tron: "https://tronscan.org/#/transaction/",
};

/**
 * Tells the owner a sale went through. Never throws: the order is already
 * marked paid and the buyer already has the link, so a Resend failure is
 * logged, not surfaced.
 */
export async function sendShopSaleEmail(input: ShopSaleEmailInput): Promise<void> {
  try {
    const to = process.env.CONTACT_TO_EMAIL;
    if (!to) return;

    const from = process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>";
    const rows = [
      ["Product", input.productId],
      ["Chain", input.chain],
      ["Token", input.token],
      ["Amount", input.amount],
      ["Tx hash", input.txHash],
      ["Order", input.orderId],
    ]
      .map(([label, value]) => `<li>${label}: ${escapeHtml(value)}</li>`)
      .join("");
    const link = escapeHtml(`${EXPLORER[input.chain]}${input.txHash}`);

    await sendResendEmail({
      from,
      to,
      subject: `Shop sale: ${escapeHtml(input.productId)} (${input.amount} ${escapeHtml(input.token)})`,
      html: `<ul>${rows}</ul><p><a href="${link}">${link}</a></p>`,
    });
  } catch (error) {
    console.error("shop sale email failed", input.orderId, error);
  }
}
