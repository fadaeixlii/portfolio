import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { locales, type Locale } from "@/lib/i18n/routing";

export const dynamic = "force-dynamic";

/**
 * The unsubscribe link in every free-PDF email. Marks every row of that
 * address (one address, one list, however many PDFs it asked for), keeping
 * the first unsubscribe time, then lands on the confirmation page in the
 * language the address asked in. An unknown token lands there too: it may be
 * an address already removed on request.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!/^[0-9a-f]{64}$/.test(token)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let rows: { locale: string }[];
  try {
    rows = await sql<{ locale: string }[]>`
      with lead as (select email, locale from shop_leads where unsubscribe_token = ${token})
      update shop_leads set unsubscribed_at = coalesce(shop_leads.unsubscribed_at, now())
      from lead where shop_leads.email = lead.email
      returning lead.locale
    `;
  } catch (error) {
    // Never claim they are off the list when they are not.
    console.error("shop unsubscribe failed", error);
    return new Response("Could not unsubscribe just now. Open the link again in a minute.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const locale = locales.includes(rows[0]?.locale as Locale) ? rows[0].locale : "en";
  // Relative on purpose: behind Caddy and Cloudflare the request's own URL
  // names the container, not fadaeixlii.dev.
  return new Response(null, { status: 303, headers: { Location: `/${locale}/unsubscribed` } });
}
