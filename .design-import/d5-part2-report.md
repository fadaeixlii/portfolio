# Part 2, Stage A — report (session cowork-personal-d5)

Two commits on `main`: `9a07ab1` (shell, aside, hero, stats, home) and `9a4a3cf`
(footer alignment). Seven files, no overlap with session f2's twenty.

## What landed

**The shell** — `src/app/[locale]/layout.tsx` wraps every page in a 1180px flex row
with a sticky identity column. `items-start` is load-bearing: a stretched flex item is
already full height and `position: sticky` has nothing to travel through. Content is
first in the DOM and `order` moves the aside to the inline start from `lg` up, so the
reading order stays content-first for a screen reader while the design puts the
identity column on the left.

**`SiteAside.tsx`** (new) — portrait at 4:5 under `filter: var(--shot)`, availability
dot, name, role, location, GitHub / LinkedIn / Email. The 86px sticky offset is a
margin, not padding: padding sits *inside* the sticky box, which pins the column at
86px from scroll 0 and leaves it nowhere to travel.

**The outlined headline** — `.headline-outline` in `globals.css`. The design specifies
`color: var(--ghost); -webkit-text-stroke: 1px var(--ink-dim)`. Implemented instead as
`-webkit-text-fill-color: var(--ghost)` behind an `@supports` guard, with `color`
staying `--ink-dim`. Same pixels where the property is supported; a solid readable line
where it is not, instead of 17%-alpha text. It also means axe measures the colour that
actually draws the letterform. RTL gets a 1.5px stroke — 1px vanishes in Vazirmatn and
2px out-weighs line 1 in the light theme.

**Three stats, not four.** `10k+ daily sessions billed`, `07+ years` and
`06 industries served` are all unsourced. Replaced per the MUST NOT table.

**Footer** — capped at the shell's 1180px with the gutter inside the cap. It had been
`max-w-5xl` centred in the full viewport, sitting 78px inside the content on both
edges once the aside offset the page.

## Verified, and how

Geometry measured in-browser rather than eyeballed. At 1280px LTR: footer rule
74..1206, aside box edge 74, content card right edge 1206. RTL mirrors it (aside
934..1206) with `scrollWidth - clientWidth` at 0. Session f2 independently sampled the
four accepted snapshot baselines and got 74..1205 on all of them — the same edge,
inclusive versus exclusive.

Screenshots read at 1280 and 390, en/fa/el, both themes. Three things only the image
showed: the h1 sat under the wrapped nav at 390px (fixed with `pt-32`); the Farsi
stroke needed 1.5px; and a trailing ASCII full stop at 104px, ghost-filled and stroked,
renders as an isolated hollow box in Farsi, so the trailing periods came off the `fa`
headline only.

## A correction to my own earlier work

`3e0edbb` claimed to fix 14 axe `color-contrast` failures. Half of it was a real fix —
`--signal` is a fill role at 3.75:1 on light paper, and the `text-signal` utility was
shipping as body text on 13 routes. The other half was not a fix. The guard I wrote
accepts any inline opacity of `0` or `1`, and my own comment justified it: "0 is fine —
axe skips fully transparent nodes". For a below-fold `whileInView` section, `0` means
never revealed. The suite went green partly because the home page below the hero was
never scanned.

Session f2 caught this. Measured across 20 combinations (`/`, `/work`, `/experience`,
`/stack`, `/contact` × en/fa × dark/light), unscrolled versus scrolled:

- home: 11 hidden sections, `none -> none` in all four locale/theme combinations
- every other route: 0 hidden sections, `none -> none`

So the coverage hole is real, confined to the home page, and currently empty. f2 had
predicted real violations would surface; they do not. The fix is still worth making —
an empty hole is a hole that ships the next regression green — and the honest
assertion after a scroll pass is two-sided: nothing rests at a fractional opacity, and
nothing that should be visible rests at 0. `tests/a11y.spec.ts` is f2's file.

## Open

- Full suite has not run against a settled tree. Port 3100 is f2's while its agent
  runs; `reuseExistingServer` means whoever starts second can silently adopt the
  other's server. One clean pass is owed once the tree is committed.
- The experience timeline shows aim2balance Nov 2025 – Sep 2026 against Zoof-it
  Mar 2025 – Feb 2026 with no clause explaining it. The note was removed on
  instruction; the updated CV that would remove the overlap never reached
  `resume/current/`, which still holds only the four 2026-09-17 files. Both sessions
  are holding rather than inventing dates.
