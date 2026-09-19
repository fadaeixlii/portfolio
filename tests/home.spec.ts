import { test, expect } from "@playwright/test";

/**
 * The outlined headline's failure mode is silence: if the stroke stops being
 * drawn the second line is a 17%-alpha fill on paper and nobody can read it.
 * `color` is the fallback and must never be the ghost value.
 */
test("the outlined headline keeps a stroke and a readable fallback colour", async ({
  page,
}) => {
  await page.goto("/en");
  const style = await page.locator(".headline-outline").first().evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      color: cs.color,
      fill: cs.webkitTextFillColor,
      stroke: cs.webkitTextStrokeWidth,
    };
  });
  // The outline is actually painted.
  expect(Number.parseFloat(style.stroke)).toBeGreaterThan(0);
  // The ghost is the *fill*, not `color` — so a browser that drops the
  // webkit properties renders the fallback instead of near-invisible text.
  expect(style.fill).not.toBe(style.color);
});

test("farsi carries a heavier stroke than latin", async ({ page }) => {
  const width = async (locale: string) => {
    await page.goto(`/${locale}`);
    return page
      .locator(".headline-outline")
      .first()
      .evaluate((el) =>
        Number.parseFloat(getComputedStyle(el).webkitTextStrokeWidth),
      );
  };
  // Vazirmatn's counters are tighter; 1px reads as a flat dim line there.
  expect(await width("fa")).toBeGreaterThan(await width("en"));
});

test("the identity column sticks beside the content and stacks below it", async ({
  page,
}) => {
  const boxes = async () => {
    const aside = await page.locator("aside").boundingBox();
    const main = await page.locator("main").boundingBox();
    expect(aside).not.toBeNull();
    expect(main).not.toBeNull();
    return { aside: aside!, main: main! };
  };

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/en");
  const wide = await boxes();
  // Inline start of the content, not above it.
  expect(wide.aside.x).toBeLessThan(wide.main.x);

  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(300);
  const stuck = await page.locator("aside").boundingBox();
  // Pinned under the nav rather than scrolled away with the page.
  expect(stuck!.y).toBeCloseTo(86, 0);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en");
  const narrow = await boxes();
  expect(narrow.aside.y).toBeGreaterThan(narrow.main.y + narrow.main.height - 1);
});
