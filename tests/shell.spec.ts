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

  await page.getByRole("button", { name: /switch theme/i }).filter({ visible: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("paper colour actually changes between themes", async ({ page }) => {
  await page.goto("/en");
  const dark = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  await page.getByRole("button", { name: /switch theme/i }).filter({ visible: true }).click();
  const light = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  expect(dark).not.toBe(light);
});

test.describe("chrome stays on screen", () => {
  // The `fixed` wrappers clip rather than scroll, so anything that overflows
  // goes off-screen silently — no scrollbar, no error, just an unreachable
  // control. Assert real bounding boxes rather than trusting the layout.
  //
  // Below `lg` the desktop pill is not merely narrower, it is gone: the
  // mobile header and the fixed tab bar take those widths. So the thing to
  // check at phone sizes is the mobile chrome, and the pill only from `lg`.
  for (const width of [320, 390, 768]) {
    test(`mobile chrome fits a ${width}px viewport`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/en");

      await expect(page.getByRole("navigation", { name: "Primary" })).toBeHidden();

      const tabs = page.getByRole("navigation", { name: "Sections" });
      const box = (await tabs.boundingBox())!;
      expect(box).not.toBeNull();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      // Pinned to the bottom edge, not floating above it.
      expect(Math.round(box.y + box.height)).toBeCloseTo(800, 0);

      // Both ends of the tab row are reachable, and so is the header.
      await expect(tabs.getByRole("link").first()).toBeInViewport();
      await expect(tabs.getByRole("link").last()).toBeInViewport();
      await expect(
        page.getByRole("button", { name: /switch theme/i }).filter({ visible: true }),
      ).toBeInViewport();
    });
  }

  test("the desktop pill fits at lg", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto("/en");

    const nav = page.getByRole("navigation", { name: "Primary" });
    const box = (await nav.boundingBox())!;
    expect(box).not.toBeNull();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(1024);

    await expect(page.getByRole("link", { name: "Home" })).toBeInViewport();
    await expect(
      page.getByRole("button", { name: /switch theme/i }).filter({ visible: true }),
    ).toBeInViewport();
  });
});
