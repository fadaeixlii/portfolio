/** First `x-forwarded-for` entry, trimmed; a fixed fallback for local dev
 *  where no proxy sets the header. Never trust anything past the first
 *  entry — a client can append its own. Shared by every route that
 *  rate-limits on IP (`/api/book`, `/api/contact`). */
export function clientIp(request: Request): string {
  const first = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return first || "127.0.0.1";
}
