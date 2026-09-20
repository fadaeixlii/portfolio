import { test, expect } from "@playwright/test";

const ROUTE = "/en/work/intex-exchange";
const arrowFigures = (page: import("@playwright/test").Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll("span")]
      .map((s) => s.textContent?.trim())
      .filter((t): t is string => !!t && t.includes("→")),
  );

const AUTHORED = ["4.2s → 2.9s", "8 days → 5 days"];

/**
 * The case-study figures animate the number after the arrow down from the
 * number before it. The risk is not that the animation looks wrong — it is
 * that a half-finished or un-started frame is left on screen, because the
 * frame is a *different claim*: "4.2s → 4.2s" says the page load never
 * improved. That shipped once, when the component mirrored the value into
 * state and `useMotionSafe` flipped after the first render.
 */
test("figures settle on the authored value", async ({ page }) => {
  await page.goto(ROUTE);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  // Mid-flight it may read anything; settled it must read the content.
  await expect(async () => {
    expect(await arrowFigures(page)).toEqual(AUTHORED);
  }).toPass({ timeout: 5000 });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("figures never leave the authored value", async ({ page }) => {
    await page.goto(ROUTE);
    expect(await arrowFigures(page)).toEqual(AUTHORED);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    // Sampled across the window the animation would have run in.
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(120);
      expect(await arrowFigures(page)).toEqual(AUTHORED);
    }
  });
});
