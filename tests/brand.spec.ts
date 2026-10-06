import { test, expect } from "@playwright/test";

// The favicon, Apple icon and header mark all come from public/logo.jpg.
test("favicon, app icons and the header mark are served", async ({ page, request }) => {
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

  // Desktop nav pill carries the mark as its first cell.
  const mark = page.locator('nav img[src*="brand%2Fmark.png"], nav img[src*="brand/mark.png"]');
  await expect(mark.first()).toBeVisible();
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
