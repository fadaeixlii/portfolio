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
      // Playwright keys baselines by platform and the ones committed here were
      // captured on Windows. A Linux runner looks for `-chromium-linux.png`,
      // finds nothing, and fails on a missing baseline rather than on a real
      // difference — which reads as a visual regression and is not one. Until
      // Linux baselines are generated on Linux, this suite is a local guard,
      // and CI has no visual-regression coverage. See docs/decisions.md.
      test.skip(
        process.platform !== "win32",
        "styleguide baselines were captured on win32; see docs/decisions.md",
      );
      await page.goto(`/${locale}/styleguide`);
      if (theme === "light") {
        await page.getByRole("button", { name: /switch theme|تغییر پوسته/i }).filter({ visible: true }).click();
      }
      await revealEverything(page);
      // Motion must settle or the snapshot is a coin flip.
      await page.waitForTimeout(1200);
      await expect(page).toHaveScreenshot(`styleguide-${locale}-${theme}.png`, {
        fullPage: true,
        // Measured, not guessed. Two renders of an unchanged page on this
        // machine differ by 0 pixels byte-exact and under 200 by a coarse
        // channel comparison, so the floor is ~3e-5. The signal it has to
        // catch is a site-wide face change: swapping the Farsi headings from
        // Archivo to Vazirmatn moves 59,717 pixels here, ratio ~0.02. The old
        // 0.02 sat exactly on that boundary and let the change through — the
        // English pair only failed because the new body face shifted the page
        // height by one pixel, and a dimension mismatch fails outright. Had
        // the height held, all four would have gone green on a wrong render.
        // 0.0005 is ~2,900 px here: an order of magnitude above the noise,
        // twenty times below the smallest real change measured.
        maxDiffPixelRatio: 0.0005,
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
