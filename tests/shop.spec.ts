import { test, expect } from "@playwright/test";

// The before/after slider on /skills/lights-on. The screenshots are
// left-to-right pages, so old sits left of new in every locale; a label that
// resolves its logical inset against its own (Farsi) direction swaps sides.
const LABELS = {
  en: ["Old site", "New site"],
  fa: ["سایت قدیمی", "سایت تازه"],
} as const;

for (const [locale, [old, fresh]] of Object.entries(LABELS)) {
  test(`${locale}: old site left of new, and the line follows the keys`, async ({ page }) => {
    await page.goto(`/${locale}/skills/lights-on`);
    const frame = page.locator("figure").first();

    const oldBox = await frame.getByText(old, { exact: true }).boundingBox();
    const newBox = await frame.getByText(fresh, { exact: true }).boundingBox();
    expect(oldBox!.x).toBeLessThan(newBox!.x);

    const knob = frame.locator(".bg-signal-fill");
    const start = (await knob.boundingBox())!.x;
    await frame.getByRole("slider").focus();
    for (let i = 0; i < 10; i++) await page.keyboard.press("ArrowRight");
    expect((await knob.boundingBox())!.x).toBeGreaterThan(start + 10);
  });
}
