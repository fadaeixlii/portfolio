# Modernist import — Part 2: the page frame and the home page

> Restored 2026-09-19 after this path was truncated by a case-insensitive filename
> collision from a second session. The brief that overwrote it is preserved at
> `.design-import/d5-stageB-brief.md`. Read the addendum at the bottom — it narrows
> the scope below, because a second session has already landed sections 1–3.

Part 1 landed the palette, the 2px dividers, the bordered nav and the Greek locale
(commit `49553ac`). The tokens are correct and are **not yours to change**. What is
still missing is the layout language: the sidebar, the type scale, the outlined
headline, and the home page's section order.

Read `.design-import/MODERNIST-SPEC.md` first — it is the contract, including the
"What must NOT be implemented" table. Read `.design-import/strings.md` for the copy.
Both are in this repo. Do not read the plan files; they predate this design.

## Before you write anything

Invoke these three skills and follow them for every string you write or touch:
`hallmark`, `no-slop:no-slop`, `no-ai-slop`. The site must not read as generated.
Concretely, in this codebase that has meant: no trailing arrow glyphs inside link
text, no middle-dot meta strings, no em-dash-joined appositives stacked three to a
paragraph, no "seamless / robust / leverage / dive into", no three-item lists where
two items are real and the third pads the rhythm.

## Scope — five things

### 1. The type scale

`src/styles/tokens.css` is the only file allowed to author a colour, but the display
scale lives there too. The display sizes the spec names:

- hero `clamp(48px, 8.4vw, 104px)`
- page heads `clamp(40px, 6.4vw, 78px)`
- section heads `clamp(34px, 5.2vw, 62px)`

Display and headings are Archivo 800, uppercase, tracking -0.035em, line-height
0.92 to 0.94. Body Archivo 400, 15px/1.55. Do not touch the colour tokens. Keep the
Farsi display override (Vazirmatn) working — Farsi must not fall back to a system
Naskh, and Farsi headings must NOT be uppercased or given a negative tracking that
mangles the joins. Scope the uppercase and tracking rules so they do not apply under
`[dir="rtl"]`.

### 2. The signature move

Two lines: the first solid `var(--ink)`, the second the ghosted, stroked line.

- Where `-webkit-text-stroke` is unsupported the text falls back to the ghost colour
  alone, which is a 1.5:1 ghost of a headline — unreadable. Guard it behind
  `@supports (-webkit-text-stroke: 1px black)` so the fallback is a solid
  `--ink-dim` line instead.
- axe reads the computed `color`, not the stroke. If the outlined line trips
  `color-contrast`, do not silence the rule — prefer a darker ghost and keep it
  accessible.
- It must work in RTL. Test `/fa`.

### 3. The sticky identity sidebar

Rendered by `src/app/[locale]/layout.tsx` beside `<main>`. Max-width 320px, sticky at
`top: 86px`, main content `flex: 999 1 480px`.

Contents, in order: the portrait (`/images/portrait.jpg`, 4:5, `filter: var(--shot)`,
`next/image`, sized, not `fill` without a sizes prop), an availability dot and its
label, the name "Mohammad M. Khani", the role, the location, then GitHub / LinkedIn /
Email links.

- LinkedIn is `https://linkedin.com/in/mohammadmkh`. GitHub is `fadaeixlii`. Email is
  `mmohammadkhani408@gmail.com`. The phone number appears nowhere.
- **It must collapse below the sidebar breakpoint.** On phones it becomes a normal
  block above the content, not a sticky column. `tests/a11y.spec.ts` asserts no
  horizontal scroll at 320/375/414/768 — a fixed 320px rail plus a 480px basis will
  break 320px if you use `min-width` anywhere.
- The availability dot must not be the only carrier of meaning: the label is the text,
  the dot is decoration (`aria-hidden`).

### 4. The home page

Section order from the spec: hero, stats row, two numbered cards, recent projects as
rows, experience preview, stack preview, contact CTA block. Sections 88px apart,
content column max-width 1180px.

- Hero: the headline, the kicker, the rewritten bio from `strings.md` (all five
  locales), and the CTA to `/schedule`.
- Kicker: two elements with real layout, or the sentence form given in `strings.md`.
  Not a middle-dot string.
- Stats: **three** — `2019` "since", `9` "shipped products", `3` "EU providers". Not
  four. The design's `10k+` and `07+` are banned claims; adding them turns
  `tests/unit/content.test.ts` red, which is the point of that test.
- Two numbered cards, labelled `01` and `02`. The contact block is `03`.
- Recent project rows: 120px image, title and meta, arrow. The arrow is a separate
  `aria-hidden` element, never a glyph inside the link text. Images carry
  `filter: var(--shot)`.
- `BootSequence` — judge it against this design. If it is a hangover from the previous
  direction that this one has no room for, remove it and say so in your report.

### 5. The experience heading

