/** Real client IP behind Cloudflare + Caddy. Both proxies *append* to
 *  `x-forwarded-for`, so the first entry is whatever the client sent and
 *  fully attacker-controlled (rotate it, defeat the rate limiter). Prefer
 *  `cf-connecting-ip`: Cloudflare sets it from the actual TCP peer and
 *  strips/overwrites any client-supplied copy at the edge, so it cannot be
 *  spoofed through Cloudflare. Fall back to the *last* `x-forwarded-for`
 *  entry (the one Caddy's `trusted_proxies` appended) for any request that
 *  reaches us without going through Cloudflare. A fixed fallback covers
 *  local dev where neither proxy sets a header. Shared by every route that
 *  rate-limits on IP (`/api/book`, `/api/contact`). */
export function clientIp(request: Request): string {
  const cfIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cfIp) return cfIp;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",");
  const last = forwarded?.[forwarded.length - 1]?.trim();
  return last || "127.0.0.1";
}
