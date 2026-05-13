---
description: Convert a hex color to OKLCH using our palette format.
---

Hex: $ARGUMENTS

Convert to `oklch(L% C H)` rounded to nearest valid value. Show:
- Original hex
- OKLCH formatted as `oklch(94% 0.015 75)` style
- A small comment suggesting which token slot (background, foreground, accent, muted) it might fit

If multiple hexes given, output as a Tailwind v4 `@theme` block ready to paste into globals.css.