`EVERY ROLE` / `SINCE 2019`, in all five locales, exactly as the table in
`strings.md` gives it. The design's "SEVEN YEARS OF EXPERIENCE" is a banned claim.

## Constraints that bind you

- **Radius is 0** everywhere except `--radius-full`. Dividers are 2px solid.
- Every project screenshot and the portrait get `filter: var(--shot)`.
- The only numbers permitted anywhere on this site: since 2019, 9 shipped products,
  3 EU providers, 4.2s to 2.9s, 8 days to 5 days, 5,000+ users. Nothing else.
- Five locales must end with identical key sets — `pnpm test:messages` enforces it.
  `el` is machine-quality and carries its `_status` marker.
- Colours are authored **only** in `src/styles/tokens.css`. No hex, no `oklch()`, no
  `rgb()` anywhere else — `pnpm test:tokens` enforces it. `--signal` is a fill-only
  role; signal-coloured text uses `text-signal-text`.
- `use(params)`, never `await params`, in page components. `await` makes the component
  async, `useTranslations` throws inside it, and the route silently stops prerendering.
- Do not dispatch subagents. Review comes from the controller after your report.

## Done means

All of these green, run in this order, from the repo root:

    pnpm typecheck
    pnpm lint
    pnpm test:tokens
    pnpm test:messages
    pnpm test:unit
    CI=1 pnpm exec playwright test --reporter=line

`CI=1` matters: without it `reuseExistingServer` adopts whatever is already on port
3100 and the whole suite passes against a stale build. If a build fails with "Another
next build process is already running", delete
`.next/diagnostics/build-diagnostics.json` — it is a stale marker, not a real lock.

Commit to **main**, in logical chunks, Conventional Commits, subject 50 chars or
fewer. Write your full report to `.design-import/part2-report.md` and return only:
status, commit SHAs, a one-line test summary, and your concerns.

---

## Addendum — a second session shares this working tree

`cowork-personal-d5` is working in the same checkout, on main. It has already
committed the sticky sidebar shell, the outlined hero and the display tokens as
`9a07ab1`, and a footer alignment fix as `9a4a3cf`. **Sections 1, 2 and 3 above are
therefore done.** Read those commits rather than writing your own version.

**These seven files are not yours. Do not edit them:**

    src/app/[locale]/layout.tsx
    src/components/layout/SiteAside.tsx
    src/components/layout/SiteFooter.tsx
    src/components/home/HeroBento.tsx
    src/components/home/StatRow.tsx
    src/styles/tokens.css
    src/styles/globals.css

Consume what they define; do not redefine it. Tokens and utilities available to you,
all committed in `9a07ab1`:

    --text-display      clamp(3rem, 8.4vw, 6.5rem)        hero
    --text-section      clamp(2.125rem, 5.2vw, 3.875rem)  section heads
    --tracking-display  -0.035em
    --leading-display   0.93
    --space-22          5.5rem   the 88px section gap
    .headline-outline   the two-tone signature move

`.headline-outline` authors its ghost as `-webkit-text-fill-color` behind an
`@supports` guard, with `color` left at `--ink-dim`. That is deliberate: the line
stays readable without `-webkit-text-stroke`, and axe measures the colour that
actually draws the letterform. Under RTL the stroke is 1.5px rather than 1px, because
the Vazirmatn strokes are thinner. If you apply it to section heads, look at the
Farsi **and Greek** rendering before accepting it.

**Your scope is the inner pages:** `/work`, `/work/[slug]`, `/experience`, `/stack`,
`/contact`, `/schedule`, `/styleguide`, their components, the message keys they need,
the a11y coverage fix sent separately, and `src/app/[locale]/page.tsx` **below the
hero** — building on `9a07ab1`, not replacing it.

`src/app/[locale]/styleguide/page.tsx:95` still carries `mx-auto flex max-w-5xl`,
which double-centers inside the new 1180px content column. It is yours to fix.

### The four styleguide snapshots are yours to regenerate, once

`styleguide/layout.tsx` only returns its children, so the styleguide page renders
inside the locale layout and picks up the footer, and `styleguide.spec.ts` captures
`fullPage: true`. The other session's footer fix (`9a4a3cf`) invalidated all four
baselines, and removing `max-w-5xl` from the styleguide page invalidates them again.
That session deliberately did not regenerate, so you take it once, at the end:

    tests/styleguide.spec.ts-snapshots/styleguide-{en,fa}-{dark,light}-chromium-win32.png

**Look at the PNGs before you accept them.** Do not pass `--update-snapshots` and move
on. A baseline records what the page should look like; regenerating it blind converts
any regression into the new expected state. If the footer reads as detached from the
content column in your render, say so in your report — that belongs to the other
session to fix, not to be frozen into a baseline.

If you need a token or a utility class that does not exist, say so in your report
rather than defining it in a file you do not own.
