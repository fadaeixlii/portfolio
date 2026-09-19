# Portfolio v2 · Phase 3 — Content Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the five content pages — home, work index, case study, experience, stack — with rewritten copy that carries no unverifiable claim, in four locales, both themes, both directions.

**Architecture:** Content moves from untyped JSON to typed TypeScript modules so a missing field is a build error. Pages compose the Phase 2 primitives and add nothing new to the token system. The home hero is the site's one orchestrated motion moment; everything else uses the shared `Reveal`/`Stagger` pair.

**Tech Stack:** React 19 server components, `next-intl`, `motion` v12, Phase 2 primitives, Zod for content validation at build time.

**Spec:** `docs/superpowers/specs/2026-09-19-portfolio-v2-design.md` — especially §4 (Content) and §2.5 (Motion).

**Depends on:** Phase 2 complete — every primitive exists and `/styleguide` is green.

## Global Constraints

- Everything in Phase 2's Global Constraints still binds.
- **No claim may appear that is not traceable.** The removal list in spec §4.2 is mandatory. Banned outright: "10,000+ daily sessions", "sub-second latency", "100% deployment success", "resolved five critical API failures", "40% content-management reduction", "14 → 5 bugs per sprint", "10–15% build gain", "5% cost reduction", the `+44` phone number, "Greece & Iran", "Athens & Mashhad", "seven years", "7+ years", "co-founder", any present-tense claim about aim2balance.
- **Permitted numbers, each with a source:** since 2019 · 9 shipped products · 3 EU model providers · 4.2s → 2.9s · 8 days → 5 days · 5,000+ users (Panikar).
- Display name is **Mohammad M. Khani** (first name Mohammad, surname MohammadKhani). Location is **Athens, Greece**; EU citizen, Greek passport.
- Degree is **B.S. Computer Science**, Quchan University of Technology — the CV's wording, not the canon's "Computer Engineering".
- LinkedIn is `/in/mohammadmkh`. Domain is `mohammadmkh.dev`. aim2balance is **past tense**.
- Dates are the CV's, verbatim: aim2balance Nov 2025–Sep 2026 · Zoof-it Mar 2025–Feb 2026 · Exmodules Sep 2024–Feb 2025 · Intex Nov 2022–Aug 2024 · Panikar Mar 2020–Sep 2022 · 3gaam Feb 2019–Feb 2020.
- The aim2balance/Zoof-it overlap (Nov 2025–Feb 2026) gets one explaining clause on the timeline, never silence.
- Copy rules: no ALL-CAPS eyebrows, no `A · B · C` middle-dot strings, no `→` appended to link text, no `01/02/03` numbering except the experience timeline, buttons name what happens.
- Body copy never sits on a glass surface.
- **Every page under `[locale]` follows this exact shape**, or the route silently stops being
  prerendered and the performance budget fails:

  ```tsx
  import { use } from "react";
  import { setRequestLocale } from "next-intl/server";
  import { useTranslations } from "next-intl";

  export default function SomePage({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }) {
    const { locale } = use(params);   // use(), never await — await forces async
    setRequestLocale(locale);          // before any next-intl hook
    const t = useTranslations("...");
    // ...
  }
  ```

  For a dynamic segment such as `work/[slug]`, the params type is
  `Promise<{ locale: string; slug: string }>` and both values come out of the same `use()`.
  After every task in this phase, `pnpm build` must still show these routes prerendered.

---

### Task 1: Typed content schema

**Files:**
- Create: `src/content/schema.ts`, `src/content/index.ts`
- Test: `tests/unit/content.test.ts`

**Interfaces:**
- Produces: types `Project`, `ExperienceEntry`, `StackGroup`, `CaseStudy`; loaders `getProjects()`, `getProject(slug)`, `getExperience()`, `getStack()`, `getCaseStudy(slug)`; all validate at module load and throw on malformed data

- [ ] **Step 1: Write the failing test**

