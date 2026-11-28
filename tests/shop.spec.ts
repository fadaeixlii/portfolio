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

// /skills/motion-tips: the first free product. The PDF comes by email only: an
// email form at the top and the bottom, the notice beside each button links the
// privacy page, no download link, no public copy of the file, no checkout.
const FREE = {
  en: { email: "Your email", send: "Email me the PDF", privacy: "privacy policy" },
  fa: { email: "ایمیل شما", send: "PDF را برایم ایمیل کن", privacy: "سیاست حریم خصوصی" },
} as const;

for (const [locale, { email, send, privacy }] of Object.entries(FREE)) {
  test(`${locale}: motion tips asks for an email, with no download link and no checkout`, async ({ page, request }) => {
    await page.goto(`/${locale}/skills/motion-tips`);
    const forms = page.locator("main form");
    await expect(forms).toHaveCount(2);
    for (const form of await forms.all()) {
      await expect(form.getByRole("textbox", { name: email })).toHaveAttribute("type", "email");
      // The notice is the button's description, so a screen reader hears it on the button.
      await expect(form.getByRole("button", { name: send })).toHaveAccessibleDescription(new RegExp(privacy));
      await expect(form.getByRole("link", { name: privacy })).toHaveAttribute("href", `/${locale}/privacy`);
    }
    await expect(page.locator('main a[download], main a[href$=".pdf"]')).toHaveCount(0);
    await expect(page.locator("main img")).toHaveCount(3);
    // No checkout: its network and token pickers are radio inputs.
    await expect(page.locator("#buy")).toHaveCount(0);
    await expect(page.locator("main input[type=radio]")).toHaveCount(0);

    expect((await request.get("/shop/motion-tips/4-motion-tips.pdf")).status()).toBe(404);
  });
}

// The form's states, on a mocked route (no database, no email): a bad address
// never leaves the page, a server error keeps the address for a retry, and a
// sent request replaces the form with a confirmation that takes focus.
test("motion tips form: invalid, error and sent, by keyboard, with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const bodies: unknown[] = [];
  const answers = [{ status: 503, body: { error: "server" } }, { status: 200, body: { ok: true } }];
  await page.route("**/api/shop/lead", async (route) => {
    bodies.push(route.request().postDataJSON());
    const answer = answers.shift()!;
    await route.fulfill({ status: answer.status, json: answer.body });
  });
  await page.goto("/en/skills/motion-tips");
  const form = page.locator("main form").first();
  const input = form.getByRole("textbox", { name: "Your email" });

  await input.fill("not-an-email");
  await input.press("Enter");
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(form.getByRole("alert")).toHaveText("Enter a valid email address, like name@example.com.");
  expect(bodies).toHaveLength(0);

  // (A type=email input already drops surrounding spaces itself; the route's
  // trim is covered in tests/unit/shop-lead.test.ts.)
  await input.fill("Ada@Example.COM");
  await input.press("Enter");
  await expect(form.getByRole("alert")).toHaveText("Something went wrong and the email did not go out. Try again in a minute.");
  await expect(input).not.toHaveAttribute("aria-invalid");
  await expect(input).toHaveValue("Ada@Example.COM");
  // Sent as typed; the route lowercases (tests/unit/shop-lead.test.ts).
  expect(bodies).toEqual([{ productId: "motion-tips", email: "Ada@Example.COM", locale: "en" }]);

  await form.getByRole("button", { name: "Email me the PDF" }).press("Enter");
  const sent = page.getByRole("status").filter({ hasText: "The PDF is on its way to your inbox." });
  await expect(sent).toBeVisible();
  await expect(sent).toBeFocused();
  // The hint is inside the focused status, so a screen reader hears it with the confirmation.
  await expect(sent).toContainText("Not in your inbox? Check Promotions or Spam.");
  await expect(page.locator("main form")).toHaveCount(1);
  expect(bodies).toHaveLength(2);
});

