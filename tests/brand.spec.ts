import { test, expect } from "@playwright/test";

// The favicon, Apple icon and phone header mark all come from public/logo.jpg.
// The desktop nav carries no mark (removed 2026-11-27): words only.
test("favicon and app icons are served, the desktop nav has no mark", async ({ page, request }) => {
  const ico = await request.get("/favicon.ico");
  expect(ico.status()).toBe(200);
  expect(ico.headers()["content-type"]).toContain("image/");

  await page.goto("/en");
  const icon = page.locator('head link[rel="icon"][type="image/png"]');
  await expect(icon).toHaveAttribute("href", /\/icon\.png/);
  const apple = page.locator('head link[rel="apple-touch-icon"]');
  await expect(apple).toHaveAttribute("href", /\/apple-icon\.png/);
  for (const href of [await icon.getAttribute("href"), await apple.getAttribute("href")]) {
    expect((await request.get(href!)).status()).toBe(200);
  }

  const nav = page.getByRole("navigation", { name: "Primary" });
  await expect(nav).toBeVisible();
  await expect(nav.locator("img")).toHaveCount(0);
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 375, height: 800 } });
  test("the header shows the mark instead of initials", async ({ page }) => {
    await page.goto("/en");
    const header = page.locator("header").first();
    await expect(header.locator('img[src*="mark.png"]')).toBeVisible();
    await expect(header).not.toContainText("MK");
  });
});