`tests/unit/content.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getProjects, getExperience, getStack } from "@/content";

const BANNED = [
  "10,000", "10k+", "sub-second", "100% deployment", "five critical",
  "40%", "14 to 5", "10-15%", "+44", "Greece & Iran", "Athens & Mashhad",
  "seven years", "7+ years", "co-founder",
];

describe("content", () => {
  it("loads projects with required fields", () => {
    const projects = getProjects();
    expect(projects.length).toBeGreaterThan(0);
    for (const p of projects) {
      expect(p.slug).toMatch(/^[a-z0-9-]+$/);
      expect(p.summary.length).toBeLessThanOrEqual(140);
    }
  });

  it("carries no banned claim anywhere in the content tree", () => {
    const blob = JSON.stringify([getProjects(), getExperience(), getStack()]);
    for (const phrase of BANNED) {
      expect(blob.toLowerCase()).not.toContain(phrase.toLowerCase());
    }
  });

  it("orders experience newest first", () => {
    const years = getExperience().map((e) => e.startYear);
    expect([...years].sort((a, b) => b - a)).toEqual(years);
  });
});
```

- [ ] **Step 2: Run, watch it fail**

Run: `pnpm test:unit`
Expected: FAIL — `@/content` not found.

- [ ] **Step 3: Write `src/content/schema.ts`**

```ts
import { z } from "zod";

export const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  /** One line an eight-year-old could follow. Hard cap keeps the grid honest. */
  summary: z.string().max(140),
  domain: z.string(),
  year: z.number().int().min(2018).max(2030),
  role: z.string(),
  stack: z.array(z.string()).min(1).max(8),
  href: z.string().url().optional(),
  featured: z.boolean().default(false),
});

export const experienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  startYear: z.number().int(),
  period: z.string(),
  location: z.string(),
  /** Two sentences maximum. The timeline is scanned, not read. */
  summary: z.string().max(260),
  products: z.array(z.string()).default([]),
  stack: z.array(z.string()).min(1).max(10),
});

export const stackGroupSchema = z.object({
  name: z.string(),
  items: z.array(z.string()).min(1),
});

export const caseStudySchema = z.object({
  slug: z.string(),
  problem: z.string(),
  approach: z.array(z.string()).min(2).max(6),
  outcome: z.string(),
  /** Only numbers with a source. Empty is acceptable and often correct. */
  figures: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .max(3)
    .default([]),
});

export type Project = z.infer<typeof projectSchema>;
export type ExperienceEntry = z.infer<typeof experienceSchema>;
export type StackGroup = z.infer<typeof stackGroupSchema>;
export type CaseStudy = z.infer<typeof caseStudySchema>;
```

- [ ] **Step 4: Write `src/content/index.ts` with the loaders**

```ts
import {
  projectSchema, experienceSchema, stackGroupSchema, caseStudySchema,
  type Project, type ExperienceEntry, type StackGroup, type CaseStudy,
} from "./schema";
import { projects } from "./projects";
import { experience } from "./experience";
import { stack } from "./stack";
import { caseStudies } from "./case-studies";

/** Parse once at module load so bad content fails the build, not a request. */
const PROJECTS: Project[] = projectSchema.array().parse(projects);
const EXPERIENCE: ExperienceEntry[] = experienceSchema.array().parse(experience);
const STACK: StackGroup[] = stackGroupSchema.array().parse(stack);
const CASE_STUDIES: CaseStudy[] = caseStudySchema.array().parse(caseStudies);

export function getProjects(): Project[] {
  return [...PROJECTS].sort((a, b) => b.year - a.year);
}

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return getProjects().filter((p) => p.featured);
}

export function getExperience(): ExperienceEntry[] {
  return [...EXPERIENCE].sort((a, b) => b.startYear - a.startYear);
}

export function getStack(): StackGroup[] {
  return STACK;
}

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((c) => c.slug === slug);
}
```

- [ ] **Step 5: Commit the schema (data lands in Task 2)**

```bash
git add src/content/schema.ts src/content/index.ts tests/unit/content.test.ts
git commit -m "feat: typed content schema"
```

---

### Task 2: Rewrite the copy

**REQUIRED SUB-SKILLS for this task:** invoke `anthropic-skills:outreach-writer` to load the verified proof-point list and the forbidden-claim patterns, then `no-ai-slop` on every string before committing.

**Files:**
- Create: `src/content/projects.ts`, `src/content/experience.ts`, `src/content/stack.ts`, `src/content/case-studies.ts`
- Read (source only): the v1 JSON at `git show v1-archive:src/content/projects.json` etc.

**Interfaces:**
- Consumes: the schemas from Task 1
- Produces: validated content arrays `projects`, `experience`, `stack`, `caseStudies`

- [ ] **Step 1: Recover the v1 content as source material**

