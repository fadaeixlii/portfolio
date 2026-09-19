import { test, expect } from "@playwright/test";

test("rail fills as the timeline scrolls", async ({ page }) => {
  await page.goto("/en/experience");
  const fill = page.locator("[data-rail-fill]");
  const before = await fill.evaluate((el) => getComputedStyle(el).transform);
  await page.mouse.wheel(0, 1800);
  await page.waitForTimeout(400);
  const after = await fill.evaluate((el) => getComputedStyle(el).transform);
  expect(after).not.toBe(before);
});

test("rail sits on the right under rtl", async ({ page }) => {
  await page.goto("/fa/experience");
  const rail = page.locator("[data-rail]").first();
  const box = await rail.boundingBox();
  const viewport = page.viewportSize();
  expect(box!.x).toBeGreaterThan(viewport!.width / 2);
});
