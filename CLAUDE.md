# fadaeixlii.com — Project Constitution

You are working on the personal portfolio of Mohammad Fadaei (GitHub: fadaeixlii),
a full-stack developer with 6+ years on React/Next.js/Node/NestJS/Solidity.
This is a public, production, client-facing site. Quality bar is senior-consultant.

## Mission

Ship a portfolio that looks Awwwards-minimal, loads under 2.5s LCP on 4G mobile,
demonstrates senior craft, and converts client leads via a frictionless contact form.

The site must be live on Cloudflare Pages within 72 hours of project start, even
if it's a Hello World — then iterate on a real, indexed domain.

## Stack (locked — do not propose alternatives without explicit approval)

- Next.js 16 (App Router, Turbopack, React Compiler 1.0)
- React 19, TypeScript 5.9 strict
- Tailwind CSS v4 (CSS-first @theme, no tailwind.config.ts)
- Motion v12 (`import { motion } from 'motion/react'` — NOT framer-motion)
- Supabase: @supabase/supabase-js + @supabase/ssr (NEVER auth-helpers-nextjs)
- shadcn/ui v4 + selective Magic UI / Aceternity UI components
- React Hook Form v7 + Zod v4
- Geist Sans + Geist Mono + Deltha (display serif, local font)
- Hosting: Cloudflare Pages via @opennextjs/cloudflare
- Package manager: pnpm (NEVER npm or yarn — fail loudly if you see either)

## Design system (non-negotiable)

- Palette: bone `oklch(94% 0.015 75)` / charcoal `oklch(22% 0.005 75)` /
  ochre accent `oklch(64% 0.09 65)` / muted `oklch(60% 0.005 75)`
- Use semantic tokens (`--color-background`, `--color-foreground`) — never hardcode hex
- Display type: clamp(64px, 15vw, 220px) / line-height 0.92 / tracking -0.03em
- Body: 17px / 1.6 / Geist Sans variable
- Spacing: 8pt grid only — no half-steps
- Radii: 4 / 8 / 16 / full — never 12 or arbitrary
- Motion budget: ONE signature hero hook, everything else ≤200ms hover polish
- Every motion component MUST use `useReducedMotion()` and zero durations on true
- Never animate width/height/top/left — only transform/opacity

## Critical workflow rules

1. **Always work in the three-prompt pattern**: analysis → verification → execution.
   Never skip to execution. If the user gives a one-shot prompt, ask which phase
   they want OR run all three internally and label sections clearly.

2. **Never push directly to main.** Always work on a feature branch named
   `feat/<area>-<short-desc>` or `fix/<area>-<short-desc>`. Open PRs.

3. **Before declaring done**, run in parallel:
   - `@agent-design-reviewer` for visual/token compliance
   - `@agent-performance-auditor` for bundle/CWV budget
   - `@agent-accessibility-checker` for WCAG 2.2 AA
   Apply every critical finding before reporting completion.

4. **Database changes go through `@agent-supabase-architect`** — every schema
   change is a numbered migration in `supabase/migrations/`, never a direct
   dashboard edit, and types are regenerated immediately.

7. **Proactive tool use.** Agents, skills, commands, and hooks exist to be used
   automatically — never wait for the user to invoke them. When the task matches
   a tool's domain, use it. Examples:
   - Writing animation → apply framer-motion-patterns skill + animation-architect review
   - Touching Supabase → supabase-nextjs-integration skill + supabase-architect agent
   - New public page → seo-strategist + OG image + generateMetadata automatically
   - Writing copy → content-writer agent
   - Importing components → shadcn-component-import skill pipeline

5. **Never commit secrets.** `.env.local` is gitignored. The pre-commit hook
   blocks commits containing `sb_secret_`, `SUPABASE_SECRET_KEY=`, API keys.

6. **Never use** `framer-motion` (use `motion/react`), `auth-helpers-nextjs`
   (use `@supabase/ssr`), `npm` (use `pnpm`), or `any` in TypeScript without
   a `// TODO(reason)` comment explaining why.

## Commands

```bash
pnpm dev              # Next.js dev server (Turbopack)
pnpm build            # Production build
pnpm typecheck        # tsc --noEmit
pnpm lint             # Next.js lint
pnpm test             # Playwright E2E
pnpm analyze          # ANALYZE=true pnpm build, opens bundle treemap
```

## Project structure (high level)

```
src/
  app/
    (public)/          marketing site
    (admin)/admin/     auth-gated CMS
    auth/              login/callback/signout
    api/               route handlers
  components/{ui,marketing,mdx,admin,shared}/
  lib/{supabase,db,validation,mdx,seo,og,rss,utils}/
  hooks/               cross-cutting hooks
  styles/globals.css   @theme tokens
  types/database.ts    regenerated, do not edit by hand
supabase/migrations/   numbered SQL files
.claude/               agents, skills, commands, settings
_docs/                 deep-dive docs (loaded on demand via @-import)
_content-inbox/        gitignored, raw assets staged for processing
```

## Quality gates (every PR)

- Lighthouse Performance/A11y/Best-Practices/SEO ≥95 on changed routes
- TypeScript strict mode passes
- No new `any`, no `framer-motion`, no `npm`, no hardcoded hex
- All new pages export `generateMetadata` and have `opengraph-image.tsx`
- All new motion respects `useReducedMotion()`
- Bundle size delta <30 KB gzipped per route (justify if larger)

## When you need more context

Read these on-demand (do not preload):

- @_docs/design-tokens.md — full token reference
- @_docs/supabase-rls.md — RLS patterns, policy reference
- @_docs/motion-patterns.md — animation patterns library
- @_docs/case-study-template.md — case study skeleton
- @_docs/deployment.md — Cloudflare Pages + OpenNext details
- @_docs/seo-strategy.md — metadata, OG, JSON-LD, sitemap

## Persona

User is a senior engineer who prefers Persian (Farsi) for technical discussion
and English for deliverables. Default to English in code, comments, and PRs.
Match the user's language when chatting. Be concise, technical, opinionated.
Push back when the user is wrong. Do not pad replies. Do not over-explain.
