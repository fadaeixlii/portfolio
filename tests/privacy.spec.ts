import { test, expect } from "@playwright/test";

const PRIVACY_EMAIL = "mo@fadaeixlii.dev";

test("/en/privacy renders the policy with the privacy contact address", async ({ page }) => {
  const response = await page.goto("/en/privacy");
  expect(response?.status()).toBe(200);

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Privacy");
  const mail = page.getByRole("link", { name: PRIVACY_EMAIL });
  await expect(mail.first()).toBeVisible();
  await expect(mail.first()).toHaveAttribute("href", `mailto:${PRIVACY_EMAIL}`);
});

test("footer links to the privacy page", async ({ page }) => {
  await page.goto("/en");
  await page.locator("footer").getByRole("link", { name: "Privacy" }).click();
  await expect(page).toHaveURL(/\/en\/privacy$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Privacy");
});

test("/fa/privacy renders right-to-left", async ({ page }) => {
  await page.goto("/fa/privacy");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("حریم خصوصی");
});
