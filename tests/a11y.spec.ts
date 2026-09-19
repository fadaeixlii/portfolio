import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

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
        // Motion writes opacity inline; a fractional value means a fade is
        // still running. 0 is fine — axe skips fully transparent nodes.
        // Class-based fractional opacity (disabled controls) is not inline,
        // so it does not trip this.
        await page.waitForFunction(() =>
          [...document.querySelectorAll<HTMLElement>("[style*='opacity']")].every(
            (el) => {
              const o = Number.parseFloat(el.style.opacity);
              return !Number.isFinite(o) || o === 0 || o === 1;
            },
          ),
        );
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
