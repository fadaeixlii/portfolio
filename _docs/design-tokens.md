# Design Tokens Reference

> Full reference for the fadaeixlii.com design system. See `src/app/globals.css` for implementation.

## Colors (OKLCH)

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| background | oklch(0.94 0.015 75) | oklch(0.18 0.005 75) | Page background |
| foreground | oklch(0.22 0.005 75) | oklch(0.92 0.012 75) | Primary text |
| accent | oklch(0.64 0.09 65) | oklch(0.68 0.09 65) | Ochre accent, CTAs |
| muted-foreground | oklch(0.60 0.005 75) | oklch(0.65 0.005 75) | Secondary text |
| border | oklch(0.85 0.012 75) | oklch(0.30 0.008 75) | Borders, dividers |

## Typography

| Role | Font | Size | Line Height | Tracking |
|------|------|------|-------------|----------|
| Display | Fraunces | clamp(64px, 15vw, 220px) | 0.92 | -0.03em |
| H1 | Fraunces | 48px | 1.1 | -0.02em |
| H2 | Geist Sans | 32px | 1.2 | -0.01em |
| H3 | Geist Sans | 24px | 1.3 | 0 |
| Body | Geist Sans | 17px | 1.6 | 0 |
| Small | Geist Sans | 14px | 1.5 | 0 |
| Mono | Geist Mono | 15px | 1.6 | 0 |
| Eyebrow | Geist Mono | 10–11px | 1.5 | 0.16em | uppercase section labels, ledger keys, index numerals |

**Eyebrow / micro-label scale** — the `text-[10px]`/`text-[11px]` uppercase-mono labels (SectionLabel, ledger keys, `§` markers, tech tags) are an intentional, documented scale step, not arbitrary values. Keep them consistent; don't "fix" them to the body scale.

## Spacing (8pt grid)

Use Tailwind spacing utilities: p-2 (8px), p-4 (16px), p-6 (24px), p-8 (32px), etc.

**Accepted sub-grid steps** — a small set of half-steps is allowed for optical fit on dense micro-UI: `gap-1.5` (6px) between inline icon+label, `py-0.5` (2px) on pills/badges, `pb-0.5`/`pb-1.5` on underline links. These are deliberate; the 8pt rule governs layout/section spacing, not 1px optical tweaks on tags.

## Radii

| Token | Value | Usage |
|-------|-------|-------|
| rounded-sm | 4px | Small elements, tags |
| rounded-md | 8px | Cards, buttons |
| rounded-lg | 16px | Modals, large cards |
| rounded-full | 9999px | Avatars, pills |

<!-- TODO: Expand with component-specific token usage as Phase 1 progresses -->
