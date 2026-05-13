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

## Spacing (8pt grid)

Use Tailwind spacing utilities: p-2 (8px), p-4 (16px), p-6 (24px), p-8 (32px), etc.

## Radii

| Token | Value | Usage |
|-------|-------|-------|
| rounded-sm | 4px | Small elements, tags |
| rounded-md | 8px | Cards, buttons |
| rounded-lg | 16px | Modals, large cards |
| rounded-full | 9999px | Avatars, pills |

<!-- TODO: Expand with component-specific token usage as Phase 1 progresses -->
