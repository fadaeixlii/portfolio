# Portfolio v2 — Design Spec

**Date:** 2026-09-19
**Status:** approved in chat, pending written review
**Supersedes:** everything under `src/` at commit `44ce063`
**Repo:** `professional-portfolio` → `https://github.com/fadaeixlii/portfolio`

---

## 1. What this is

A complete rebuild of the portfolio at **`mohammadmkh.dev`** from an empty `src/`. The current site stays
reachable as an archive tag and branch; nothing is deleted from history.

The brief pinned a visual reference — [`sawad.framer.website`](https://sawad.framer.website/) —
plus six additions the reference does not have: a scheduling page backed by a real calendar,
four locales including RTL Farsi, dual themes driven from one palette file, a skills/stack
page, per-project showcase pages, and an animated experience timeline.

### The one job

A founder or hiring manager at an early-stage EU startup lands here, understands in fifteen
seconds what Mohammad builds, and books a call. Every other page feeds that action.

| | |
|---|---|
| **Audience** | Founders, CTOs and hiring managers at early-stage, often accelerator-backed startups hiring remote in the EU. Technical enough to care what was built, impatient enough to skim. |
| **Primary action** | Book a call on `/schedule`. |
| **Tone** | Technical and austere. Not playful, not luxury, not "clean and modern". |
| **Anti-goal** | Walls of text. The current site's prose is three times longer than it needs to be. |

---

## 2. Design direction

### 2.1 Concept: instrument panel

Mohammad's work has one through-line: he builds systems that **count things**. Tokens and
their cost, euros through a billing pipeline, energy and water per chat, square metres of
funded forest, USDC settling on-chain, response times. The site should look like something
that measures — precise hairlines, numeric readouts set in mono, bento cells that read as
instrument modules rather than SaaS cards.

This is the anti-generic hook. It comes from the subject matter, so it can't be arrived at
by prompting for "a modern dark portfolio".

### 2.2 What is taken from the reference, and what is rejected

`sawad.framer.website` is a Framer **template demo** — it ships "Use Template for Free"
buttons, so other people run this exact design. The `hallmark` rule is extract DNA, never
copy pixels. The `frontend-design` rule adds that its dress is a named AI tell.

| Taken (structure) | Rejected (dress) | Why |
|---|---|---|
| Bento-grid macrostructure | Orange `#F46C38` + lime `#C5FF41` | Anti-pattern: near-black + one acid accent. Also a literal clone. |
| Oversized two-tone display headline | Poppins | Default geometric sans; the template's own face. |
| Floating pill nav (N5) | Second accent colour | Boldness spends in one place. |
| Card-led work and tools sections | Fade-up on every section | Named as the clearest generated-page signature by both design skills. |
| Stat row in the hero | The template's invented stats | Every number here must be verifiable. |
| Statement footer (Ft5) | Four-column link footer (Ft3) | Ft3 is the most-recognised footer tell. |

### 2.3 Palette

Two layers. **Layer 1 is the only place a colour is ever authored.**

```css
/* Layer 1 — raw ramps. Change the site's colour here and nowhere else. */
--slate-50 … --slate-950   /* blue-tinted neutral, hue 255 */
--amber-300 … --amber-700  /* the signal, hue 78 */
--red-500 --green-500      /* state only: error, success */

/* Layer 2 — semantic aliases, remapped per theme.
   Deliberately NOT in the --color-* namespace: that belongs to Tailwind's
   @theme, and `--color-paper: var(--color-paper)` resolves to itself. */
--paper --surface --surface-raised
--ink --ink-dim --hairline
--signal --signal-ink --focus --error --success

/* Layer 3 — Tailwind bridge, in globals.css */
@theme inline { --color-paper: var(--paper); --color-text: var(--ink); ... }
```

Anchors:

| Token | Dark | Light |
|---|---|---|
| `--paper` | `oklch(15% 0.015 255)` | `oklch(97% 0.004 255)` |
| `--surface` | `oklch(20% 0.016 255)` | `oklch(99% 0.002 255)` |
| `--ink` | `oklch(97% 0.004 255)` | `oklch(15% 0.015 255)` |
| `--signal` | `oklch(80% 0.145 78)` | `oklch(62% 0.145 68)` |

The light theme is **cool near-white, never cream** — `#F4F1EA`-family backgrounds are a
named generated-design tell. The signal darkens in light mode to hold contrast on white.

Banned anywhere in the codebase: hex literals, `rgb()`, raw `oklch()` outside Layer 1, and
any Tailwind colour utility that isn't token-backed (`bg-red-500` etc.). Enforced by lint.

### 2.4 Type

| Role | Face | Why |
|---|---|---|
| Display | **Archivo** variable (`wght` 100–900, `wdth` 62–125) | Free, grotesque, and the width axis is a real design tool almost nobody uses — set Expanded Black at 120px it is unmistakable and is not Poppins. |
| Body / UI | **Vazirmatn** variable | One family covering Latin, Persian and Arabic, so the Farsi locale never falls back to a system font mid-paragraph. SIL OFL. |
| Numerals | **JetBrains Mono** variable | Used **only** for actual numeric readouts and code. Never for labels, eyebrows or nav — mono-as-label is a tell. |

Display headlines are always roman. No italic headings — a hard gate.

Scale is a modular ramp on `clamp()`; `--text-display` peaks around `clamp(3.5rem, 11vw, 9rem)`
with `line-height: 0.9` and `letter-spacing: -0.03em`. Body measure caps at 68 characters.

For the Farsi locale, display falls back to Vazirmatn Black (Archivo has no Arabic coverage)
and `letter-spacing` resets to `0` — negative tracking breaks Arabic-script joining.

### 2.5 Motion

**One orchestrated moment.** On first load of the home page the hero boots like an
instrument: the hairline grid draws in, then the three stat readouts count once from zero to
their real values, then the headline's two tone-halves resolve. It runs once per session,
gated on `useReducedMotion()`, and it is the only non-user-triggered sequence on the site.

Everywhere else motion answers an action or a scroll position:

| Where | What | Type |
|---|---|---|
| Every section | `<Reveal>` — opacity + 16px translate, `once: true` | Scroll-triggered |
| Grids and lists | `<Stagger>` — 60ms between children, capped at 8 | Scroll-triggered |
| Experience timeline | Progress rail scrubbed by `useScroll`/`useTransform` | Scroll-linked |
| Cards, buttons | ≤150ms transform/opacity on hover and press | User-triggered |
| Booker | Layout transitions between month → day → slot → form | User-triggered |

`<Reveal>` wraps **every** section, matching the reference. Two guards keep it from reading
as the generated-page default: the hero boot sequence is a genuinely different motion so the
top of the page does not open with the same fade as everything under it, and reveals use
`once: true` with a 12% viewport margin so nothing re-animates on scroll-back. A single
`MOTION.reveal.enabled` flag in `src/lib/motion.ts` turns the whole behaviour off if it ever
needs to go.

Rules: `transform` and `opacity` only, never layout properties. Three named easings
(`--ease-out`, `--ease-in`, `--ease-in-out`), never the browser default. `prefers-reduced-motion`
collapses everything to a ≤150ms crossfade and freezes the counters at their final values.
Focus rings never animate.

### 2.6 Glass surfaces

Glass is the default surface across the whole site — navbar, cards, the booker, modals.
Browser support, verified 2026-09-19:

| Technique | Chrome | Safari | Firefox | Verdict |
|---|---|---|---|---|
| `backdrop-filter: blur() saturate()` | 76+ | 9+ | **103+** | universal |
| Gradient overlay, inner highlight, shadow | all | all | all | universal |
| `backdrop-filter: url(#svg-filter)` | yes | **no** (WebKit #245510) | **parses, renders nothing** | Chromium only |

So the shipped default is the **tinted-and-layered** tier: blur + saturate, a translucent
tint floor, a gradient overlay, a 1px inner highlight on the top edge, and a soft drop
shadow. It is pure paint, costs almost nothing beyond the blur, and carries most of the
perceived quality of the Apple effect. It runs everywhere.

| Variant | Technique | Used on |
|---|---|---|
| `glass` **(default)** | blur(16px) saturate(140%) + tint floor + gradient overlay + inner top highlight + shadow | Navbar, every card, booker panels, modals |
| `glass-refracted` | `glass` + SVG `feDisplacementMap` edge distortion | Navbar only, and only where a **runtime probe** confirms it renders |
| `flat` | Solid `--surface` + hairline | Escape hatch where a blur would cost too much (long scrolling lists) |

Firefox's parse-as-valid-then-render-nothing behaviour means `@supports` is not a usable
test. `useBackdropSvgSupport()` paints a probe element to an offscreen canvas once on mount
and reads a pixel; only a real displacement flips the variant on. Everyone else keeps the
universal tier and sees no difference worth naming.

Three legibility and cost rules, non-negotiable:

- **Tint floor, not a whisper.** The translucent fill sits at ~62% opacity so text on glass
  has a contrast floor independent of what scrolls behind it.
- **Blur capped at 16px.** Cost scales with radius and past ~20px nobody can tell.
- **No body copy on glass.** Chrome, navigation, headings and single-line labels only.
  Paragraphs sit on `--paper`.

### 2.7 Structural picks (hallmark)

- **Genre:** atmospheric (dark, AI/technical subject)
- **Macrostructure:** Bento Grid — pinned by the brief
- **Nav:** N5 floating pill — pinned by the brief, carries the glass
- **Footer:** Ft5 statement — one line plus the booking CTA, explicitly not Ft3
- **Hero enrichment:** none. Typography plus live readouts; no stock imagery, no fake browser chrome, no invented dashboard mockups.

Stamp every generated stylesheet and seed `.hallmark/log.json` so later runs rotate.

---

## 3. Architecture

### 3.1 Stack

| Layer | Choice | Note |
|---|---|---|
| Framework | Next.js 16 App Router, React 19, React Compiler | already in repo |
| Language | TypeScript 5.9 strict | `any` requires a `// TODO(reason)` |
| Styles | Tailwind v4 CSS-first `@theme inline` | no `tailwind.config.ts` |
| Motion | `motion` v12 (`motion/react`) | **never** import `framer-motion` |
| i18n | `next-intl` | `[locale]` segment, `localePrefix: 'always'` |
| Theme | `next-themes` | `class` strategy, `data-theme` attribute |
| Data | Supabase (`@supabase/ssr`) | contact messages + bookings only |
| Email | Resend | confirmations and notifications |
| Calendar | Google Calendar REST v3 via `fetch` | **zero new dependencies** |
| Time | `@date-fns/tz` | slot maths; Intl-backed, small |
| Validation | Zod v4 + React Hook Form v7 | already in repo |
| Package manager | pnpm | fail loudly on npm/yarn |
| Host | **Own VPS, Cloudflare in front** | Same box that already runs `job` and `outreach`. Cloudflare's free proxy supplies the edge cache, TLS and DDoS absorption. |

**Removed:** `next-mdx-remote`, `@types/mdx`, `shadcn`, `@base-ui/react`, `plaiceholder`
(no blog, no MDX, component kit is hand-built to the token system).

**Build output:** `output: 'standalone'` — Next.js traces only the files the server actually needs, so the artifact copied to the VPS is tens of megabytes rather than a whole `node_modules`.

**Deliberately not added:** `googleapis` (~2 MB to replace three `fetch` calls),
`react-bits` as a dependency (it is MIT + Commons Clause and ships as copy-paste source —
two components get vendored into `src/components/motion/` with attribution, not installed),
any date library beyond `@date-fns/tz`, any UI kit.

### 3.2 Routes

```
src/app/
  [locale]/
    layout.tsx               html lang + dir, theme provider, nav, footer
    page.tsx                 home — bento
    work/page.tsx            project index
    work/[slug]/page.tsx     case-study showcase
    experience/page.tsx      timeline
    stack/page.tsx           skills + tools
    schedule/page.tsx        booker
    contact/page.tsx         form
    styleguide/page.tsx      dev-only, noindex — tokens, components, both themes, RTL
  admin/                     unlocalised, auth-gated: messages + bookings
  api/
    availability/route.ts
    book/route.ts
    booking/[token]/route.ts cancel + reschedule
    contact/route.ts
```

No blog. No playground. `/styleguide` is `noindex` and excluded from the sitemap.

### 3.3 Directory layout

```
src/
  app/                    routes only — no business logic
  components/
    primitives/           Surface, Reveal, Readout, Hairline, Button, Field
    layout/               NavPill, Footer, LocaleSwitch, ThemeToggle
    home/                 HeroBento, StatRow, SelectedWork, ...
    work/                 ProjectCard, CaseStudyHeader, ...
    experience/           Timeline, TimelineEntry, ProgressRail
    schedule/             Booker, MonthGrid, SlotList, BookingForm, TimezonePicker
  content/                typed TS — projects, experience, stack, case studies
  lib/
    calendar/             google.ts, availability.ts, slots.ts
    supabase/             server.ts, client.ts
    i18n/                 routing.ts, request.ts
    email/                resend.ts, templates/
    seo/                  metadata.ts, og.tsx
  messages/               en.json, de.json, nl.json, fa.json
  styles/
    tokens.css            Layer 1 + Layer 2 — the only colour authority
    globals.css           @import tailwindcss, @theme inline, base
```

Content moves from JSON to typed TypeScript so a bad field is a build error, not a runtime
blank. Case studies move from MDX to typed objects — there is no blog, so MDX earns nothing.

### 3.4 Internationalisation

Locales: `en` (default), `de`, `nl`, `fa`. `localePrefix: 'always'`, so `/en/work`, `/fa/work`.

- `<html lang={locale} dir={locale === 'fa' ? 'rtl' : 'ltr'}>`
- **Logical properties only** in components: `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`.
  Physical `ml-/mr-/pl-/pr-/left-/right-` are lint errors.
- Directional icons (arrows, chevrons, the timeline rail) flip via `rtl:-scale-x-100`.
- Farsi uses Persian digits through `Intl.NumberFormat('fa-IR')`; the mono readouts keep
  Latin digits in `en/de/nl` and switch in `fa`.
- Dates and times always through `Intl.DateTimeFormat` with an explicit `timeZone`.

**Translation honesty:** `en` is authored. `de`, `nl`, `fa` are machine-translated and
carry `"_status": "machine"` in each message file until a native speaker clears them. The
locale switcher shows all four regardless; the marker is for the repo, not the visitor.

### 3.5 Scheduling subsystem

The largest single piece. Free, native, themeable, translatable, no third-party iframe.

**Auth.** One-time manual OAuth consent by Mohammad produces a long-lived refresh token
stored as `GOOGLE_REFRESH_TOKEN`. Server exchanges it for a short-lived access token per
request, cached in module memory until 60s before expiry. Scope:
`https://www.googleapis.com/auth/calendar` (needs write for `events.insert`).

**Availability** — `GET /api/availability?from=&to=&tz=`

1. Generate candidate slots from config: `Asia/Tehran`, **09:00–18:00, Monday–Friday**,
   30-minute slots, 15-minute buffer, minimum 12h notice, 28-day horizon. Those hours
   read 06:30–15:30 in Berlin in winter, which is what makes an EU founder's afternoon
   bookable at all — 08:00–16:00 Tehran would have stopped at their 13:30.
2. `POST https://www.googleapis.com/calendar/v3/freeBusy` for the window.
3. Subtract busy blocks, blackout dates, and `bookings` rows not in `cancelled`.
4. Return slots as UTC ISO strings. The client renders them in the visitor's timezone.

All maths in UTC. The Tehran wall-clock window converts per-date via `@date-fns/tz` — Iran
abolished DST in 2022 but the offset is never hardcoded.

**Booking** — `POST /api/book`

1. Zod-validate; honeypot field plus a minimum time-on-form check.
2. Rate-limit by IP through the existing Supabase rate-limit function pattern.
3. Re-run availability for that one slot. A slot that vanished returns `409`.
4. `INSERT` into `bookings`. The table has `UNIQUE (start_at) WHERE status <> 'cancelled'` —
   **the database is the double-booking guard**, not application logic.
5. `POST /calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all`
   with `conferenceData.createRequest` so Google mints the Meet link and mails both parties.
6. Store `google_event_id` and the Meet URL on the row.
7. Resend confirmation to the visitor, notification to Mohammad. Attach an `.ics`.
8. If step 5 fails after step 4 succeeded, mark the row `orphaned` and alert — never leave a
   booking the calendar doesn't know about without a trace.

**Cancel / reschedule** — `GET|POST /api/booking/[token]`, where `token` is an HMAC of the
booking id signed with `BOOKING_TOKEN_SECRET`. Cancel patches the Google event and sets
`status='cancelled'`, freeing the unique index.

**Schema** — `supabase/migrations/<ts>_create_bookings.sql`

```sql
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  start_at timestamptz not null,
  end_at timestamptz not null,
  name text not null,
  email text not null,
  topic text,
  notes text,
  locale text not null default 'en',
  visitor_tz text not null,
  status text not null default 'confirmed'
    check (status in ('confirmed','cancelled','orphaned')),
  google_event_id text,
  meet_url text
);
create unique index bookings_slot_unique
  on public.bookings (start_at) where status <> 'cancelled';
```

RLS on, no anon policies — every write goes through the service key in a route handler.

**Config** — `src/lib/calendar/config.ts` holds working hours (09:00–18:00 `Asia/Tehran`),
days (Mon–Fri), slot length, buffer, notice, horizon and blackout dates. One file, typed,
no magic numbers elsewhere.

### 3.6 Environment

```
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY / SUPABASE_SECRET_KEY
RESEND_API_KEY / CONTACT_TO_EMAIL / CONTACT_FROM_EMAIL
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REFRESH_TOKEN / GOOGLE_CALENDAR_ID
BOOKING_TOKEN_SECRET
```

`.env.local` stays gitignored; the pre-commit hook already blocks secret patterns and gains
`GOOGLE_REFRESH_TOKEN` and `BOOKING_TOKEN_SECRET`.

**Manual step Mohammad must do once** (documented in `docs/google-calendar-setup.md`):
create a Google Cloud project, enable the Calendar API, configure an OAuth consent screen in
Testing with his own account as the sole test user, create a Web OAuth client, then run
`pnpm calendar:auth` — a local script that prints a consent URL and exchanges the returned
code for the refresh token.

---

## 4. Content

### 4.1 Sources

Reuse as **source material**, rewrite every line: `src/content/{projects,experience,skills,site}.json`
and the eight case studies. Copy is authored in `en` only.

### 4.2 Confirmed facts — these are the canon for this site

Settled 2026-09-19 against `resume/current/Mohammad_MKH_{AI_Engineer,FullStack}_2026-09-17.md`.
**Where this table and `docs/06-identity-canon.md` disagree, this table wins** — it is taken
from the CVs, and the CV wins every conflict.

| Field | Value |
|---|---|
| Display name | **Mohammad M. Khani** |
| First name | Mohammad |
| Surname | MohammadKhani |
| Full name (formal contexts only) | Mohammad MohammadKhani |
| Domain | `mohammadmkh.dev` |
| LinkedIn | `/in/mohammadmkh` |
| Email | `mmohammadkhani408@gmail.com` |
| Location | Athens, Greece · EU Citizen (Greek passport) |
| Degree | **B.S. Computer Science**, Quchan University of Technology — graduated |
| Phone | **never published on the site** |

**Dates — the CV's, used verbatim:**

| Role | Company | Period |
|---|---|---|
| AI Engineer & Full-Stack Developer | aim2balance.ai, Germany | Nov 2025 – Sep 2026 |
| Full-Stack Developer | Zoof-it, Netherlands | Mar 2025 – Feb 2026 |
| Senior Frontend Developer | Exmodules | Sep 2024 – Feb 2025 |
| Senior Frontend Developer | Intex exchange | Nov 2022 – Aug 2024 |
| Frontend Developer | Panikar Academy | Mar 2020 – Sep 2022 |
| Frontend Developer | 3gaam | Feb 2019 – Feb 2020 |

Two consequences:

- Career starts **Feb 2019**, so the hero readout reads `2019` and the honest span is seven
  years and seven months. "Since 2019" is the phrasing; a rounded year count is not needed.
- aim2balance and Zoof-it **overlap Nov 2025 – Feb 2026**. The experience timeline carries one
  clause explaining it rather than leaving a reader to spot it: full-time at Zoof-it through
  November 2025, then on contract while aim2balance started.

**Featured work:** aim2balance, Roofcast, Jeofferte lead the home page. Every other project —
Meshi, Intex exchange, Panikar, Exmodules, 3gaam and the Chrome extension — lives on `/work`
with its own case study. Nothing is dropped, only ranked.

**Imagery:** the v1 library at `public/images/projects/` carries 47 real screenshots across 11
projects, including logged-in product views. Use those. Live re-captures of the public URLs
are worthless for aim2balance (sign-in wall) and thin elsewhere. Each case study shows a
screenshot **and** links the live URL.

**Portrait:** `MyPhoto.JPG` in the workspace root — 6000×4000 studio headshot on a neutral
warm ground. Crop to portrait, apply the amber duotone in the identity cell, and export AVIF
plus WebP at 2×. Copy it into `public/images/portrait.jpg` rather than reading it from outside
the repo.

### 4.3 Claim rules — binding

Copy is governed by the confirmed-facts table in §4.2, then by `docs/06-identity-canon.md` in the workspace root and by the proof-point
list in the `outreach-writer` skill's `profile/mohammad.md`. That skill is invoked when the
copy task runs; its verified/unverified split is the source of truth.

**Removed from the site entirely:**

| Claim | Where it is today | Why |
|---|---|---|
| "10,000+ daily sessions" | site.json, experience.json, projects.json | marked UNVERIFIED — a capacity figure, not an analytics reading |
| "sub-second transaction latency" | same | names no operation, no percentile |
| "100% deployment success rate" | experience.json | denominator is 2 |
| "Resolved five critical API failures" | projects.json | counts tickets |
| "40% content-management reduction", "14 → 5 bugs per sprint", "10–15% build gain", "5% cost reduction" | various | no source |
| `+44 7828 796868` | site.json | reads as UK residency; canon forbids publishing it |
| "Greece & Iran", "Athens & Mashhad" | site.json | the CV says Athens, Greece |
| "Seven years" / "7+ years" | site.json, bio | superseded: the CV dates start Feb 2019, so the span is 7y7m. Use "since 2019" rather than a rounded count — it is precise and needs no arithmetic from the reader. |
| "co-founder", "currently at aim2balance" | assorted | explicitly forbidden |

**Numbers that may appear, each traceable:**

| Number | Source |
|---|---|
| "since 2019" | career start Nov 2019 |
| 9 shipped products | projects list |
| 3 EU model providers | outreach proof point P2 |
| 4.2s → 2.9s (Intex, PWA caching) | proof point P5 |
| 8 days → 5 days (component library) | proof point P5 |
| 5,000+ users (Panikar) | CV, verified |

LinkedIn link uses `/in/mohammadmkh`. Location is Greece. aim2balance is past tense.

### 4.3 Voice

Run `no-ai-slop` over every user-facing string before it ships. Specifics:

- No ALL-CAPS eyebrow labels above headings.
- No `A · B · C` middle-dot meta strings.
- No `→` appended to link and button text.
- No `01 / 02 / 03` numbering unless the content is genuinely ordinal — the experience
  timeline qualifies, the work grid does not.
- Buttons name what happens: "Book a call", not "Get started".
- One idea per line. If a sentence can lose half its words, it does.

---

## 5. Quality floor

Non-negotiable on every page, enforced in CI:

- **Responsive** at 320 / 375 / 414 / 768 px. No horizontal scroll; `overflow-x: clip` on
  `html` and `body`, never `hidden`. No two-line clickable text. Image grid tracks use
  `minmax(0, 1fr)`. Display headers set `overflow-wrap: anywhere; min-width: 0`.
- **A11y** WCAG 2.2 AA. Visible `:focus-visible` ring at ≥3:1, never animated. Full keyboard
  path through nav, locale switch, theme toggle and the entire booker. `axe-core` clean via
  Playwright on every route × both themes × `en` + `fa`.
- **Performance** Lighthouse ≥95 on all four categories. LCP <2.5s on throttled 4G.
  Per-route JS delta <30 KB gzipped without written justification.
- **Motion** every animated component consults `useReducedMotion()`.
- **Tokens** no hex, no `rgb()`, no raw `oklch()` outside `tokens.css`, no physical-direction
  utilities. Custom ESLint rules; these fail the build.
- **Slop test** the 58 `hallmark` gates run before launch; every answer must be "no".

---

## 6. Phases

Each phase ends with something that runs, is testable, and could ship.

| # | Phase | Deliverable | Detailed plan |
|---|---|---|---|
| 1 | Foundation | v1 archived; empty app boots in 4 locales and 2 themes with the token system, layout shell and CI gates | `plans/2026-09-19-phase-1-foundation.md` |
| 2 | Design system | `/styleguide` renders every primitive in both themes and both directions; motion primitives land | written at phase start |
| 3 | Content pages | home, work, work/[slug], experience, stack — real rewritten copy, all four locales | written at phase start |
| 4 | Scheduling | working booker end-to-end against the real calendar | written at phase start |
| 5 | Launch | contact, admin, SEO/OG, a11y + perf + slop passes, deploy | written at phase start |

**Phase 2 task list.** Token primitives (`Surface`, `Hairline`, `Readout`, `Button`, `Field`)
with eight states each · `Reveal` and `Stagger` motion primitives · `CountUp` readout ·
the boot sequence orchestrator · `NavPill` with the three glass variants · `Footer` (Ft5) ·
`ThemeToggle` and `LocaleSwitch` · `/styleguide` route · vendored react-bits components with
attribution · Playwright visual snapshots across theme × direction.

**Phase 3 task list.** Typed content schema and migration from JSON · copy rewrite under
`outreach-writer` + `no-ai-slop` (the gate in §4.2 runs here) · `HeroBento` + boot sequence ·
`StatRow` with verified figures · `SelectedWork` grid · work index · case-study template and
all nine entries · `Timeline` with scroll-linked rail · `stack` page · `de`/`nl`/`fa` message
files generated and marked · RTL audit pass.

**Phase 4 task list.** `docs/google-calendar-setup.md` + `pnpm calendar:auth` script ·
`lib/calendar/google.ts` token exchange with caching · `slots.ts` generator (pure, heavily
tested: DST, month boundaries, buffers, notice) · `availability.ts` composing freeBusy +
bookings · `GET /api/availability` · bookings migration + RLS · `POST /api/book` with the
409 race path and the orphan path · Google event creation with Meet · Resend templates +
`.ics` · `Booker` UI (month → day → slot → form → confirmed) · timezone picker ·
cancel/reschedule token routes · four-locale strings for the whole flow.

**Phase 5 task list.** Contact form on the new system · admin messages + bookings views ·
`generateMetadata` and `opengraph-image` per route · sitemap with `hreflang` · robots ·
axe sweep · Lighthouse budget · the 58-gate slop test · `tokens.css` export and
`.hallmark/log.json` · domain, Cloudflare DNS + origin cert, Docker/Caddy on the VPS, deploy
workflow, email routing · archive note in the README.

---

## 7. Risks

| Risk | Mitigation |
|---|---|
| Booker is ~60% of the engineering and touches OAuth | Phase 4 is isolated; slot generation is a pure, exhaustively tested module with no network |
| Google refresh token can be revoked silently | Health check route; booker degrades to "email me instead" rather than showing an empty calendar |
| Double booking under concurrency | Partial unique index in Postgres, not application logic |
| Four locales × every string | `en` authored, others machine-translated and marked; the RTL layout is tested, the Farsi *wording* is explicitly provisional |
| Design lands wrong after eight pages exist | Phase 2 ships `/styleguide` for approval before any page is built |
| Losing v1 | Tag plus branch before the first deletion; nothing is force-pushed |

---

## 8. Archive procedure

```bash
git tag -a v1-archive -m "portfolio v1, final state" 44ce063
git branch archive/v1 44ce063
git push origin v1-archive archive/v1
git switch -c feat/v2
```

Then `src/` is emptied on `feat/v2` only. `supabase/migrations/` is kept — the contact
table and its rate-limit function carry forward. `main` is untouched until v2 is ready to
merge, so the live site keeps serving v1 throughout.
