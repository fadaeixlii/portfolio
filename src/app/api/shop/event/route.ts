import { after } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { sendShopAlertEmail } from "@/lib/email/shop";
import { isBot } from "@/lib/shop/bot";
import { dailyVisitor } from "@/lib/shop/visitor";
import { SHOP_PRODUCTS, SHOP_RULES, type ProductId } from "@/content/shop";

export const dynamic = "force-dynamic";

const eventSchema = z.object({
  kind: z.enum(["visit", "whatsapp"]),
  productId: z.enum(Object.keys(SHOP_PRODUCTS) as [ProductId, ...ProductId[]]),
  referrer: z
    .string()
    .max(100)
    .regex(/^[a-z0-9.-]*$/i)
    .optional(),
  locale: z
    .string()
    .regex(/^[a-z]{2}$/)
    .optional(),
});

/**
 * Counts a visit to a shop page or a tap on its WhatsApp button (a
 * sendBeacon from the page) and emails the owner on the first of each kind
 * per visitor per day, up to a daily cap that keeps Resend's free quota for
 * sale emails. Always answers 204: the beacon never reads the response.
 */
export async function POST(request: Request) {
  const ok = new Response(null, { status: 204 });
  if (isBot(request.headers.get("user-agent"))) return ok;

  // sendBeacon posts a text/plain string, so parse by hand.
  let json: unknown = null;
  try {
    json = JSON.parse(await request.text());
  } catch {
    return ok;
  }
  const parsed = eventSchema.safeParse(json);
  if (!parsed.success) return ok;
  const input = parsed.data;

  const visitor = dailyVisitor(request);

  after(async () => {
    try {
      const [seen] = await sql<{ rows: number; same: number; emailed: number }[]>`
        select
          (select count(*)::int from shop_events
            where visitor = ${visitor} and created_at > now() - interval '24 hours') as rows,
          (select count(*)::int from shop_events
            where visitor = ${visitor} and kind = ${input.kind}
              and created_at > now() - interval '24 hours') as same,
          (select count(*)::int from shop_events
            where emailed and created_at > now() - interval '24 hours') as emailed
      `;
      // One person reloading all day must not grow the table without end.
      if (seen.rows >= SHOP_RULES.maxEventsPerVisitorPerDay) return;

      const email = seen.same === 0 && seen.emailed < SHOP_RULES.maxAlertEmailsPerDay;
      await sql`
        insert into shop_events ${sql({
          kind: input.kind,
          product_id: input.productId,
          visitor,
          referrer: input.referrer || null,
          locale: input.locale ?? null,
          emailed: email,
        })}
      `;
      if (!email) return;

      await sendShopAlertEmail(
        input.kind === "visit"
          ? { kind: "visit", productId: input.productId, referrer: input.referrer || null, locale: input.locale ?? null }
          : { kind: input.kind, productId: input.productId },
      );
    } catch (error) {
      console.error("shop event failed", input.kind, error);
    }
  });

  return ok;
}
