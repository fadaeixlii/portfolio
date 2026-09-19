import { test, expect } from "@playwright/test";

test("glass surfaces actually blur in this engine", async ({ page }) => {
  await page.goto("/en/styleguide");
  const surface = page.locator('[data-surface="glass"]').first();
  await expect(surface).toBeVisible();

  const filter = await surface.evaluate(
    (el) => getComputedStyle(el).backdropFilter,
  );
  expect(filter).toContain("blur");
});

test("glass keeps a tint floor so text stays legible", async ({ page }) => {
  await page.goto("/en/styleguide");
  const bg = await page
    .locator('[data-surface="glass"]')
    .first()
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  // Never fully transparent — that is what makes glass text unreadable.
  expect(bg).not.toBe("rgba(0, 0, 0, 0)");
});
