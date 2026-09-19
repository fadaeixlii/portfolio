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
