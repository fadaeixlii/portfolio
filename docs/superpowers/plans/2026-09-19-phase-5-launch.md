# Portfolio v2 · Phase 5 — Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the loop — contact form, an admin view for messages and bookings, metadata and social images for every route in every locale, then the accessibility, performance and anti-slop passes, then ship to production on the real domain.

**Architecture:** Nothing new is invented here. The contact form reuses the Phase 2 `Field`/`Button` primitives and the existing Supabase table; admin is a thin authenticated read; SEO is generated from the same typed content that renders the pages, so metadata cannot drift from what the page says.

**Tech Stack:** Next.js metadata API, `next/og`, Supabase auth, Playwright + axe, Lighthouse CI, Vercel.

**Spec:** `docs/superpowers/specs/2026-09-19-portfolio-v2-design.md` §5.

**Depends on:** Phases 1–4 complete.

## Global Constraints

- All previous phases' Global Constraints still bind.
- Lighthouse ≥95 on Performance, Accessibility, Best Practices and SEO for every route.
- WCAG 2.2 AA, verified by axe on every route × both themes × `en` and `fa`.
- No horizontal scroll at 320 / 375 / 414 / 768 px.
- Per-route JS delta under 30 KB gzipped, or a written justification in `docs/decisions.md`.
- No secret in any client bundle.
- Every user-facing string has been through `no-ai-slop`.

---

### Task 1: Contact form

**Files:**
- Create: `src/components/contact/ContactForm.tsx`, `src/app/[locale]/contact/page.tsx`, `src/app/api/contact/route.ts`, `src/lib/validation/contact.ts`

**Interfaces:**
- Consumes: `Field`, `Button`, `Surface`, the existing `contact_messages` table and its rate-limit function carried over from v1
- Produces: `contactSchema` shared by client and server; `POST /api/contact`

- [ ] **Step 1: Write the shared schema**

```ts
import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(160),
  message: z.string().min(20).max(2000),
  locale: z.enum(["en", "de", "nl", "fa"]),
  /** Honeypot — must stay empty. */
  company: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
```

One schema, imported by the form resolver and the route. A divergence between client and server validation is how bad data gets in.

- [ ] **Step 2: Write the route**

Validate, honeypot (return `200` so bots learn nothing), call the existing rate-limit function, insert, then send through Resend. A Resend failure is logged but returns `200` — the message is already stored, and telling the visitor it failed would make them send it twice.

- [ ] **Step 3: Write the form**

`react-hook-form` + `zodResolver`. Button cycles `idle → loading → success`. On success the form is replaced by a confirmation line naming the response time; it does not reset silently, which reads as the message vanishing.

- [ ] **Step 4: Point the page at the right address**

`CONTACT_TO_EMAIL` is `mmohammadkhani408@gmail.com`. The page shows the email and GitHub. **No phone number** — the canon forbids publishing it.

- [ ] **Step 5: Commit**

```bash
git add src/components/contact src/app/\[locale\]/contact src/app/api/contact src/lib/validation
git commit -m "feat: contact form"
```

---

### Task 2: Admin view

**Files:**
- Create: `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `src/app/admin/bookings/page.tsx`, `src/app/auth/login/page.tsx`, `src/lib/supabase/server.ts`

**Interfaces:**
- Consumes: `@supabase/ssr`, the `contact_messages` and `bookings` tables
- Produces: an authenticated `/admin` listing both, unlocalised (excluded by the i18n middleware matcher from Phase 1)

- [ ] **Step 1: Gate the layout**

```tsx
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();
  // getUser() revalidates against the auth server; getSession() trusts a
  // cookie that a client could have forged.
  if (!data.user) redirect("/auth/login");
  return <div className="mx-auto max-w-5xl p-[var(--space-8)]">{children}</div>;
}
```

- [ ] **Step 2: Build the two lists**

Messages: newest first, sender, email, message, received time. Bookings: start time in **both** Tehran and the visitor's zone, name, email, topic, status, Meet link, and a cancel action hitting the Phase 4 token route.

- [ ] **Step 3: Verify the gate**

Visit `/admin` signed out → redirected to `/auth/login`. Sign in → both lists render. Confirm `/admin` is absent from the sitemap and returns `noindex`.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin src/app/auth src/lib/supabase
git commit -m "feat: admin messages and bookings"
```

---

### Task 3: Metadata, OG images, sitemap, robots

**Files:**
- Create: `src/lib/seo/metadata.ts`, `src/app/[locale]/opengraph-image.tsx`, `src/app/[locale]/work/[slug]/opengraph-image.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`

**Interfaces:**
- Consumes: typed content, `routing.locales`
- Produces: `buildMetadata({ title, description, path, locale })`; a sitemap with `hreflang` alternates for every route × locale

