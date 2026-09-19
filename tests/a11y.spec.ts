import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const locale of ["en", "fa"] as const) {
  for (const route of [
    "",
    "/styleguide",
    "/work",
    "/work/aim2balance",
    "/experience",
    "/stack",
  ] as const) {
    for (const theme of ["dark", "light"] as const) {
      test(`${locale}${route || "/"} / ${theme} has no axe violations`, async ({ page }) => {
        await page.goto(`/${locale}${route}`);
        // Drive the real control. Setting the attribute by hand works until
        // next-themes rehydrates and overwrites it, which makes this flaky.
        if (theme === "light") {
          await page.getByRole("button", { name: /switch theme|تغییر پوسته/i }).click();
          await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
        }
        const { violations } = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
          .analyze();
        expect(violations).toEqual([]);
      });
    }
  }
}
