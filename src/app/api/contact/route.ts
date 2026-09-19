import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation/contact";
import { createServiceClient } from "@/lib/supabase/service";
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

  const supabase = createServiceClient();
  const ip = clientIp(request);
  const since = new Date(Date.now() - 86_400_000).toISOString();

  // .retry(false): postgrest-js's own retry doesn't back off for our fetch
  // timeout's TimeoutError, so without it a wedged Supabase host takes ~4x
  // the 5s fetch timeout, not 5s. See the comment in service.ts.
  const { count, error: countError } = await supabase
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("created_at", since)
    .retry(false);
  // A failed count must not read as "zero messages" — that would let the
  // limiter fail open. Treat it as a failed request instead.
  if (countError) {
    console.error("contact rate limit check failed", countError);
    return NextResponse.json({ error: "server" }, { status: 503 });
  }
  if ((count ?? 0) >= MAX_MESSAGES_PER_IP_PER_DAY) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const { data: row, error: insertError } = await supabase
    .from("contact_messages")
    .insert({ name: input.name, email: input.email, message: input.message, ip })
    .select("id")
    .single();

  if (insertError) {
    console.error("contact insert failed", insertError);
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
