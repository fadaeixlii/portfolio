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

// /skills/trail-reel: three phone videos per look, and the look switch (two
// native radios, CSS :has()) swaps the whole row. The hidden row is
// display:none, so only one look's videos are ever visible.
const TRAIL = {
  en: { ink: "Ink", checkout: "Show payment details" },
  fa: { ink: "جوهر", checkout: "نمایش جزئیات پرداخت" },
} as const;

for (const [locale, { ink, checkout }] of Object.entries(TRAIL)) {
  test(`${locale}: trail reel shows one look's three videos, the switch swaps them`, async ({ page }) => {
    await page.goto(`/${locale}/skills/trail-reel`);
    const videos = page.locator("main video:visible");

    await expect(videos).toHaveCount(3);
    for (const video of await videos.all()) await expect(video).toHaveAttribute("src", /-atlas\.mp4$/);

    // The radio itself is sr-only; a reader clicks its label.
    await page.locator("label", { hasText: ink }).click();
    await expect(page.getByRole("radio", { name: ink })).toBeChecked();
    await expect(videos).toHaveCount(3);
    for (const video of await videos.all()) await expect(video).toHaveAttribute("src", /-ink\.mp4$/);

    await expect(page.locator("#buy").getByRole("button", { name: checkout })).toBeVisible();
  });
}

// /skills/one-folder-studio: the test run's reel and the promo reel, and the checkout.
for (const [locale, { checkout }] of Object.entries(TRAIL)) {
  test(`${locale}: one folder studio shows its two reels and the checkout`, async ({ page }) => {
    await page.goto(`/${locale}/skills/one-folder-studio`);
    const videos = page.locator("main video:visible");
    await expect(videos).toHaveCount(2);
    await expect(videos.first()).toHaveAttribute("src", /\/one-folder-studio\/coffee\.mp4$/);
    await expect(page.locator("#buy").getByRole("button", { name: checkout })).toBeVisible();
  });
}
