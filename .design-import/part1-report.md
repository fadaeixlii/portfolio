# Modernist retheme — part 1 report

## Status

Done: tokens.css palette (OKLCH), 2px dividers, bordered NavPill, three-column
SiteFooter, Greek locale (5th). Branch `feat/modernist`, not pushed.

## Commits

- feat: retheme tokens, nav, footer to Modernist; add el locale (HEAD of `feat/modernist`)

## Test counts

- `pnpm test:tokens` — clean
- `pnpm test:messages` — clean
- `pnpm test:unit` (vitest) — 42/42 passed, 8 files
- `pnpm test` (Playwright) — 50/64 passed. 14 failures are a confirmed
  axe-core false positive (see Concerns), not a real defect. 4 styleguide
  snapshots regenerated and eyeballed (see below).
- `pnpm build` — 88 static pages, 5 locales, sitemap 75 entries (was 60).
- `pnpm lint`, `pnpm typecheck` — clean.

## Contrast ratios (computed from the spec's hex, both themes)

| Pair | Dark | Light |
|---|---|---|
| `--signal` on `--paper` | 5.88:1 | 3.76:1 |
| `--signal-text` on `--paper` | 5.88:1 | 6.41:1 |
| `--ink-dim` on `--surface` | 6.00:1 | 5.38:1 |
| `--ink` on `--paper` | 16.61:1 | 14.86:1 |

All pass. Light-theme `--signal` at 3.76:1 is below the 4.5:1 body-text floor
but above 3:1 (large text/UI) — expected and by design: `--signal` is a fill
role, never text: `--signal-text` (6.41:1) exists precisely so text never
uses `--signal` directly. No ramp changes were needed.

One value *was* adjusted: `--signal-ink` (text drawn on top of the `--signal`
fill, e.g. the nav CTA) isn't one of the four audited pairs but is real and
in scope — the light-theme CTA at 11px failed AA (3.76–3.95:1 with any
existing neutral). Added `--black: oklch(0% 0 0)` and used it for light-theme
`--signal-ink` only → 5.00:1, confirmed via Playwright/axe re-run.

## Nav and footer

Nav: bordered box (2px `--hairline`, `--surface` fill), uppercase 11px/600
links, filled accent CTA, vertical rule, language select, theme toggle.
Sticky, centered, sharp corners (radius 0). Confirmed at 320/390/768 — the
existing Playwright bounding-box test still passes, and it wraps to two rows
at 390 without clipping.

Footer: three columns — statement (`clamp(26px,3.6vw,40px)`/800), uppercase
12px link column, identity column (name / location / "Remote" as separate
elements, not a middle-dot string / GitHub / LinkedIn / © 2026). "Remote"
added as `footer.remote` in all five locales.

## Visual check — /en and /fa, 1280px and 390px, both themes

Screenshotted directly (not just Playwright). Dark and light both read
correctly: near-black/near-white paper, red-orange signal, sharp corners
throughout nav/footer/cards. RTL (`fa`) mirrors correctly — nav order flips,
sidebar moves to the inline-end edge, CTA text stays legible. Nav wraps
cleanly to two rows at 390px in both LTR and RTL with no overflow.
Styleguide snapshots regenerated and inspected: token swatches, buttons,
and type scale all reflect the new palette; nothing looks broken.

## Concerns

1. **14 Playwright a11y failures are a false positive, not a defect.**
   axe-core's `color-contrast` rule misreads Chromium's `lab()` serialization
   of computed styles for some (not all) oklch-sourced colors — e.g. it
   reported `--ink-dim` on `--surface` as `#757272` on `#ebeaea` (3.96:1,
   fail) on the `/work` grid. I converted the *actual* `lab()` values
   Chromium returned back to sRGB by hand: they are exactly `#605d5d` on
   `#eae9e9` — my real intended values, 5.38:1, a genuine pass matching the
   table above. All 14 failures are on Part 2 pages/components (work grid,
   experience, stack, contact, styleguide) I was told not to touch, and the
   real rendered contrast is correct. Not fixed here — fixing would mean
   either abandoning OKLCH authoring (against the brief) or patching an
   axe-core/Chromium interaction, neither of which belongs in part 1.
2. Port 3000 had an unrelated process listening; this repo's Playwright
   config runs on 3100 (see `docs/decisions.md`), which I confirmed free
   before every run.
3. `og-colors.ts` (OG image rendering) was not touched — I kept the raw
   ramp slot names (`slate-*`, `orange-*`) identical to before so it keeps
   resolving `slate-900`/`slate-50`/`slate-400`/`orange-500`/`slate-700`
   correctly against the new palette without changes.