```bash
mkdir -p .scratch
git show v1-archive:src/content/projects.json > .scratch/v1-projects.json
git show v1-archive:src/content/experience.json > .scratch/v1-experience.json
git show v1-archive:src/content/skills.json > .scratch/v1-skills.json
git show v1-archive:src/content/site.json > .scratch/v1-site.json
```

`.scratch/` is gitignored. This is **source material to rewrite from, never to copy**.

- [ ] **Step 2: Load the claim rules**

Invoke `anthropic-skills:outreach-writer`. From it, take `profile/mohammad.md`'s proof points P1–P7 and its UNVERIFIED list. Cross-check against `../../docs/06-identity-canon.md` in the workspace root. Write the resulting allow/deny list into `.scratch/claims.md` before writing a single line of copy.

- [ ] **Step 3: Write `src/content/projects.ts`**

Nine entries. Each `summary` is one sentence under 140 characters that an eight-year-old could follow, carrying three keywords. Example shape — aim2balance:

```ts
import type { z } from "zod";
import type { projectSchema } from "./schema";

/** Input type, not output: `featured` has a schema default, so it is optional here. */
export const projects: z.input<typeof projectSchema>[] = [
  {
    slug: "aim2balance",
    name: "aim2balance.ai",
    summary:
      "An EU-hosted AI chat service that pays for reforestation out of the energy each conversation uses.",
    domain: "AI platform",
    year: 2026,
    role: "AI Engineer & Full-Stack Developer",
    stack: ["TypeScript", "Python", "LiteLLM", "LangGraph", "NestJS", "PostgreSQL", "Stripe"],
    href: "https://platform.aim2balance.ai",
    featured: true,
  },
  // ... Jeofferte, Roofcast, Meshi, Intex, Panikar, Exmodules, 3gaam, the Chrome extension
];
```

Write the remaining eight in the same shape from `.scratch/v1-projects.json`, stripping every banned number.

- [ ] **Step 4: Write `src/content/experience.ts`**

Six entries, newest first. `summary` is two sentences maximum. aim2balance is **past tense**. Zoof-it carries the overlap clause. Example:

```ts
import type { ExperienceEntry } from "./schema";

export const experience: ExperienceEntry[] = [
  {
    company: "aim2balance.ai",
    role: "AI Engineer & Full-Stack Developer",
    startYear: 2025,
    period: "Nov 2025 — Sep 2026",
    location: "Germany · Remote",
    summary:
      "Built an EU-hosted AI chat service from an empty repo to production: a model gateway over three EU providers, agents with retrieval, and EUR billing.",
    products: ["Model gateway", "Billing pipeline", "Chrome extension"],
    stack: ["TypeScript", "Python", "LiteLLM", "FastAPI", "LangGraph", "NestJS", "MongoDB", "PostgreSQL", "Stripe"],
  },
  // ... Zoof-it, Exmodules, Intex exchange, Panikar Academy, 3gaam
];
```

- [ ] **Step 5: Write `stack.ts` and `case-studies.ts`**

`stack.ts` — six groups from the v1 skills file, minus anything inventory-only that Mohammad could not be interviewed on. `case-studies.ts` — nine entries, each `problem` one sentence, `approach` three to five bullets, `outcome` one sentence, `figures` only where a number has a source (most will be empty, which is correct).

- [ ] **Step 6: Run `no-ai-slop` over every string**

Invoke the `no-ai-slop` skill against `src/content/*.ts`. Apply its edits. Then verify by eye: no sentence survives that could lose half its words.

- [ ] **Step 7: Run the claim guard**

Run: `pnpm test:unit`
Expected: PASS — the banned-phrase test in Task 1 is the automated half of this gate. **Prove it can fail first:** temporarily add `"10,000+ daily sessions"` to any summary, run, watch it go red, remove it.

- [ ] **Step 8: Commit**

```bash
git add src/content
git commit -m "content: rewritten, claim-clean copy"
```

---

### Task 3: The home hero — bento and boot sequence

**Files:**
- Create: `src/components/home/HeroBento.tsx`, `src/components/home/BootSequence.tsx`, `src/components/home/StatRow.tsx`
- Modify: `src/app/[locale]/page.tsx`

**Interfaces:**
- Consumes: `Surface`, `Readout`, `Hairline`, `Button`, `MOTION`, `useMotionSafe`
- Produces: `<HeroBento />`, `<StatRow />`, `useBootSequence(): { stage: 0|1|2|3 }`

