# mohammadmkh.dev — v2

Personal portfolio of Mohammad MKH. Public, production, client-facing.
Source of truth: `docs/superpowers/specs/2026-09-19-portfolio-v2-design.md`.

## The one job

A founder at an early-stage EU startup understands what Mohammad builds in
fifteen seconds and books a call. Every page feeds `/schedule`.

## Stack (locked)

- Next.js 16 App Router · React 19 · React Compiler · TypeScript 5.9 strict
- Tailwind CSS v4, CSS-first `@theme inline` — no `tailwind.config.ts`
- Motion v12: `import { motion } from 'motion/react'` — **never** `framer-motion`
- `next-intl` (en · de · nl · fa) · `next-themes` (`data-theme`)
- Supabase via `@supabase/ssr` — contact messages and bookings only
- Google Calendar REST v3 through `fetch` — no `googleapis` package
- Archivo (display) · Vazirmatn (body, Latin + Arabic) · JetBrains Mono (numerals only)
- pnpm. Never npm, never yarn.
- Host: own VPS, Docker + Caddy, Cloudflare proxy in front. Domain `mohammadmkh.dev`.

## Non-negotiable

1. **`src/styles/tokens.css` is the only file that may author a colour.**
   Everything else uses a token. `pnpm test:tokens` enforces it.
2. **Logical properties only** — `ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-`.
   Physical direction utilities break the Farsi locale and fail the guard.
3. **No unverified claims.** Copy is bound by `docs/06-identity-canon.md` in the
   workspace root and the proof points in the outreach-writer skill. No
   "10,000+ daily sessions", no "sub-second latency", no phone number,
   location is Greece, aim2balance is past tense.
4. **Every animated component calls `useReducedMotion()`.** Transform and
   opacity only; never layout properties. Focus rings never animate.
5. **Mono is for numerals and code.** Never labels, eyebrows or nav.
6. **Headings are roman.** No italic headings, ever.
7. Never push to `main` directly. Branch `feat/<area>` or `fix/<area>`.
8. Never commit secrets. `.env.local` is gitignored and hook-guarded.
9. **Pages under `[locale]` unwrap params with React's `use()`, never
   `await`, and call `setRequestLocale(locale)` before any next-intl hook** —
   otherwise the route silently stops being prerendered.

## Commands

```bash
pnpm dev          # Turbopack dev server
pnpm build        # production build
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint
pnpm test         # Playwright (routing, theme, axe)
pnpm test:unit    # vitest (pure modules — slot maths)
pnpm test:tokens  # colour + logical-property guard
```

## Quality gates, every PR

Lighthouse ≥95 all four categories · WCAG 2.2 AA clean under axe ·
no horizontal scroll at 320/375/414/768 · route JS delta <30 KB gzipped ·
all five commands above green.
