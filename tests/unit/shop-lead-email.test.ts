import { describe, it, expect, vi, beforeEach } from "vitest";

// The email a free-PDF request sends, built from the product entry and the
// visitor's language: the PDF attached from private/shop, an unsubscribe link
// in the body and in List-Unsubscribe. Resend and the file system are mocked.

const sent: Record<string, unknown>[] = [];
vi.mock("@/lib/email/resend", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/email/resend")>()),
  sendResendEmail: async (payload: Record<string, unknown>) => {
    sent.push(payload);
  },
}));

const readFile = vi.fn();
vi.mock("node:fs/promises", () => ({ readFile: (...args: unknown[]) => readFile(...args) }));

vi.mock("@/lib/db", () => ({
  sql: () => Promise.resolve([{ visitors: 0, whatsapp: 0, leads: 1, orders: 0, paid: 0 }]),
}));

const TOKEN = "ab".repeat(32);
const PDF = Buffer.from("%PDF-1.7 fake");

beforeEach(() => {
  sent.length = 0;
  readFile.mockReset();
  readFile.mockResolvedValue(PDF);
  process.env.CONTACT_FROM_EMAIL = "Mohammad <hello@fadaeixlii.dev>";
  process.env.SHOP_NOTIFY_EMAIL = "owner@example.com";
});

describe("sendFreePdfEmail", () => {
  it("attaches the private PDF and links the unsubscribe page, in the visitor's language", async () => {
    const { sendFreePdfEmail } = await import("@/lib/email/shop");
    await sendFreePdfEmail({ to: "ada@example.com", productId: "motion-tips", locale: "de", unsubscribeToken: TOKEN });

    const path = String(readFile.mock.calls[0][0]).replace(/\\/g, "/");
    expect(path).toMatch(/\/private\/shop\/4-motion-tips\.pdf$/);

    const [mail] = sent;
    const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://fadaeixlii.dev"}/api/shop/unsubscribe/${TOKEN}`;
    expect(mail).toMatchObject({
      from: "Mohammad <hello@fadaeixlii.dev>",
      to: "ada@example.com",
      attachments: [{ filename: "4-motion-tips.pdf", content: PDF.toString("base64") }],
      headers: { "List-Unsubscribe": `<${url}>` },
    });
    expect(mail.subject).toContain("4 Motion Tips for Claude Videos");
    expect(mail.subject).not.toBe("Your free PDF: 4 Motion Tips for Claude Videos");
    expect(mail.html).toContain(`href="${url}"`);
    expect(mail.text).toContain(url);
    expect(mail.html).toContain('dir="ltr"');
  });

  it("writes Farsi right to left", async () => {
    const { sendFreePdfEmail } = await import("@/lib/email/shop");
    await sendFreePdfEmail({ to: "ada@example.com", productId: "motion-tips", locale: "fa", unsubscribeToken: TOKEN });
    expect(sent[0].html).toContain('dir="rtl"');
  });

  it("throws when the PDF is missing, so the route can say so", async () => {
    readFile.mockRejectedValueOnce(Object.assign(new Error("ENOENT"), { code: "ENOENT" }));
    const { sendFreePdfEmail } = await import("@/lib/email/shop");
    await expect(
      sendFreePdfEmail({ to: "ada@example.com", productId: "motion-tips", locale: "en", unsubscribeToken: TOKEN }),
    ).rejects.toThrow("ENOENT");
    expect(sent).toHaveLength(0);
  });
});

describe("sendShopAlertEmail signup", () => {
  it("tells the owner a new address asked, without naming it", async () => {
    const { sendShopAlertEmail } = await import("@/lib/email/shop");
    await sendShopAlertEmail({ kind: "signup", productId: "motion-tips" });
    const [mail] = sent;
    expect(mail.to).toBe("owner@example.com");
    expect(mail.subject).toBe("4 Motion Tips for Claude Videos: someone asked for the free PDF");
    expect(mail.html).toContain("New emails for the free PDF: 1");
  });
});