- [ ] **Step 1: Write the boot orchestrator**

`src/components/home/BootSequence.tsx`:

```tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { MOTION, useMotionSafe } from "@/lib/motion";

/** 0 idle · 1 grid drawn · 2 counters running · 3 headline resolved */
type Stage = 0 | 1 | 2 | 3;

const BootContext = createContext<Stage>(3);

export function useBootStage(): Stage {
  return useContext(BootContext);
}

/**
 * The site's single orchestrated, non-user-triggered motion moment.
 * Runs once per session — a sequence that replays on every visit stops
 * reading as an instrument warming up and starts reading as a loading screen.
 */
export function BootSequence({ children }: { children: React.ReactNode }) {
  const safe = useMotionSafe();
  const [stage, setStage] = useState<Stage>(0);

  useEffect(() => {
    const alreadyBooted = sessionStorage.getItem("booted") === "1";
    if (!safe || alreadyBooted) {
      setStage(3);
      return;
    }
    sessionStorage.setItem("booted", "1");

    const timers = [
      setTimeout(() => setStage(1), 80),
      setTimeout(() => setStage(2), MOTION.boot.grid * 1000),
      setTimeout(
        () => setStage(3),
        (MOTION.boot.grid + MOTION.boot.counters) * 1000,
      ),
    ];
    return () => timers.forEach(clearTimeout);
  }, [safe]);

  return <BootContext.Provider value={stage}>{children}</BootContext.Provider>;
}
```

- [ ] **Step 2: Write `StatRow.tsx`**

Only verified figures. Three cells, mono readouts, counting once when the boot reaches stage 2:

```tsx
"use client";

import { useTranslations } from "next-intl";
import { Readout } from "@/components/primitives/Readout";
import { useBootStage } from "./BootSequence";

export function StatRow() {
  const t = useTranslations("home.stats");
  const stage = useBootStage();
  const counting = stage >= 2;

  return (
    <div className="grid grid-cols-3 gap-[var(--space-6)]">
      {/* Every number here has a source. See spec §4.2. */}
      <Readout value={2019} format="year" label={t("since")} count={counting} />
      <Readout value={9} format="int" label={t("products")} count={counting} />
      <Readout value={3} format="int" label={t("providers")} count={counting} />
    </div>
  );
}
```

- [ ] **Step 3: Write `HeroBento.tsx`**

The bento is a CSS grid, not a row of identical cards. Cells differ in span so the layout reads as instrument modules:

- **Identity cell** (tall, start column): portrait, name in `font-display`, one-line role, social links. `Surface variant="glass"`.
- **Headline cell** (wide, spans two): the two-tone display headline — first line at full `--ink`, second at `--ink-dim`, the reference's signature move rendered with tokens. Resolves at boot stage 3.
- **Stat cell**: `<StatRow />`.
- **Signal cell**: the one amber-filled cell, carrying the primary CTA to `/schedule`.
- **Capability cells** (two): one line each naming what he builds, no icons, no ALL-CAPS eyebrows.

Grid rules: `grid-cols-1` on mobile, `md:grid-cols-3`, `gap-[var(--space-4)]`, image tracks use `minmax(0,1fr)`. Every cell is a `Surface`. No paragraph copy inside a glass cell — the capability cells hold one line each.

- [ ] **Step 4: Assemble the page**

`src/app/[locale]/page.tsx` — `BootSequence` wraps `HeroBento`; every section below is a `Reveal`: selected work, experience preview (three entries, link to the full timeline), stack preview, closing CTA.

- [ ] **Step 5: Verify the sequence and its reduced-motion path**

```bash
pnpm build && pnpm start
```

Check by hand: the boot runs once; a reload in the same tab skips it; `prefers-reduced-motion: reduce` in devtools shows final values instantly with no translation.

- [ ] **Step 6: Commit**

```bash
git add src/components/home src/app/\[locale\]/page.tsx src/messages
git commit -m "feat: home bento hero with boot sequence"
```

---

### Task 4: Work index and case-study pages

**Files:**
- Create: `src/components/work/ProjectCard.tsx`, `src/components/work/CaseStudyLayout.tsx`, `src/app/[locale]/work/page.tsx`, `src/app/[locale]/work/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getProjects`, `getProject`, `getCaseStudy`, `Surface`, `Stagger`, `StaggerItem`
- Produces: `<ProjectCard project>`, `<CaseStudyLayout project caseStudy>`; `generateStaticParams` for every slug × locale

