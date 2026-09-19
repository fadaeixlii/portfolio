import { test, expect, type Page } from "@playwright/test";

/**
 * Every section on the page is wrapped in `Reveal`/`Stagger`, which only
 * animate to visible once `whileInView` sees them cross the viewport via
 * `IntersectionObserver`. A `fullPage` screenshot resizes the capture
 * surface but does not itself generate the scroll frames that observer
 * needs, so a naive goto-then-screenshot baseline commits every
 * below-the-fold section as permanently blank (opacity: 0). Scrolling
 * through in real steps — confirmed against a manual check of this page —
 * is what actually fires every section's observer before capture.
 */
async function revealEverything(page: Page) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y <= height; y += 400) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(150);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}

for (const locale of ["en", "fa"] as const) {
  for (const theme of ["dark", "light"] as const) {
    test(`styleguide renders: ${locale}/${theme}`, async ({ page }) => {
      await page.goto(`/${locale}/styleguide`);
      if (theme === "light") {
        await page.getByRole("button", { name: /switch theme|تغییر پوسته/i }).click();
      }
      await revealEverything(page);
      // Motion must settle or the snapshot is a coin flip.
      await page.waitForTimeout(1200);
      await expect(page).toHaveScreenshot(`styleguide-${locale}-${theme}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      });
    });
  }
}

test("rtl actually mirrors the nav", async ({ page }) => {
  await page.goto("/fa/styleguide");
  const nav = page.getByRole("navigation").first();
  const dir = await nav.evaluate((el) => getComputedStyle(el).direction);
  expect(dir).toBe("rtl");
});
