import { sql } from "@/lib/db";
import { isSignedIn } from "@/lib/auth";
import { unsubscribeUrl } from "@/lib/email/shop";

export const dynamic = "force-dynamic";

type Lead = {
  email: string;
  product_id: string;
  locale: string;
  created_at: string;
  unsubscribed_at: string | null;
  unsubscribe_token: string;
};

/** Every cell quoted; a leading = + - @ gets a ' so a spreadsheet never runs
 *  a visitor-typed address as a formula. */
const cell = (value: string) => `"${(/^[=+\-@]/.test(value) ? `'${value}` : value).replace(/"/g, '""')}"`;

/**
 * The free-PDF list for the owner, as a download from /admin. Route handlers
 * sit outside admin/layout.tsx's guard, so this checks the session itself,
 * and takes the layout's single exit for anyone signed out.
 */
export async function GET() {
  if (!(await isSignedIn())) {
    return new Response(null, { status: 307, headers: { Location: "/auth/login" } });
  }

  const rows = await sql<Lead[]>`
    select email, product_id, locale, created_at, unsubscribed_at, unsubscribe_token
    from shop_leads
    order by created_at
  `;
  const lines = [
    ["email", "product", "locale", "created_at", "unsubscribed_at", "unsubscribe_url"],
    ...rows.map((r) => [
      r.email,
      r.product_id,
      r.locale,
      String(r.created_at),
      r.unsubscribed_at ? String(r.unsubscribed_at) : "",
      unsubscribeUrl(r.unsubscribe_token),
    ]),
  ];

  return new Response(lines.map((line) => line.map(cell).join(",")).join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="leads.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}
