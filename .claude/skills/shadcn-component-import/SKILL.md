---
name: shadcn-component-import
description: Use this skill when importing or adapting shadcn/ui, Magic UI, or Aceternity UI components. Enforces design tokens, motion budget, and naming.
allowed-tools: Read, Write, Edit, Bash
---

# Importing shadcn-ecosystem components

Source components from:
- shadcn/ui official registry (ui.shadcn.com)
- Magic UI (magicui.design) — for marquees, animated beam, bento, number tickers
- Aceternity UI (ui.aceternity.com) — for spotlight, 3D card, sparkles (use sparingly)

## Rules when importing

1. Run `pnpm dlx shadcn@latest add <name>` or copy from source, never `npm install`.
2. **Strip hardcoded colors.** Replace any `bg-black`, `text-neutral-200`, `from-zinc-900`
   with our semantic tokens: `bg-background`, `text-foreground`, `from-foreground/20`.
3. **Strip framer-motion imports.** Replace with `motion/react`.
4. **Add useReducedMotion guard** to any component with animation.
5. **Verify accessibility.** Many Aceternity components are visually-only — add ARIA,
   keyboard handlers, focus-visible rings.
6. **File the component** under `src/components/ui/` if generic, `marketing/` if portfolio-specific.
7. **Document the import** in the file header: `// Source: magicui.design/marquee, modified to use design tokens`

## Components we've imported (update this list)
- ui/button, card, dialog, input, textarea, sheet, label — shadcn official

When invoked:
1. Read the source URL or registry name.
2. Read existing components/ui/ to avoid duplicates.
3. Apply the import + token-replace + a11y-augment pipeline above.
4. Show the diff before writing.