- [ ] **Step 1: Write the metadata builder**

Canonical URL per locale, `alternates.languages` naming all four plus `x-default` pointing at `en`, Open Graph and Twitter cards. Every page calls it; no page hand-rolls a `<meta>`.

- [ ] **Step 2: Write the OG images**

Edge runtime, drawn with the site's own tokens — paper background, display face, the amber signal as a single rule. Project images take the project name and one-line summary. **No stock imagery and no invented numbers**; the same claim rules apply to a social card as to the page.

- [ ] **Step 3: Write the sitemap**

```ts
import type { MetadataRoute } from "next";
import { routing } from "@/lib/i18n/routing";
import { getProjects } from "@/content";

const BASE = process.env.NEXT_PUBLIC_SITE_URL!;
const STATIC = ["", "/work", "/experience", "/stack", "/schedule", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...STATIC,
    ...getProjects().map((p) => `/work/${p.slug}`),
  ];

  return routing.locales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${BASE}/${locale}${path}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${BASE}/${l}${path}`]),
        ),
      },
    })),
  );
}
```

`/styleguide`, `/admin` and `/auth` are deliberately absent. `robots.ts` disallows all three.

- [ ] **Step 4: Verify**

```bash
pnpm build && pnpm start
curl -s localhost:3000/sitemap.xml | grep -c "<url>"
```

Expected: 60 entries — 15 paths × 4 locales. Confirm no `/styleguide` or `/admin`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/seo src/app/sitemap.ts src/app/robots.ts src/app/\[locale\]/opengraph-image.tsx src/app/\[locale\]/work
git commit -m "feat: metadata, og images, sitemap"
```

---

### Task 4: Accessibility sweep

**Files:**
- Modify: `tests/a11y.spec.ts`

**Interfaces:**
- Produces: axe coverage across every route × theme × direction

- [ ] **Step 1: Extend the test across all routes**

```ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = [
  "", "/work", "/work/aim2balance", "/experience",
  "/stack", "/schedule", "/contact",
];

for (const locale of ["en", "fa"] as const) {
  for (const route of ROUTES) {
    test(`a11y ${locale}${route || "/"}`, async ({ page }) => {
      await page.goto(`/${locale}${route}`);
      const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
        .analyze();
      expect(
        violations.map((v) => `${v.id}: ${v.nodes.length}`),
      ).toEqual([]);
    });
  }
}
```

- [ ] **Step 2: Add a keyboard walk**

One test that tabs from the top of the home page and asserts the skip link comes first, every nav item and the CTA are reachable, and the focus ring is visible on each (non-zero `outline-width` via computed style).

- [ ] **Step 3: Add the mobile no-scroll test**

