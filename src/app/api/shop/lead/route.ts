import { NextResponse, after } from "next/server";
import { sql } from "@/lib/db";
import { sendFreePdfEmail, sendShopAlertEmail } from "@/lib/email/shop";
import { dailyVisitor } from "@/lib/shop/visitor";
import { leadSchema } from "@/lib/validation/lead";
import { SHOP_RULES } from "@/content/shop";

export const dynamic = "force-dynamic";

type Lead = { id: string; unsubscribe_token: string; send: boolean; fresh: boolean };

/**
 * A free product's PDF by email, from the form on its page. Puts the address
 * on the list, emails the PDF at most once per address and product per
 * SHOP_RULES.leadResendMinutes, and answers the same `{ ok: true }` whether
 * the address was new, already listed or inside that window, so the form
 * cannot be used to learn who is on the list.
 */
export async function POST(request: Request) {
  const json: unknown = await request.json().catch(() => null);
  const parsed = leadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const { email, productId, locale } = parsed.data;
  const visitor = dailyVisitor(request);
  const windowStart = new Date(Date.now() - SHOP_RULES.leadResendMinutes * 60_000).toISOString();

  let lead: Lead;
  let alert: boolean;
  // Fails closed, like the order route: with no database there is no limit,
  // so nothing is sent and the form shows its error.
  try {
    const [seen] = await sql<{ mine: number; emailed: number }[]>`
      select
        (select count(*)::int from shop_events
          where visitor = ${visitor} and kind = 'signup'
            and created_at > now() - interval '24 hours') as mine,
        (select count(*)::int from shop_events
          where emailed and created_at > now() - interval '24 hours') as emailed
    `;
    if (seen.mine >= SHOP_RULES.maxLeadsPerVisitorPerDay) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }

    // Asking again is joining again: an address is on the list or off it,
    // for every product at once.
    await sql`
      update shop_leads set unsubscribed_at = null
      where email = ${email} and unsubscribed_at is not null
    `;
    // The resend window is decided here, in one statement, so two requests
    // in the same second cannot both send. `now()` is fixed for the
    // statement: `last_sent_at = now()` means this request claimed the send.
    // `xmax = 0` is true only for a row this statement inserted.
    [lead] = await sql<Lead[]>`
      insert into shop_leads (email, product_id, locale, last_sent_at)
      values (${email}, ${productId}, ${locale}, now())
      on conflict (email, product_id) do update set
        locale = excluded.locale,
        last_sent_at = case
          when shop_leads.last_sent_at is null or shop_leads.last_sent_at < ${windowStart} then now()
          else shop_leads.last_sent_at
        end
      returning id, unsubscribe_token, last_sent_at = now() as send, xmax = 0 as fresh
    `;
    alert = lead.fresh && seen.emailed < SHOP_RULES.maxAlertEmailsPerDay;
    await sql`
      insert into shop_events ${sql({ kind: "signup", product_id: productId, visitor, locale, emailed: alert })}
    `;
  } catch (error) {
    console.error("shop lead failed", error);
    return NextResponse.json({ error: "server" }, { status: 503 });
  }

  // Never throws, and runs after the visitor has the answer.
  if (alert) after(() => sendShopAlertEmail({ kind: "signup", productId }));

  if (lead.send) {
    try {
      await sendFreePdfEmail({ to: email, productId, locale, unsubscribeToken: lead.unsubscribe_token });
    } catch (error) {
      console.error("free pdf email failed", productId, error);
      // The email never left, so free the window: a retry may send at once.
      await sql`update shop_leads set last_sent_at = null where id = ${lead.id}`.catch(() => {});
      return NextResponse.json({ error: "server" }, { status: 502 });
    }
  }

  return NextResponse.json({ ok: true });
}
