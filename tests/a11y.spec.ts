import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Scroll the whole document past every viewport, then return to the top, so
 * every `whileInView` reveal has fired before anything is measured. Without
 * it the settle-wait below is satisfied by elements still sitting at opacity
 * 0 that will never leave it, and axe quietly scans a fraction of the page.
 */
async function walkThePage(page: Page) {
  await page.evaluate(async () => {
    const step = Math.max(200, Math.round(window.innerHeight * 0.75));
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    window.scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 150));
  });
}

const ROUTES = [
  "",
  "/work",
  "/work/aim2balance",
  "/experience",
  "/stack",
  "/schedule",
  "/contact",
  "/styleguide",
] as const;

for (const locale of ["en", "fa"] as const) {
  for (const route of ROUTES) {
    for (const theme of ["dark", "light"] as const) {
      test(`${locale}${route || "/"} / ${theme} has no axe violations`, async ({ page }) => {
        // Scroll reveals fade sections in from opacity 0. axe reads the
        // *computed* colour, so a scan landing mid-fade measures ink at ~3%
        // over paper and reports a 1.05:1 failure no reader ever sees — a
        // flake that moved routes between runs. Reduced motion collapses the
        // reveal to a 150ms crossfade; the wait below confirms it is over.
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto(`/${locale}${route}`);
        // Drive the real control. Setting the attribute by hand works until
        // next-themes rehydrates and overwrites it, which makes this flaky.
        if (theme === "light") {
          await page.getByRole("button", { name: /switch theme|تغییر پوسته/i }).click();
          await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
        }
        // /schedule paints after an availability fetch — wait it out rather
        // than guessing a duration.
        await page.waitForLoadState("networkidle");
        // Every section below the fold is a `whileInView` reveal parked at
        // opacity 0 until it is scrolled to, and axe skips fully transparent
        // nodes. Without this walk the home scan reached the hero and little
        // else: 11 of 14 inline-opacity elements rested at 0 and axe read 162
        // nodes. Walking the page takes that to 0 at rest and 239 nodes.
        await walkThePage(page);
        // Half one: nothing is mid-fade. Motion writes opacity inline, so a
        // fractional value means a transition is still running and axe would
        // measure ink at 3% over paper. Class-based fractional opacity
        // (disabled controls) is not inline, so it does not trip this.
        // 0 passes the *wait* only so a stuck element cannot hang it out to
        // the timeout with no message; half two below is what judges it.
        await page.waitForFunction(() =>
          [...document.querySelectorAll<HTMLElement>("[style*='opacity']")].every(
            (el) => {
              const o = Number.parseFloat(el.style.opacity);
              return !Number.isFinite(o) || o === 0 || o === 1;
            },
          ),
        );
        // Half two: nothing that should be visible rests at 0. For a
        // below-the-fold `whileInView` element, 0 after the walk means never
        // revealed, not settled — and axe skips transparent nodes, so the
        // coverage would drop with the suite still green.
        const stillHidden = await page.evaluate(
          () =>
            [
              ...document.querySelectorAll<HTMLElement>("[style*='opacity']"),
            ].filter((el) => Number.parseFloat(el.style.opacity) === 0).length,
        );
        expect(stillHidden, "nodes axe would skip as transparent").toBe(0);
        const { violations } = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
          .analyze();
        expect(
          violations.map((v) => `${v.id}: ${v.nodes.length}`),
        ).toEqual([]);
      });
    }
  }
}

test("keyboard walk reaches skip link, nav, and CTA with a visible focus ring", async ({
  page,
}) => {
  await page.goto("/en");

  // First tab stop is the skip link.
  await page.keyboard.press("Tab");
  const skipLink = page.locator("a:focus");
  await expect(skipLink).toHaveAttribute("href", "#main");

  const outlineWidth = async () =>
    page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return "0px";
      return getComputedStyle(el).outlineWidth;
    });
  expect(await outlineWidth()).not.toBe("0px");

  const expectedLabels = ["home", "work", "experience", "stack", "schedule"];
  for (const key of expectedLabels) {
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toBeVisible();
    expect(await outlineWidth()).not.toBe("0px");
    void key;
  }
});

for (const width of [320, 375, 414, 768]) {
  test(`no horizontal scroll at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    for (const route of ROUTES) {
      await page.goto(`/en${route}`);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `overflow on ${route}`).toBeLessThanOrEqual(1);
    }
  });
}
