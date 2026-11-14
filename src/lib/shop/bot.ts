/** Crawlers and audit tools that run JavaScript (and so fire the shop beacon). */
export function isBot(userAgent: string | null): boolean {
  return !userAgent || /bot|crawl|spider|slurp|lighthouse|headless|preview|facebookexternalhit/i.test(userAgent);
}