- [ ] **Step 1: Write `ProjectCard.tsx`**

A `Surface` link. Name in `font-display`, the one-line summary, year and domain as plain text (not a middle-dot string), stack as up to four bare words. No `→` on the link text. Hover lifts by 2px via `transform` only.

- [ ] **Step 2: Write the work index**

`src/app/[locale]/work/page.tsx`: a `Stagger` grid of `StaggerItem` + `ProjectCard`, `md:grid-cols-2`, tracks `minmax(0,1fr)`. Heading is the page's one `h1`.

- [ ] **Step 3: Write the case-study layout**

`CaseStudyLayout.tsx` sections, each a `Reveal`:

1. Header — project name as display type, role, year, live link
2. Problem — one sentence, large, on `--paper` not glass
3. Approach — three to five numbered steps. **This is the one place numbering is legitimate**, because the content is genuinely sequential.
4. Stack — bare word list
5. Outcome — one sentence
6. Figures — `Readout` cells, rendered **only** when `figures.length > 0`
7. Next project link

- [ ] **Step 4: Wire the dynamic route**

```tsx
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getProjects().map((p) => ({ locale, slug: p.slug })),
  );
}
```

`notFound()` when the slug is unknown.

- [ ] **Step 5: Verify every project has a reachable page**

```bash
pnpm build
```

Expected: the build output lists nine `work/[slug]` paths per locale — 36 total.

- [ ] **Step 6: Commit**

```bash
git add src/components/work src/app/\[locale\]/work
git commit -m "feat: work index and case studies"
```

---

### Task 5: The experience timeline

**Files:**
- Create: `src/components/experience/Timeline.tsx`, `src/components/experience/ProgressRail.tsx`, `src/app/[locale]/experience/page.tsx`
- Test: `tests/timeline.spec.ts`

**Interfaces:**
- Consumes: `getExperience`, `Surface`, `Hairline`, `useMotionSafe`
- Produces: `<Timeline entries>`, `<ProgressRail targetRef>`

- [ ] **Step 1: Write the progress rail**

```tsx
"use client";

import { useScroll, useTransform, motion } from "motion/react";
import type { RefObject } from "react";
import { useMotionSafe } from "@/lib/motion";

/**
 * A vertical rail whose fill tracks scroll position through the timeline.
 * Scroll-linked rather than triggered, so it reads as a measurement rather
 * than an entrance. Mirrors to the right-hand side under RTL via `start-0`.
 */
export function ProgressRail({
  targetRef,
}: {
  targetRef: RefObject<HTMLElement | null>;
}) {
  const safe = useMotionSafe();
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start 60%", "end 40%"],
  });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div
      aria-hidden
      className="absolute inset-y-0 start-0 w-px bg-hairline"
    >
      <motion.div
        className="h-full w-full origin-top bg-signal"
        style={{ scaleY: safe ? scaleY : 1 }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Write `Timeline.tsx`**

Entries in a single column with the rail on the inline-start edge. Each entry: a node dot on the rail, period in `font-mono`, company in `font-display`, role, two-sentence summary on `--paper`, stack words. Wrapped in `Stagger`/`StaggerItem`.

**RTL:** the rail uses `start-0` and the node offset uses `-ms-[5px]`, so mirroring is automatic. No `left`/`right` anywhere.

- [ ] **Step 3: Write the test**

`tests/timeline.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("rail fills as the timeline scrolls", async ({ page }) => {
  await page.goto("/en/experience");
  const fill = page.locator("[data-rail-fill]");
  const before = await fill.evaluate((el) => getComputedStyle(el).transform);
  await page.mouse.wheel(0, 1800);
  await page.waitForTimeout(400);
  const after = await fill.evaluate((el) => getComputedStyle(el).transform);
  expect(after).not.toBe(before);
});

