# Portfolio v2 · Phase 5 — Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the loop — contact form, an admin view for messages and bookings, metadata and social images for every route in every locale, then the accessibility, performance and anti-slop passes, then ship to production on the real domain.

**Architecture:** Nothing new is invented here. The contact form reuses the Phase 2 `Field`/`Button` primitives and the existing Supabase table; admin is a thin authenticated read; SEO is generated from the same typed content that renders the pages, so metadata cannot drift from what the page says.

**Tech Stack:** Next.js metadata API, `next/og`, Supabase auth, Playwright + axe, Lighthouse CI, Docker + Caddy on the VPS, Cloudflare.

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

### Task 7: Deploy to the VPS behind Cloudflare

**Files:**
- Create: `Dockerfile`, `docker-compose.yml`, `.github/workflows/deploy.yml`, `deploy/Caddyfile`, `docs/deployment.md`
- Modify: `README.md`

**Interfaces:**
- Produces: `mohammadmkh.dev` served from the VPS through Cloudflare, with automatic deploys on push to `main`

- [ ] **Step 1: Register the domain and point DNS at Cloudflare**

Buy `mohammadmkh.dev`. Porkbun is $8.75 the first year and $12.87 to renew; Cloudflare
Registrar sells at cost with no markup. Whichever registrar takes the payment, set the
domain's nameservers to the pair Cloudflare gives you — that is what makes the rest of
this task work, and it costs nothing.

In the Cloudflare dashboard:

| Record | Name | Content | Proxy |
|---|---|---|---|
| A | `@` | `<VPS IPv4>` | **Proxied** (orange) |
| A | `www` | `<VPS IPv4>` | **Proxied** (orange) |

Then **SSL/TLS → Overview → Full (strict)**. Anything less lets Cloudflare talk to your
origin unencrypted, which defeats the point.

- [ ] **Step 2: Issue a Cloudflare Origin Certificate**

**SSL/TLS → Origin Server → Create Certificate.** Fifteen-year validity, covers
`mohammadmkh.dev` and `*.mohammadmkh.dev`. Save the certificate and key onto the VPS at
`/etc/ssl/cloudflare/`, mode `600`, owned by root. This certificate is only trusted by
Cloudflare, which is exactly what Full (strict) wants, and it never needs renewing on
the cadence Let's Encrypt would.

- [ ] **Step 3: Write the Dockerfile**

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Public env vars are inlined at build time; secrets are read at runtime.
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -g 1001 nodejs && adduser -u 1001 -G nodejs -S nextjs
# `output: standalone` traces exactly what the server needs.
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

- [ ] **Step 4: Write the compose file and the Caddyfile**

`docker-compose.yml` runs the app on an internal network; Caddy terminates TLS with the
origin certificate and proxies to it.

```yaml
services:
  portfolio:
    build: .
    restart: unless-stopped
    env_file: .env.production
    expose: ["3000"]
    networks: [web]

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports: ["80:80", "443:443"]
    volumes:
      - ./deploy/Caddyfile:/etc/caddy/Caddyfile:ro
      - /etc/ssl/cloudflare:/etc/ssl/cloudflare:ro
      - caddy_data:/data
    networks: [web]

networks:
  web:
volumes:
  caddy_data:
```

`deploy/Caddyfile`:

```
mohammadmkh.dev, www.mohammadmkh.dev {
	tls /etc/ssl/cloudflare/origin.pem /etc/ssl/cloudflare/origin.key
	encode zstd gzip
	reverse_proxy portfolio:3000
	header {
		# .dev is HSTS-preloaded; say so explicitly anyway.
		Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
		X-Content-Type-Options nosniff
		Referrer-Policy strict-origin-when-cross-origin
	}
}
```

**Port check before you start:** `job` and `outreach` already run on this box. Confirm
nothing else holds 80 or 443 — `ss -tlnp | grep -E ':(80|443)\b'`. If one of them does,
that service becomes another site block in this same Caddyfile rather than a second
proxy.

- [ ] **Step 5: Write the deploy workflow**

`.github/workflows/deploy.yml` — on push to `main`, after the quality workflow passes,
SSH to the VPS, pull, build and restart:

