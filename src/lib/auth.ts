import "server-only";
import { createHmac, timingSafeEqual, scryptSync, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Admin sessions, replacing Supabase Auth.
 *
 * Supabase was two products in one, and only the database half was being
 * used for anything real. Its auth half guarded a single route, `/admin`,
 * for a single person — so what replaced it is a signed cookie and a hashed
 * password in the environment, which is the whole of what that needs.
 *
 * The cookie carries `expiry.hmac(expiry)`. There is no session table and
 * nothing to revoke: change ADMIN_PASSWORD_HASH or SESSION_SECRET and every
 * existing cookie stops verifying. For one admin that is the right trade.
 *
 * Scrypt, not a bare SHA: a password hash has to be slow, or the hash in the
 * environment is only as strong as the password behind it.
 */
const COOKIE = "portfolio_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12;

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters");
  }
  return value;
}

/** `scrypt$<salt-hex>$<key-hex>` — what `pnpm admin:hash` prints. */
export function hashPassword(password: string, salt = randomBytes(16)): string {
  const key = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltHex, keyHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !keyHex) return false;
  const expected = Buffer.from(keyHex, "hex");
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  // Constant time: a length check first, because timingSafeEqual throws on a
  // mismatch and that throw would itself be a signal.
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function createSessionValue(): string {
  const expiry = String(Date.now() + MAX_AGE_SECONDS * 1000);
  return `${expiry}.${sign(expiry)}`;
}

export function verifySessionValue(value: string | undefined): boolean {
  if (!value) return false;
  const dot = value.lastIndexOf(".");
  if (dot < 1) return false;

  const expiry = value.slice(0, dot);
  const given = Buffer.from(value.slice(dot + 1));
  const expected = Buffer.from(sign(expiry));
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return false;
  }
  // Signature first, then expiry: an expired-but-valid cookie and a forged
  // one should take the same path out.
  return Number(expiry) > Date.now();
}

export const SESSION_COOKIE = COOKIE;

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  // Secure in production only, or the cookie never sets over plain http on
  // localhost and the login silently fails to stick.
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};

/** Whether the current request carries a valid admin session. */
export async function isSignedIn(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionValue(jar.get(COOKIE)?.value);
}
