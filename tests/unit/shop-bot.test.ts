import { describe, expect, it } from "vitest";
import { isBot } from "@/lib/shop/bot";

describe("isBot", () => {
  it("lets phones and desktop browsers through", () => {
    expect(isBot("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Instagram 350.0")).toBe(false);
    expect(isBot("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/142.0 Safari/537.36")).toBe(false);
  });
  it("drops crawlers, audits and missing agents", () => {
    expect(isBot("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(true);
    expect(isBot("Mozilla/5.0 Chrome-Lighthouse")).toBe(true);
    expect(isBot("Mozilla/5.0 HeadlessChrome/142.0")).toBe(true);
    expect(isBot(null)).toBe(true);
  });
});
