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

/**
 * The booker fires `/api/health/calendar` once on mount and swaps the whole
 * calendar for the email fallback when it fails. That call is a real request
 * to Google, so leaving it unmocked makes every test below depend on whether
 * the machine running it happens to hold working credentials — green on a
 * laptop with a live token, red on CI with dummy ones. Mock it explicitly so
 * these tests exercise the booker instead of the environment. The unhealthy
 * path gets its own test rather than arriving by accident.
 */
async function mockHealth(page: Page, ok = true) {
  await page.route("**/api/health/calendar", async (route) => {
    await route.fulfill({
      status: ok ? 200 : 503,
      contentType: "application/json",
      body: JSON.stringify(ok ? { ok: true } : { ok: false, reason: "mocked" }),
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
  await mockHealth(page);
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
  await mockHealth(page);
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
  await mockHealth(page);
  await mockAvailability(page, { status: 503 });

  await page.goto("/en/schedule");

  await expect(page.getByRole("table")).not.toBeVisible();
  await expect(page.getByRole("link", { name: "Email me instead" })).toHaveAttribute(
    "href",
    /^mailto:/,
  );
});

test("a dead calendar credential shows the email fallback before any month loads", async ({
  page,
}) => {
  // Distinct from the availability-503 test above: this is the mount-time
  // health probe failing, which is what a revoked or expired Google refresh
  // token looks like to a visitor. Availability is left healthy so a pass
  // here cannot be produced by the other failure path.
  await mockHealth(page, false);
  await mockAvailability(page);

  await page.goto("/en/schedule");

  await expect(page.getByRole("table")).not.toBeVisible();
  await expect(page.getByRole("link", { name: "Email me instead" })).toHaveAttribute(
    "href",
    /^mailto:/,
  );
});

test("keyboard-only pass through the whole flow", async ({ page }) => {
  await mockHealth(page);
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
  await mockHealth(page);
  await mockAvailability(page);

  await page.goto("/fa/schedule");

  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("table")).toBeVisible();
  const dayText = await firstOpenDay(page).textContent();
  expect(dayText).toMatch(/[۰-۹]/);
});

/** Every day in October and November 2026 (31 and 30 days) at 06:00 UTC —
 *  enough for both months the test pages through to render every day as
 *  bookable, regardless of the real weekday/working-hours rules covered by
 *  tests/unit/slots.test.ts. */
function twoMonthsOfSlots(): string[] {
  const out: string[] = [];
  for (const [month, days] of [[9, 31], [10, 30]] as const) {
    for (let d = 1; d <= days; d++) {
      out.push(new Date(Date.UTC(2026, month, d, 6, 0, 0)).toISOString());
    }
  }
  return out;
}

test("the month grid stays keyboard-reachable after paging from a 31-day month", async ({
  page,
}) => {
  // Pin "today" to 2026-10-15: October has 31 days, November (one click of
  // "Next month" away, and inside the 28-day horizon) has 30. Without
  // `key={monthKey}` on <MonthGrid>, focusing day 31 then paging to
  // November leaves `focusDay=31` stuck in state — no day 31 exists in
  // November, so no button gets `tabIndex=0` and the grid drops out of the
  // tab order entirely.
  await page.clock.install({ time: new Date("2026-10-15T12:00:00Z") });
  await mockHealth(page);
  await mockAvailability(page, { slots: twoMonthsOfSlots() });

  await page.goto("/en/schedule");
  await expect(page.getByRole("table")).toBeVisible();

  const day31 = page.locator("table button").filter({ hasText: /^31$/ });
  await expect(day31).toHaveCount(1);
  await day31.focus();

  await page.getByRole("button", { name: "Next month" }).click();
  await expect(page.getByRole("table")).toBeVisible();

  await expect(page.locator('table button[tabindex="0"]')).toHaveCount(1);
});