```ts
for (const width of [320, 375, 414, 768]) {
  test(`no horizontal scroll at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    for (const route of ROUTES) {
      await page.goto(`/en${route}`);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `overflow on ${route}`).toBeLessThanOrEqual(1);
    }
  });
}
```

- [ ] **Step 4: Fix every finding at the token or component level**

A contrast failure is fixed in `tokens.css`, never by overriding a colour in one component. Record any ramp change in `docs/decisions.md`.

- [ ] **Step 5: Commit**

```bash
git add tests/a11y.spec.ts src/styles/tokens.css docs/decisions.md
git commit -m "test: full a11y and overflow coverage"
```

---

### Task 5: Performance budget

**Files:**
- Create: `lighthouserc.json`, `.github/workflows/quality.yml`

**Interfaces:**
- Produces: CI that fails on a regression

- [ ] **Step 1: Write the budget**

```json
{
  "ci": {
    "collect": {
      "startServerCommand": "pnpm start",
      "url": [
        "http://localhost:3000/en",
        "http://localhost:3000/en/work",
        "http://localhost:3000/en/schedule",
        "http://localhost:3000/fa"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.95 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.95 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }]
      }
    }
  }
}
```

- [ ] **Step 2: Write the workflow**

One job: `pnpm install --frozen-lockfile`, then `lint`, `typecheck`, `test:tokens`, `test:messages`, `test:unit`, `build`, `test`, then Lighthouse CI. All on every PR.

- [ ] **Step 3: Measure and fix**

Run `pnpm analyze`. The likely offenders and their fixes:

- Fonts: confirm exactly three families load, all subset, all `display: swap`.
- The booker pulls the whole schedule bundle onto the home page if a shared import leaks — check the route chunks and lazy-load `Booker` with `next/dynamic` if so.
- `backdrop-filter` on a large area hurts LCP. If the hero cells cost too much, switch the largest cell to `variant="flat"`; the nav pill stays glass because it is small.

- [ ] **Step 4: Commit**

```bash
git add lighthouserc.json .github/workflows/quality.yml
git commit -m "ci: quality gates and perf budget"
```

---

### Task 6: The anti-slop pass

**REQUIRED SUB-SKILLS:** `hallmark` (the 58-gate slop test) and `no-ai-slop` (every user-facing string).

**Files:**
- Create: `tokens.css` export at the project root, `.hallmark/log.json` update
- Modify: whatever the gates flag

**Interfaces:**
- Produces: a documented pass or a documented, justified exception per gate

- [ ] **Step 1: Run the slop test**

Load `hallmark`'s `references/slop-test.md` and answer all 58 gates. Every answer must be "no". Pay particular attention to the ones this design is most at risk of failing:

- **Gate 46 invented metrics** — cross-check every number on the site against spec §4.2's permitted list.
- **Gate 54 tag-left/heading-right** — the hanging-label pattern is banned; section tags stack above their heading or do not exist.
- **Gate 38a italic headers** — no `<em>` inside any heading.
- **Gate 48 token improvisation** — `pnpm test:tokens` already proves this.
- **Gates 34, 49–53 mobile** — covered by Task 4's overflow test; verify the no-two-line-button rule by hand at 320px.
- **Gate 47 re-drawn chrome** — confirm no fake browser bar, phone frame or IDE window anywhere, including OG images.

- [ ] **Step 2: Run `no-ai-slop` across every string**

`src/messages/en.json`, `src/content/*.ts`, and any literal in a component. Then read the home page out loud. Anything that sounds like a brochure gets cut.

- [ ] **Step 3: Emit `tokens.css` and update the log**

Copy the resolved token set to the project root as a portable `tokens.css`, and append this build to `.hallmark/log.json`.

- [ ] **Step 4: Commit**

```bash
git add tokens.css .hallmark src/messages src/content
git commit -m "chore: slop test pass"
```

---

### Task 7: Deploy

**Files:**
- Create: `docs/deployment.md`
- Modify: `README.md`

**Interfaces:**
- Produces: the live site on the real domain

- [ ] **Step 1: Create the Vercel project**

Link the repo, framework preset Next.js, build `pnpm build`, install `pnpm install --frozen-lockfile`. Set every variable from spec §3.6 in Production and Preview. `GOOGLE_REFRESH_TOKEN`, `GOOGLE_CLIENT_SECRET`, `SUPABASE_SECRET_KEY` and `BOOKING_TOKEN_SECRET` are server-only — confirm none carries a `NEXT_PUBLIC_` prefix.

- [ ] **Step 2: Deploy a preview and test it end to end**

On the preview URL: walk all four locales, toggle both themes, submit the contact form, and **make a real booking** — confirm the event lands in the calendar with a Meet link, both emails arrive, and the cancel link frees the slot. Then delete the test booking.

- [ ] **Step 3: Prove no secret shipped**

```bash
pnpm build
grep -rE "GOOGLE_(CLIENT_SECRET|REFRESH_TOKEN)|SUPABASE_SECRET|BOOKING_TOKEN_SECRET" .next/static && echo "LEAK" || echo "clean"
```

Expected: `clean`. **If this prints LEAK, stop and do not deploy.**

- [ ] **Step 4: Merge and cut over**

```bash
git switch main
git merge --no-ff feat/v2
pnpm lint && pnpm typecheck && pnpm test:tokens && pnpm test:messages && pnpm test:unit && pnpm build && pnpm test
git push origin main
```

Point `fadaeixlii.com` and `www` at the Vercel project. Confirm HTTPS, the `www` redirect, and that `/` resolves to `/en`.

- [ ] **Step 5: Write the runbook**

`docs/deployment.md`: env var table, how to rotate the Google refresh token, how to read logs, how to roll back (`vercel rollback`), and what to do when the health check reports the calendar is down.

- [ ] **Step 6: Update the README**

What the site is, how to run it, where the spec and plans live, and one line noting that v1 lives at the `v1-archive` tag.

- [ ] **Step 7: Commit**

```bash
git add docs/deployment.md README.md
git commit -m "docs: deployment runbook"
git push origin main
```

---

## Phase exit criteria

- [ ] `fadaeixlii.com` serves v2 over HTTPS, `/` redirects to `/en`
- [ ] All four locales, both themes, every route render correctly in production
- [ ] A real booking produces a calendar event with a Meet link and two emails; cancelling frees the slot
- [ ] The contact form stores a message and notifies
- [ ] Lighthouse ≥95 on all four categories for the four measured routes
- [ ] axe reports zero violations across every route × theme × direction
- [ ] No horizontal scroll at 320 / 375 / 414 / 768 px
- [ ] The 58 slop gates all answer "no", with any exception written down and justified
- [ ] `grep` of `.next/static` finds no secret
- [ ] `v1-archive` tag still resolves and the README says so