```yaml
name: deploy
on:
  workflow_run:
    workflows: [quality]
    types: [completed]
    branches: [main]

jobs:
  deploy:
    if: github.event.workflow_run.conclusion == 'success'
    runs-on: ubuntu-latest
    steps:
      - uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: ${{ secrets.VPS_SSH_KEY }}
      - name: Deploy
        run: |
          ssh -o StrictHostKeyChecking=accept-new ${{ secrets.VPS_USER }}@${{ secrets.VPS_HOST }} '
            set -e
            cd /srv/portfolio
            git fetch --all && git reset --hard origin/main
            docker compose build portfolio
            docker compose up -d
            docker image prune -f
          '
```

Gating on `workflow_run` means a red test suite never reaches production.

- [ ] **Step 6: Put the secrets in the right two places**

On the VPS in `/srv/portfolio/.env.production`, mode `600`: every variable from spec §3.6.
In GitHub repo secrets: only `VPS_SSH_KEY`, `VPS_USER`, `VPS_HOST`.

`GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `SUPABASE_SECRET_KEY` and
`BOOKING_TOKEN_SECRET` live **only** in `.env.production` and are read at runtime. None
carries a `NEXT_PUBLIC_` prefix, so none can reach a browser bundle.

- [ ] **Step 7: Prove no secret shipped**

```bash
docker compose build portfolio
docker compose run --rm --entrypoint sh portfolio -c \
  "grep -rE 'GOOGLE_(CLIENT_SECRET|REFRESH_TOKEN)|SUPABASE_SECRET|BOOKING_TOKEN_SECRET' .next/static || echo clean"
```

Expected: `clean`. **If this prints a match, stop and do not deploy.**

- [ ] **Step 8: Set up email on the domain**

Cloudflare **Email Routing**: verify the domain, add `hi@mohammadmkh.dev` forwarding to
Mohammad's Gmail. Cloudflare writes the MX and SPF records itself. Free, five minutes,
and it gives the site a real address that is not a personal Gmail.

To *send* from that address later, add it in Gmail under "Send mail as" using an SMTP
relay — Resend is already an account here and will do it. Optional; forwarding alone is
enough to launch.

- [ ] **Step 9: Deploy and walk the whole site**

Merge and push:

```bash
git switch main
git merge --no-ff feat/v2
pnpm lint && pnpm typecheck && pnpm test:tokens && pnpm test:messages && pnpm test:unit && pnpm build && pnpm test
git push origin main
```

Then on the live domain: all four locales, both themes, contact form, and **one real
booking** — confirm the event appears in the calendar with a Meet link, both emails
arrive, and the cancel link frees the slot. Delete the test booking afterwards.

Also confirm `http://` redirects to `https://`, `www` redirects to apex, and `/`
resolves to `/en`.

- [ ] **Step 10: Write the runbook**

`docs/deployment.md`: the env-var table, how to rotate the Google refresh token, how to
read logs (`docker compose logs -f portfolio`), how to roll back (`git reset --hard
<sha> && docker compose up -d --build`), what to do when the calendar health check
reports down, and how to purge the Cloudflare cache after a deploy that changes static
assets.

- [ ] **Step 11: Update the README and commit**

What the site is, how to run it, where the spec and plans live, and one line noting that
v1 lives at the `v1-archive` tag.

```bash
git add Dockerfile docker-compose.yml deploy .github/workflows/deploy.yml docs/deployment.md README.md
git commit -m "feat: vps deploy behind cloudflare"
git push origin main
```

---

## Phase exit criteria

- [ ] `mohammadmkh.dev` serves v2 over HTTPS through Cloudflare, `/` redirects to `/en`, `www` redirects to apex
- [ ] All four locales, both themes, every route render correctly in production
- [ ] A real booking produces a calendar event with a Meet link and two emails; cancelling frees the slot
- [ ] The contact form stores a message and notifies
- [ ] Lighthouse ≥95 on all four categories for the four measured routes
- [ ] axe reports zero violations across every route × theme × direction
- [ ] No horizontal scroll at 320 / 375 / 414 / 768 px
- [ ] The 58 slop gates all answer "no", with any exception written down and justified
- [ ] `grep` of `.next/static` inside the built image finds no secret
- [ ] Cloudflare SSL mode is Full (strict) and the origin certificate is installed
- [ ] `hi@mohammadmkh.dev` forwards and arrives
- [ ] `v1-archive` tag still resolves and the README says so
