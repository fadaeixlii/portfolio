import { test, expect } from "@playwright/test";

test("root redirects to the default locale", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/en$/);
});

test.describe("locale direction", () => {
  for (const [locale, dir] of [
    ["en", "ltr"],
    ["de", "ltr"],
    ["nl", "ltr"],
    ["fa", "rtl"],
    ["el", "ltr"],
  ] as const) {
    test(`${locale} renders dir=${dir}`, async ({ page }) => {
      await page.goto(`/${locale}`);
      await expect(page.locator("html")).toHaveAttribute("dir", dir);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
    });
  }
});

test("unknown route under a locale renders a real 404 document", async ({ page }) => {
  await page.goto("/fa/nope");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page).toHaveTitle(/.+/);
});

test("theme toggle flips data-theme and survives reload", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.getByRole("button", { name: /switch theme/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("paper colour actually changes between themes", async ({ page }) => {
  await page.goto("/en");
  const dark = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  await page.getByRole("button", { name: /switch theme/i }).click();
  const light = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  expect(dark).not.toBe(light);
});

test.describe("nav pill stays on screen", () => {
  // The `fixed` wrapper clips rather than scrolls, so an overflowing pill
  // goes off-screen silently — no scrollbar, no error, just an unreachable
  // "Home" link and theme toggle. Assert the real bounding box instead.
  for (const width of [320, 390, 768]) {
    test(`fits within a ${width}px viewport`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/en");
      const nav = page.getByRole("navigation", { name: "Home" });
      const box = await nav.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);

      // The two ends of the pill must actually be reachable.
      await expect(page.getByRole("link", { name: "Home" })).toBeInViewport();
      await expect(
        page.getByRole("button", { name: /switch theme/i }),
      ).toBeInViewport();
    });
  }
});
