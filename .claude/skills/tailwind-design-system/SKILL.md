---
name: tailwind-design-system
description: Use this skill when writing Tailwind CSS. Enforces the design token system — OKLCH palette, 8pt grid, constrained radii, semantic color classes.
allowed-tools: Read, Grep
---

# Tailwind v4 Design System

## Palette (OKLCH semantic tokens)
- `bg-background` / `text-foreground` — bone/charcoal (auto dark mode)
- `bg-accent` / `text-accent` — ochre
- `text-muted-foreground` — muted gray
- `bg-card` — slightly lighter bone for card surfaces
- `border-border` — subtle warm border

## Never do
- Hardcode hex: `bg-[#B8895A]` — use `bg-accent`
- Use non-grid spacing: `p-5`, `m-3`, `gap-7` — use multiples of 2 (p-2=8px, p-4=16px, p-6=24px, p-8=32px)
- Use arbitrary radii: `rounded-[12px]` — use `rounded-sm`(4px), `rounded-md`(8px), `rounded-lg`(16px), `rounded-full`

## Typography
- Display: `text-display` utility (defined in globals.css)
- Headings: use `font-serif` for display sizes, `font-sans` for UI
- Body: default 17px via html font-size

## Dark mode
- Uses `class` strategy via next-themes
- Custom variant: `dark:` prefix works via `@custom-variant dark`
