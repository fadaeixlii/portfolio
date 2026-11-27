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

// /skills/first-skim: the reel, the before/after slider over the real run's pages, plain AI's five lines, the checkout.
for (const [locale, { checkout }] of Object.entries(TRAIL)) {
  test(`${locale}: first skim shows its reel, the before/after and the checkout`, async ({ page }) => {
    await page.goto(`/${locale}/skills/first-skim`);
    await expect(page.locator("main video:visible")).toHaveAttribute("src", /\/first-skim\/reel\.mp4$/);
    await expect(page.locator("main").getByRole("slider")).toBeVisible();
    await expect(page.locator("#plain tbody tr")).toHaveCount(5);
    await expect(page.locator("#buy").getByRole("button", { name: checkout })).toBeVisible();
  });
}

// /skills/motion-tips: the first free product. A download link to the public
// PDF at the top and the bottom, the PDF itself answers, and no checkout.
const FREE = {
  en: "Download the free PDF",
  fa: "دانلود PDF رایگان",
} as const;

for (const [locale, download] of Object.entries(FREE)) {
  test(`${locale}: motion tips offers the free PDF and no checkout`, async ({ page, request }) => {
    await page.goto(`/${locale}/skills/motion-tips`);
    const links = page.getByRole("link", { name: download });
    await expect(links).toHaveCount(2);
    for (const link of await links.all()) {
      await expect(link).toHaveAttribute("href", "/shop/motion-tips/4-motion-tips.pdf");
      await expect(link).toHaveAttribute("download", "");
    }
    await expect(page.locator("main img")).toHaveCount(3);
    // No checkout: its network and token pickers are radio inputs, its action a button.
    await expect(page.locator("#buy")).toHaveCount(0);
    await expect(page.locator("main").locator("input, button")).toHaveCount(0);

    const pdf = await request.get("/shop/motion-tips/4-motion-tips.pdf");
    expect(pdf.status()).toBe(200);
    expect(pdf.headers()["content-type"]).toBe("application/pdf");
  });
}

// /skills: every product, paid and free, newest first, six a page. The nav
// links to it and stays marked on page 2.
test("skills list pages through every product, paid and free", async ({ page, request }) => {
  await page.goto("/en/skills");
  const cards = page.locator("main a").filter({ has: page.locator("h2") });
  await expect(cards).toHaveCount(6);
  await expect(cards.first()).toHaveAttribute("href", "/en/skills/motion-tips");
  await expect(cards.first()).toContainText("Free");
  await expect(cards.nth(1)).toHaveAttribute("href", "/en/skills/first-skim");
  await expect(cards.nth(1)).toContainText("€5");

  const pager = page.getByRole("navigation", { name: "Pages" });
  await expect(pager.getByRole("link", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
  await pager.getByRole("link", { name: "Next" }).click();
  await expect(page).toHaveURL(/\/en\/skills\/page\/2$/);
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toHaveAttribute("href", "/en/skills/ink-motion");
  await expect(pager.getByRole("link", { name: "Previous" })).toHaveAttribute("href", "/en/skills");

  const navLink = page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Skills" });
  await expect(navLink).toHaveAttribute("aria-current", "page");

  expect((await request.get("/en/skills/page/1")).status()).toBe(404);
  expect((await request.get("/en/skills/page/3")).status()).toBe(404);
});
