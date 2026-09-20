import { NextResponse } from "next/server";
import { z } from "zod";
import {
  verifyPassword,
  createSessionValue,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
} from "@/lib/auth";
import { clientIp } from "@/lib/http/client-ip";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
});

/**
 * One admin, one password. The email is checked against ADMIN_EMAILS so the
 * form still reads like a login, but the password is what authenticates.
 *
 * Every rejection is the same body and status. A different message for
 * "unknown email" would tell an attacker which addresses exist.
 */
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  const deny = () => NextResponse.json({ error: "invalid" }, { status: 401 });

  if (!parsed.success) return deny();

  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    console.error("ADMIN_PASSWORD_HASH is not set — admin login is disabled");
    return deny();
  }

  const allowlist = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const emailOk = allowlist.includes(parsed.data.email.trim().toLowerCase());
  // Verify the password even when the email is wrong: skipping the scrypt
  // work would make a bad address measurably faster to reject.
  const passwordOk = verifyPassword(parsed.data.password, hash);

  if (!emailOk || !passwordOk) {
    console.warn(`admin login failed from ${clientIp(request)}`);
    return deny();
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, createSessionValue(), SESSION_COOKIE_OPTIONS);
  return response;
}