// Where the unsubscribe link lands: a plain confirmation, kept out of search.
test("unsubscribed page confirms in the visitor's language and is not indexed", async ({ page }) => {
  await page.goto("/de/unsubscribed");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Abgemeldet");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

// /skills/ai-video-editor: the second free product, on the same email form.
// The reel's cover, the PDF's contents with each tool's licence as its project
// states it, no download link, no public copy of the file, no checkout.
const EDITOR = {
  en: { email: "Your email", send: "Email me the PDF" },
  fa: { email: "ایمیل شما", send: "PDF را برایم ایمیل کن" },
} as const;

for (const [locale, { email, send }] of Object.entries(EDITOR)) {
  test(`${locale}: ai video editor asks for an email and lists what is in the PDF`, async ({ page, request }) => {
    expect((await page.goto(`/${locale}/skills/ai-video-editor`))?.status()).toBe(200);
    const forms = page.locator("main form");
    await expect(forms).toHaveCount(2);
    for (const form of await forms.all()) {
      await expect(form.getByRole("textbox", { name: email })).toHaveAttribute("type", "email");
      await expect(form.getByRole("button", { name: send })).toBeVisible();
    }
    await expect(page.locator("main img")).toHaveCount(1);
    await expect(page.locator("#tools li")).toHaveCount(5);
    for (const licence of ["PolyForm Small Business 1.0.0", "LGPL/GPL", "MIT", "Unlicense"]) {
      await expect(page.locator("#tools")).toContainText(licence);
    }
    await expect(page.locator("#prompts li")).toHaveCount(3);
    await expect(page.locator('main a[download], main a[href$=".pdf"]')).toHaveCount(0);
    await expect(page.locator("#buy")).toHaveCount(0);

    for (const path of ["/shop/ai-video-editor/3-ai-video-editor.pdf", "/shop/3-ai-video-editor.pdf"]) {
      expect((await request.get(path)).status()).toBe(404);
    }
  });
}

test("ai video editor form asks for its own product", async ({ page }) => {
  const bodies: unknown[] = [];
  await page.route("**/api/shop/lead", async (route) => {
    bodies.push(route.request().postDataJSON());
    await route.fulfill({ json: { ok: true } });
  });
  await page.goto("/en/skills/ai-video-editor");
  const form = page.locator("main form").first();
  await form.getByRole("textbox", { name: "Your email" }).fill("ada@example.com");
  await form.getByRole("button", { name: "Email me the PDF" }).click();
  await expect(page.getByRole("status")).toContainText("The PDF is on its way to your inbox.");
  expect(bodies).toEqual([{ productId: "ai-video-editor", email: "ada@example.com", locale: "en" }]);
});

test("sitemap lists the ai video editor page in every locale", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  for (const locale of ["en", "de", "nl", "fa", "el"]) {
    expect(xml).toContain(`/${locale}/skills/ai-video-editor</loc>`);
  }
});

// /skills: every product, paid and free, newest first, six a page. The nav
// links to it and stays marked on page 2.
test("skills list pages through every product, paid and free", async ({ page, request }) => {
  await page.goto("/en/skills");
  const cards = page.locator("main a").filter({ has: page.locator("h2") });
  await expect(cards).toHaveCount(6);
  await expect(cards.first()).toHaveAttribute("href", "/en/skills/ai-video-editor");
  await expect(cards.first()).toContainText("Free");
  await expect(cards.first().locator("img")).toHaveAttribute("src", /ai-video-editor%2Fcover\.webp/);
  await expect(cards.nth(1)).toHaveAttribute("href", "/en/skills/motion-tips");
  await expect(cards.nth(1)).toContainText("Free");
  await expect(cards.nth(2)).toHaveAttribute("href", "/en/skills/first-skim");
  await expect(cards.nth(2)).toContainText("€5");

  const pager = page.getByRole("navigation", { name: "Pages" });
  await expect(pager.getByRole("link", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
  await pager.getByRole("link", { name: "Next" }).click();
  await expect(page).toHaveURL(/\/en\/skills\/page\/2$/);
  await expect(cards).toHaveCount(2);
  await expect(cards.first()).toHaveAttribute("href", "/en/skills/paper-trail");
  await expect(cards.last()).toHaveAttribute("href", "/en/skills/ink-motion");
  await expect(pager.getByRole("link", { name: "Previous" })).toHaveAttribute("href", "/en/skills");

  const navLink = page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Skills" });
  await expect(navLink).toHaveAttribute("aria-current", "page");

  expect((await request.get("/en/skills/page/1")).status()).toBe(404);
  expect((await request.get("/en/skills/page/3")).status()).toBe(404);
});
