import { test, expect, type Page } from "@playwright/test";

/**
 * Slots a few business days out, at a fixed UTC hour — the exact time
 * doesn't matter since `/api/availability` is mocked (the real slot rules
 * live in `tests/unit/slots.test.ts`), only that the dates land inside the
 * month the booker shows on load, whatever "today" happens to be when this
 * suite runs.
 */
function futureSlotIsos(count: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 1; out.length < count && i < 20; i++) {
    const d = new Date(now.getTime());
    d.setUTCDate(d.getUTCDate() + i);
    if (d.getUTCDay() === 0 || d.getUTCDay() === 6) continue;
    d.setUTCHours(9, 0, 0, 0);
    out.push(d.toISOString());
  }
  return out;
}

async function mockAvailability(
  page: Page,
  options: { status?: number; slots?: string[] } = {},
) {
  const { status = 200, slots = futureSlotIsos(6) } = options;
  await page.route("**/api/availability**", async (route) => {
    if (status !== 200) {
      await route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify({ error: "calendar_unavailable" }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ slots }),
    });
  });
}

async function mockBook(page: Page, status: number, body: unknown) {
  await page.route("**/api/book", async (route) => {
    await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
  });
}

const firstOpenDay = (page: Page) =>
  page.locator("table button:not([aria-disabled='true'])").first();

/**
 * The radio input itself is visually hidden (`sr-only`) — its styled
 * `<label>` is the clickable surface, same as a real visitor would use.
 * Clicking the label activates the input via the native `for`/`id`
 * association without needing the input to be independently hit-testable.
 */
const firstSlotLabel = (page: Page) =>
  page.locator('[role="radiogroup"] label').first();

test("walks month → day → slot → form → confirmed", async ({ page }) => {
  await mockAvailability(page);
  await mockBook(page, 200, {
    ok: true,
    meetUrl: "https://meet.google.com/abc-defg-hij",
    manageToken: "tok123.sig",
  });

  await page.goto("/en/schedule");
  await expect(page.getByRole("table")).toBeVisible();

  await firstOpenDay(page).click();
  await firstSlotLabel(page).click();
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByLabel("Name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByLabel("Topic").fill("AI engineering role");
  await page.getByLabel("Notes").fill("Met at a conference.");
  await page.getByRole("button", { name: "Book the call" }).click();

  await expect(page.getByRole("link", { name: "Join the meet" })).toHaveAttribute(
    "href",
    "https://meet.google.com/abc-defg-hij",
  );
});

test("409 on submit keeps the form's values and surfaces the message", async ({ page }) => {
  await mockAvailability(page);
  await mockBook(page, 409, { error: "slot_taken" });

  await page.goto("/en/schedule");
  await firstOpenDay(page).click();
  await firstSlotLabel(page).click();
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByLabel("Name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByRole("button", { name: "Book the call" }).click();

  // The route drops the visitor back at the slot list for the same day —
  // never re-asks for the details that are still sitting in the form.
  await expect(page.getByText("That slot was taken while you were typing.")).toBeVisible();

  await firstSlotLabel(page).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByLabel("Name")).toHaveValue("Ada Lovelace");
  await expect(page.getByLabel("Email")).toHaveValue("ada@example.com");
});

test("503 from availability shows the email fallback, not an empty month", async ({ page }) => {
  await mockAvailability(page, { status: 503 });

  await page.goto("/en/schedule");

  await expect(page.getByRole("table")).not.toBeVisible();
  await expect(page.getByRole("link", { name: "Email me instead" })).toHaveAttribute(
    "href",
    /^mailto:/,
  );
});

test("keyboard-only pass through the whole flow", async ({ page }) => {
  await mockAvailability(page);
  await mockBook(page, 200, {
    ok: true,
    meetUrl: "https://meet.google.com/kbd-test",
    manageToken: "tokkbd.sig",
  });

  await page.goto("/en/schedule");

  await firstOpenDay(page).focus();
  await page.keyboard.press("Enter");

  await page.getByRole("radio").first().focus();
  await page.keyboard.press(" ");

  await page.getByRole("button", { name: "Continue" }).focus();
  await page.keyboard.press("Enter");

  await page.getByLabel("Name").fill("Grace Hopper");
  await page.getByLabel("Email").fill("grace@example.com");

  await page.getByRole("button", { name: "Book the call" }).focus();
  await page.keyboard.press("Enter");

  await expect(page.getByRole("link", { name: "Join the meet" })).toBeVisible();
});

test("/fa renders the grid RTL with Persian digits", async ({ page }) => {
  await mockAvailability(page);

  await page.goto("/fa/schedule");

  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("table")).toBeVisible();
  const dayText = await firstOpenDay(page).textContent();
  expect(dayText).toMatch(/[۰-۹]/);
});
