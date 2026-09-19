# Modernist — design imported from Claude Design

Source: `claude.ai/design/p/b32a558d-9803-43e6-9d73-8d461983d14c` → `Portfolio.dc.html`
Design system: `Modernist` (`1ece4391-e4e2-477e-b2db-497679ec23a1`)
Imported 2026-09-19. This file is the implementation contract.

The imported file is a hash-routed single-file SPA. **We are not adopting that.** The site
already has per-locale prerendered Next.js routes, a 60-entry sitemap, OG images and SEO
metadata; hash routing would throw all of it away. We take the **visual language** and apply
it to the existing route structure.

---

## Tokens

Replaces the current blue-slate + orange palette entirely.

| Role | Dark (default) | Light |
|---|---|---|
| `--paper` | `#141312` | `#f3f2f2` |
| `--surface` | `#1c1a19` | `#eae9e9` |
| `--surface-raised` | `#232120` | `#e2e0e0` |
| `--ink` | `#f3f2f2` | `#201e1d` |
| `--ink-dim` | `#9b9797` | `#605d5d` |
| `--signal` | `#ff563c` | `#ec3013` |
| `--signal-text` | `#ff563c` | `#ae1800` |
| `--hairline` | `rgba(243,242,242,0.24)` | `rgba(32,30,29,0.40)` |
| `--ghost` | `rgba(243,242,242,0.17)` | `rgba(32,30,29,0.18)` |

`--signal-text` is a separate role: on a light ground the fill colour is too light for small
text, so text uses the deeper ramp step while fills keep the accent. Carry that distinction.

**Radius is `0` everywhere.** Every `--radius-*` becomes `0`. Sharp corners are the whole
point of this direction.

**Dividers are 2px**, not hairlines: `border: 2px solid var(--hairline)`.

Convert all of these to OKLCH in `tokens.css` Layer 1 so the existing token guard and the
contrast checks keep working. Keep the two-layer structure — raw ramps, then semantic
aliases — exactly as it is. Only the values change.

## Type

Archivo at **800** for all display and headings, uppercase, `letter-spacing: -0.035em`,
`line-height: 0.92`–`0.94`. Body Archivo 400 at 15px/1.55. Vazirmatn still loads for Farsi.

Display sizes: hero `clamp(48px, 8.4vw, 104px)`, section heads `clamp(34px, 5.2vw, 62px)`,
page heads `clamp(40px, 6.4vw, 78px)`.

## The signature move

The two-tone headline is **solid line over outlined line**:

```
line 1: color: var(--ink)
line 2: color: var(--ghost); -webkit-text-stroke: 1px var(--ink-dim)
```

That outline is what makes this design distinctive. It is stronger than the current
dimmed-second-line treatment and it is the thing to get right.

## Imagery

All project screenshots render `filter: grayscale(1) contrast(1.06)`. The portrait too.
Exposed as a `--shot` variable so it can be switched off in one place.

## Layout

- **Sticky left sidebar**, `max-width: 320px`, holding the portrait (4:5, grayscale), an
  availability dot + label, name, role, location, and GitHub / LinkedIn / Email links.
  Sticks at `top: 86px`. Main content is `flex: 999 1 480px` beside it.
- **Nav** is a bordered box (`2px solid`), not a pill: uppercase 11px links, the CTA filled
  with the accent, then a language `<select>` and a theme toggle.
- Content column max-width 1180px, sections separated by 88px.
- Home sections: hero → stats row → two numbered cards → recent projects (rows) → experience
  preview → stack preview → contact CTA block.
- Project rows on home: `120px image | title + meta | arrow`.
- Work grid: cards with 16:10 image, title, year, tagline, tech tags.
- Case study: meta sidebar with Role / Client / Team / Duration / Stack + live link.
- Experience: vertical rule with square nodes on the inline-start edge.
- Footer: large statement + link column + identity column.

---

## What must NOT be implemented

The imported design carries claims this project forbids. These are enforced by
`tests/unit/content.test.ts`, which scans content **and** message files — implementing them
turns the suite red, which is the point.

| In the design | Why it cannot ship | Use instead |
|---|---|---|
| `10k+` "Daily sessions billed" | Unverified. A capacity figure, never read off analytics. | Drop the fourth stat. Three stats, not four. |
| `07+` "Years in production" | The permitted phrasing is "since 2019", not a rounded count. | `2019` with the label "since" |
| `06` "Industries served" | Not on the permitted-numbers list and unsourced. | `3` "EU providers" — real, from the aim2balance gateway |
| "SEVEN YEARS OF EXPERIENCE" heading (all 5 locales) | Same. | "EVERY ROLE" / "SINCE 2019" |
| "Seven years shipping React…" hero bio (all 5 locales) | Same. | Rewrite without the year count. |
| `linkedin.com/in/fadaeixlii` | Wrong slug. | `linkedin.com/in/mohammadmkh` |
| `cal.com/fadaeixlii` | Sends visitors to a third party. The site has its own booker — that was all of Phase 4, reading his real Google Calendar. | Link `/schedule` |
| Budget select (€5k–€15k, €15k–€40k, €40k+, retainer) | Invents pricing tiers that exist nowhere on file. | Drop the field, or replace with the booking flow's `topic` |

**The only numbers permitted anywhere on this site:** since 2019 · 9 shipped products ·
3 EU providers · 4.2s → 2.9s · 8 days → 5 days · 5,000+ users.

## Deliberate deviations from the design, and why

- **Routes stay real.** No hash routing. The design's `#/work` becomes `/[locale]/work`,
  prerendered, in the sitemap, with its own metadata and OG image.
- **The booker stays.** `/schedule` keeps the month → day → slot → form flow built against
  Google Calendar. The design's `cal.com` link would discard it.
- **`↗` and `→` come off link text.** Both design skills name a trailing arrow glyph in link
  text as a generated-page tell. The affordance survives as a separate `aria-hidden` element
  where it helps.
- **`A · B` middle-dot strings** (`{{ domain }} · {{ year }}`, `{{ location }} · {{ type }}`)
  are banned by the spec and were already removed once in Phase 3. Render as two elements.
- **ALL-CAPS section eyebrows** are kept **only** where they are the display headline itself
  (`RECENT / PROJECTS`), which is this design's language. Small uppercase kickers above a
  heading stay off.
- **`01 / 02 / 03`** on the two capability cards and the contact block: kept. They are the
  design's numbering and read as a deliberate index, not a fake sequence.

## Locales

The design adds **Greek (`el`)** to en/fa/nl/de — sensible for someone in Athens. Adopt it:
five locales. Every message file must end with identical key sets; `check-messages` enforces
it. `el` is machine-quality like de/nl/fa and carries `"_status": "machine"`.
