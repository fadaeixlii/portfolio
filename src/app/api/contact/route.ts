import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation/contact";
import { sql } from "@/lib/db";
import { sendContactEmail } from "@/lib/email/contact";
import { clientIp } from "@/lib/http/client-ip";

export const dynamic = "force-dynamic";

/** Cap per client IP per day. Mirrors SCHEDULE_CONFIG.maxBookingsPerIpPerDay
 *  in spirit — a single rule for a single route doesn't earn its own config
 *  module. */
const MAX_MESSAGES_PER_IP_PER_DAY = 5;

export async function POST(request: Request) {
  const json: unknown = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const input = parsed.data;
  if (input.company) {
    // Honeypot tripped. Answer 200 so a bot learns nothing.
    return NextResponse.json({ ok: true });
  }

  const ip = clientIp(request);
  const since = new Date(Date.now() - 86_400_000).toISOString();

  // A failed count must never read as "zero messages", or the limiter fails
  // open; the throw is caught below and answers 503.
  try {
    const [{ count }] = await sql<{ count: string }[]>`
      select count(*)::int as count from contact_messages
      where ip = ${ip} and created_at >= ${since}
    `;
    if (Number(count) >= MAX_MESSAGES_PER_IP_PER_DAY) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
  } catch (error) {
    console.error("contact rate limit check failed", error);
    return NextResponse.json({ error: "server" }, { status: 503 });
  }

  let row: { id: string };
  try {
    [row] = await sql<{ id: string }[]>`
      insert into contact_messages ${sql({
        name: input.name,
        email: input.email,
        message: input.message,
        ip,
      })}
      returning id
    `;
  } catch (error) {
    console.error("contact insert failed", error);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }

  // Never throws — logs and swallows its own failures. The message is
  // already stored, so a Resend failure must not read as a failed submit.
  await sendContactEmail({
    id: row.id,
    name: input.name,
    email: input.email,
    message: input.message,
  });

  return NextResponse.json({ ok: true });
}
