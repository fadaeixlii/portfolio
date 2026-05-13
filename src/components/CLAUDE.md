# Component conventions

## Where things live
- `ui/` — shadcn/ui primitives, untouched from CLI output unless theming
- `marketing/` — public-site composed components (Hero, ProjectCard, CaseStudySection)
- `admin/` — admin CMS composed components
- `mdx/` — MDX-rendered components (Callout, CodeBlock, ImageGrid)
- `shared/` — cross-cutting (FadeUp, StaggerContainer, MagneticButton, ThemeToggle)

## Defaults
- Server Component unless you need state, effects, browser APIs, or event handlers
- When you add 'use client', justify in a comment on the same line
- Props: prefer composition over configuration (children > 8 boolean props)
- Naming: PascalCase files, PascalCase exports, one component per file