test("rail sits on the right under rtl", async ({ page }) => {
  await page.goto("/fa/experience");
  const rail = page.locator("[data-rail]").first();
  const box = await rail.boundingBox();
  const viewport = page.viewportSize();
  expect(box!.x).toBeGreaterThan(viewport!.width / 2);
});
```

Add `data-rail` and `data-rail-fill` attributes to the rail elements so the test has stable hooks.

- [ ] **Step 4: Run it**

Run: `pnpm test -- timeline`
Expected: PASS both.

- [ ] **Step 5: Commit**

```bash
git add src/components/experience src/app/\[locale\]/experience tests/timeline.spec.ts
git commit -m "feat: scroll-linked experience timeline"
```

---

### Task 6: Stack page

**Files:**
- Create: `src/components/stack/StackGrid.tsx`, `src/app/[locale]/stack/page.tsx`

**Interfaces:**
- Consumes: `getStack`, `Surface`, `Stagger`
- Produces: `<StackGrid groups>`

- [ ] **Step 1: Build it**

Six `Surface` cells, one per group. Group name in `font-display`, items as a bare wrapped word list at `--text-sm`. No icons, no proficiency bars, no percentage ratings — a bar claiming "React 92%" is an invented metric and fails the claim gate.

- [ ] **Step 2: Commit**

```bash
git add src/components/stack src/app/\[locale\]/stack
git commit -m "feat: stack page"
```

---

### Task 7: Translate everything and audit RTL

**Files:**
- Modify: `src/messages/{en,de,nl,fa}.json`
- Create: `scripts/check-messages.mjs`

**Interfaces:**
- Produces: every UI string present in all four locales; a guard that fails when a key exists in `en` and is missing elsewhere

- [ ] **Step 1: Write the parity guard**

`scripts/check-messages.mjs`:

```js
#!/usr/bin/env node
import { readFileSync } from "node:fs";

const load = (l) =>
  JSON.parse(readFileSync(`src/messages/${l}.json`, "utf8"));

const flatten = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([k, v]) =>
    k.startsWith("_")
      ? []
      : typeof v === "object" && v !== null
        ? flatten(v, `${prefix}${k}.`)
        : [`${prefix}${k}`],
  );

const base = flatten(load("en"));
let bad = 0;

for (const locale of ["de", "nl", "fa"]) {
  const keys = new Set(flatten(load(locale)));
  const missing = base.filter((k) => !keys.has(k));
  if (missing.length) {
    console.error(`${locale}: ${missing.length} missing\n  ${missing.join("\n  ")}`);
    bad = 1;
  }
}

process.exit(bad);
```

Add `"test:messages": "node scripts/check-messages.mjs"` to `package.json`.

- [ ] **Step 2: Prove it fails**

Delete one key from `de.json`, run `pnpm test:messages`, watch it name that key, restore it.

- [ ] **Step 3: Fill `de`, `nl` and `fa`**

Translate every key. Keep `"_status": "machine"` at the top of the three non-English files — these are provisional until a native speaker clears them, and the marker is the honest record of that.

Farsi specifics: numerals come from `Intl`, not hardcoded. No Latin punctuation inside Persian sentences. Never translate product names (aim2balance, Jeofferte, Roofcast, Meshi, Intex).

- [ ] **Step 4: Audit RTL by hand**

Run `pnpm build && pnpm start`, then walk `/fa/`, `/fa/work`, `/fa/work/aim2balance`, `/fa/experience`, `/fa/stack` and check:

- Nav pill items read right-to-left, CTA on the correct side
- Timeline rail on the right, nodes attached to it
- Card padding mirrors — nothing is lopsided
- Display headline has `letter-spacing: 0`, not the negative Latin tracking
- No horizontal scrollbar at 320px
- Arrows and chevrons point the correct way

- [ ] **Step 5: Run every gate**

```bash
pnpm lint && pnpm typecheck && pnpm test:tokens && pnpm test:messages && pnpm test:unit && pnpm test
```

- [ ] **Step 6: Commit**

```bash
git add src/messages scripts/check-messages.mjs package.json
git commit -m "i18n: four-locale strings and parity guard"
```

---

## Phase exit criteria

- [ ] Home, work, work/[slug] ×9, experience and stack render in all four locales
- [ ] `pnpm test:unit` proves no banned claim appears anywhere in the content tree
- [ ] Every number on the site traces to spec §4.2's permitted list
- [ ] The hero boot runs once per session and is skipped under reduced motion
- [ ] The timeline rail fills on scroll and mirrors correctly under `fa`
- [ ] No horizontal scroll at 320 / 375 / 414 / 768 px on any page in any locale
- [ ] `pnpm test:messages` reports full parity
- [ ] Copy has been through `no-ai-slop` and no section reads as filler
