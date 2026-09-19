# Portfolio v2 · Phase 1 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Archive portfolio v1, then stand up an empty Next.js 16 application that boots in four locales and two themes, driven by a single-source token system, with the lint and test gates that every later phase depends on.

**Architecture:** A fresh `src/` on branch `feat/v2`. Colour, type, spacing and motion are authored once in `src/styles/tokens.css` and exposed to Tailwind v4 through `@theme inline`; no component ever names a raw value. Routing is `[locale]`-prefixed via `next-intl`, with `dir` derived from the locale so RTL is structural rather than bolted on. Quality gates (token lint, logical-property lint, Playwright, axe) land in this phase so they constrain all subsequent work rather than being retrofitted.

**Tech Stack:** Next.js 16 (App Router, React Compiler), React 19, TypeScript 5.9 strict, Tailwind CSS v4, `next-intl`, `next-themes`, `motion` v12, Playwright, `@axe-core/playwright`, pnpm.

**Spec:** `docs/superpowers/specs/2026-09-19-portfolio-v2-design.md`

## Global Constraints

- Package manager is **pnpm**. Never `npm` or `yarn` — fail loudly if either appears.
- Motion imports come from `motion/react`. **Never** `framer-motion`.
- Supabase clients come from `@supabase/ssr`. Never `auth-helpers-nextjs`.
- No hex literals, no `rgb()`, no raw `oklch()` anywhere except `src/styles/tokens.css`.
- No physical-direction utilities (`ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`, `text-right`). Use logical equivalents (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, `text-end`).
- Locales are exactly `['en', 'de', 'nl', 'fa']`; default `en`; `localePrefix: 'always'`.
- `fa` renders `dir="rtl"`; all others `dir="ltr"`.
- Dark paper is `oklch(15% 0.015 255)`; light paper is `oklch(97% 0.004 255)`; signal is `oklch(80% 0.145 78)` dark / `oklch(62% 0.145 68)` light.
- Display face Archivo, body face Vazirmatn, numerals JetBrains Mono. Headings are always roman — no italic headings.
- `any` in TypeScript requires an adjacent `// TODO(reason)` comment.
- Conventional Commits, subject ≤50 characters.
- Every animated component must consult `useReducedMotion()`.

---

### Task 1: Archive v1 and open the v2 branch

**Files:**
- Modify: none (git operations only)
- Delete: `src/**`, `_docs/**`, `components.json`, `skills-lock.json`, `compass_artifact_*.md`, `portfolio-claude-code-kickoff.md`, `CLAUDE-CODE-PROMPTS.md`

**Interfaces:**
- Consumes: nothing
- Produces: branch `feat/v2` with an empty `src/`; tag `v1-archive` and branch `archive/v1` both pushed; `supabase/migrations/` preserved intact

- [ ] **Step 1: Verify the working tree is clean and record the archive point**

```bash
git status --porcelain
git rev-parse HEAD
```

Expected: no output from the first command. Record the SHA — it should be `44ce063` or a later commit on `main`.

- [ ] **Step 2: Create and push the archive tag and branch**

```bash
git tag -a v1-archive -m "portfolio v1, final state before v2 rebuild"
git branch archive/v1
git push origin v1-archive archive/v1
```

- [ ] **Step 3: Verify the archive is recoverable before deleting anything**

```bash
git ls-tree -r --name-only v1-archive -- src | head -5
git ls-remote --tags origin | grep v1-archive
```

Expected: the first prints v1 source paths; the second prints the tag on the remote. **If either is empty, stop — do not proceed to deletion.**

- [ ] **Step 4: Branch and clear**

```bash
git switch -c feat/v2
git rm -r --quiet src _docs components.json skills-lock.json CLAUDE-CODE-PROMPTS.md portfolio-claude-code-kickoff.md
git rm --quiet compass_artifact_wf-055f5ea8-d433-448f-93ca-67bc0aca0a08_text_markdown.md
mkdir -p src/app src/components src/content src/lib src/messages src/styles
```

`supabase/`, `public/`, `docs/`, `.claude/` and all root config files are **kept**.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: archive v1, clear src for rebuild"
```

---

### Task 2: Dependencies and build configuration

**Files:**
- Modify: `package.json`, `next.config.ts`, `tsconfig.json`
- Create: `.nvmrc`

**Interfaces:**
- Consumes: branch `feat/v2` from Task 1
- Produces: `pnpm typecheck` and `pnpm build` both succeed on an empty app; scripts `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:tokens`

- [ ] **Step 1: Remove the dependencies v2 does not use**

```bash
pnpm remove next-mdx-remote @types/mdx shadcn @base-ui/react plaiceholder
```

- [ ] **Step 2: Add the v2 dependencies**

```bash
pnpm add next-intl @date-fns/tz
pnpm add -D vitest @vitejs/plugin-react
```

`motion`, `next-themes`, `@supabase/ssr`, `@supabase/supabase-js`, `react-hook-form`, `@hookform/resolvers`, `zod`, `clsx`, `tailwind-merge`, `lucide-react`, `class-variance-authority` are already present and stay.

- [ ] **Step 3: Replace `next.config.ts`**

```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Traced standalone server — the VPS receives a self-contained bundle
  // instead of the whole node_modules tree.
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 4: Add the scripts to `package.json`**

Replace the `"scripts"` block with:

```json
{
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "typecheck": "tsc --noEmit",
  "test": "playwright test",
  "test:unit": "vitest run",
  "test:tokens": "node scripts/check-tokens.mjs"
}
```

- [ ] **Step 5: Verify the toolchain**

Run: `pnpm typecheck`
Expected: PASS (no source files yet, so no errors).

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml next.config.ts tsconfig.json
git commit -m "chore: v2 dependency baseline"
```

---

### Task 3: The token system

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/globals.css`
- Test: `scripts/check-tokens.mjs`

**Interfaces:**
- Consumes: Task 2's build config
- Produces: Layer 2 custom properties `--paper`, `--surface`, `--surface-raised`, `--ink`, `--ink-dim`, `--hairline`, `--signal`, `--signal-ink`, `--focus`, `--error`, `--success`; Tailwind utilities `bg-paper`, `bg-surface`, `text-text`, `text-dim`, `border-hairline`, `bg-signal`, `text-signal`; `--ease-out`, `--ease-in`, `--ease-in-out`, `--dur-fast`, `--dur-base`, `--dur-slow`; `--text-display` … `--text-xs`; `--space-1` … `--space-32`; `--radius-sm|md|lg|full`

- [ ] **Step 1: Write the failing token-guard test**

Create `scripts/check-tokens.mjs`:

```js
#!/usr/bin/env node
// Fails if a raw colour value appears outside the one file allowed to author colour.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const ALLOWED = ["src/styles/tokens.css"];
const EXTS = [".css", ".ts", ".tsx"];
const RAW_COLOUR = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(/;
const PHYSICAL = /\b(?:ml|mr|pl|pr)-(?:\d|px|auto|\[)|\b(?:left|right)-(?:\d|px|\[)|\btext-(?:left|right)\b/;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (["node_modules", ".next", ".git", "fixtures"].includes(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (EXTS.some((e) => entry.endsWith(e))) out.push(full);
  }
  return out;
}

const violations = [];
for (const file of walk(join(ROOT, "src"))) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    if (line.trimStart().startsWith("//") || line.trimStart().startsWith("*")) return;
    if (!ALLOWED.includes(rel) && RAW_COLOUR.test(line)) {
      violations.push(`${rel}:${i + 1}  raw colour — use a token`);
    }
    if (PHYSICAL.test(line)) {
      violations.push(`${rel}:${i + 1}  physical direction — use ms-/me-/ps-/pe-/start-/end-`);
    }
  });
}

if (violations.length) {
  console.error(`check-tokens: ${violations.length} violation(s)\n` + violations.join("\n"));
  process.exit(1);
}
console.log("check-tokens: clean");
```

- [ ] **Step 2: Prove the guard can fail**

```bash
mkdir -p src/styles && printf '.x { color: #ff0000; }\n.y { margin-left: 0; }\n' > src/styles/_probe.css
node scripts/check-tokens.mjs
```

Expected: FAIL, exit 1, listing `src/styles/_probe.css:1 raw colour`. Then delete the probe:

```bash
rm src/styles/_probe.css
```

- [ ] **Step 3: Write `src/styles/tokens.css`**

```css
/* Hallmark · macrostructure: Bento Grid · tone: technical-austere · anchor hue: amber 78
 * The ONLY file permitted to author a raw colour value. Change the ramps in Layer 1
 * and every surface, both themes, follows.
 */

:root {
  /* ---- Layer 1 · raw ramps ------------------------------------------ */
  --slate-50:  oklch(97% 0.004 255);
  --slate-100: oklch(94% 0.006 255);
  --slate-200: oklch(87% 0.008 255);
  --slate-400: oklch(64% 0.012 255);
  --slate-500: oklch(52% 0.014 255);
  --slate-700: oklch(32% 0.016 255);
  --slate-800: oklch(25% 0.016 255);
  --slate-850: oklch(20% 0.016 255);
  --slate-900: oklch(15% 0.015 255);
  --slate-950: oklch(11% 0.014 255);

  --amber-400: oklch(86% 0.120 80);
  --amber-500: oklch(80% 0.145 78);
  --amber-600: oklch(70% 0.150 72);
  --amber-700: oklch(62% 0.145 68);

  --red-500:   oklch(62% 0.190 25);
  --green-500: oklch(68% 0.150 150);

  /* ---- Layer 2 · semantic aliases · dark is the default -------------
   * Deliberately NOT named --color-*: that namespace belongs to Tailwind's
   * @theme, and `--color-paper: var(--color-paper)` would be circular.
   */
  --paper:          var(--slate-900);
  --surface:        var(--slate-850);
  --surface-raised: var(--slate-800);
  --ink:            var(--slate-50);
  --ink-dim:        var(--slate-400);
  --hairline:       var(--slate-700);
  --signal:         var(--amber-500);
  --signal-ink:     var(--slate-950);
  --focus:          var(--amber-400);
  --error:          var(--red-500);
  --success:        var(--green-500);
}

:root[data-theme="light"] {
  --paper:          var(--slate-50);
  --surface:        oklch(99% 0.002 255);
  --surface-raised: var(--slate-100);
  --ink:            var(--slate-900);
  --ink-dim:        var(--slate-500);
  --hairline:       var(--slate-200);
  --signal:         var(--amber-700);
  --signal-ink:     var(--slate-50);
  --focus:          var(--amber-600);
}

:root {
  /* ---- Type scale --------------------------------------------------- */
  --text-display: clamp(3.5rem, 11vw, 9rem);
  --text-4xl: clamp(2.5rem, 6vw, 4rem);
  --text-3xl: clamp(2rem, 4vw, 2.75rem);
  --text-2xl: 1.75rem;
  --text-xl: 1.375rem;
  --text-lg: 1.125rem;
  --text-base: 1.0625rem;
  --text-sm: 0.9375rem;
  --text-xs: 0.8125rem;

  --leading-display: 0.9;
  --leading-tight: 1.15;
  --leading-body: 1.6;
  --tracking-display: -0.03em;
  --measure: 68ch;

  /* ---- Space · 4pt scale -------------------------------------------- */
  --space-1: 0.25rem;  --space-2: 0.5rem;   --space-3: 0.75rem;
  --space-4: 1rem;     --space-6: 1.5rem;   --space-8: 2rem;
  --space-12: 3rem;    --space-16: 4rem;    --space-24: 6rem;
  --space-32: 8rem;

  /* ---- Radii -------------------------------------------------------- */
  --radius-sm: 0.25rem; --radius-md: 0.75rem;
  --radius-lg: 1.5rem;  --radius-full: 9999px;

  /* ---- Motion ------------------------------------------------------- */
  --dur-fast: 120ms; --dur-base: 240ms; --dur-slow: 480ms;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in: cubic-bezier(0.55, 0, 1, 0.45);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);

  /* ---- Glass -------------------------------------------------------- */
  --glass-blur: 16px;
  --glass-saturate: 140%;
  --glass-fill: color-mix(in oklch, var(--surface) 62%, transparent);
}

[dir="rtl"] {
  --tracking-display: 0;
}
```

- [ ] **Step 4: Write `src/styles/globals.css`**

```css
@import "tailwindcss";
@import "./tokens.css";

@theme inline {
  /* Tailwind's --color-* namespace on the left, Layer 2 aliases on the right.
   * The two sets of names must differ or the variable resolves to itself. */
  --color-paper: var(--paper);
  --color-surface: var(--surface);
  --color-surface-raised: var(--surface-raised);
  --color-text: var(--ink);
  --color-dim: var(--ink-dim);
  --color-hairline: var(--hairline);
  --color-signal: var(--signal);
  --color-signal-ink: var(--signal-ink);
  --color-error: var(--error);
  --color-success: var(--success);

  --font-display: var(--font-archivo);
  --font-sans: var(--font-vazirmatn);
  --font-mono: var(--font-jetbrains);

  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
}

@layer base {
  html, body {
    overflow-x: clip;
  }

  body {
    background-color: var(--paper);
    color: var(--ink);
    font-family: var(--font-sans);
    font-size: var(--text-base);
    line-height: var(--leading-body);
    -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3, h4 {
    font-family: var(--font-display);
    font-style: normal;
    line-height: var(--leading-tight);
    overflow-wrap: anywhere;
    min-width: 0;
  }

  :focus-visible {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
    transition: none;
  }

  ::selection {
    background: var(--signal);
    color: var(--signal-ink);
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 150ms !important;
      scroll-behavior: auto !important;
    }
  }
}
```

- [ ] **Step 5: Run the guard against the real files**

Run: `pnpm test:tokens`
Expected: `check-tokens: clean` — `tokens.css` is allow-listed, `globals.css` names only tokens.

- [ ] **Step 6: Commit**

```bash
git add src/styles scripts/check-tokens.mjs package.json
git commit -m "feat: token system with single-source palette"
```

---

### Task 4: Fonts

**Files:**
- Create: `src/lib/fonts.ts`

**Interfaces:**
- Consumes: the `--font-archivo`, `--font-vazirmatn`, `--font-jetbrains` variable names referenced by `globals.css` in Task 3
- Produces: `fontVariables: string` — a className string to spread onto `<html>`

- [ ] **Step 1: Write `src/lib/fonts.ts`**

```ts
import { Archivo, Vazirmatn, JetBrains_Mono } from "next/font/google";

/** Display face. The width axis is used deliberately — see the spec's type section. */
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

/** Body face. Covers Latin + Arabic so the fa locale never falls back mid-paragraph. */
const vazirmatn = Vazirmatn({
  subsets: ["latin", "arabic"],
  variable: "--font-vazirmatn",
  display: "swap",
});

/** Numerals and code only. Never labels, eyebrows or navigation. */
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const fontVariables = [
  archivo.variable,
  vazirmatn.variable,
  jetbrains.variable,
].join(" ");
```

- [ ] **Step 2: Verify it typechecks**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/fonts.ts
git commit -m "feat: font stack with Arabic coverage"
```

---

### Task 5: i18n routing

**Files:**
- Create: `src/lib/i18n/routing.ts`, `src/lib/i18n/request.ts`, `src/lib/i18n/navigation.ts`, `src/middleware.ts`, `src/messages/{en,de,nl,fa}.json`

**Interfaces:**
- Consumes: `next-intl` from Task 2, the plugin path `./src/lib/i18n/request.ts` wired in `next.config.ts`
- Produces: `routing` (with `locales`, `defaultLocale`), `Locale` type, `isRtl(locale): boolean`, and `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname` from `src/lib/i18n/navigation`

- [ ] **Step 1: Write `src/lib/i18n/routing.ts`**

```ts
import { defineRouting } from "next-intl/routing";

export const locales = ["en", "de", "nl", "fa"] as const;
export type Locale = (typeof locales)[number];

/** Right-to-left locales. Drives the html dir attribute and icon mirroring. */
const RTL: ReadonlySet<string> = new Set(["fa"]);

export function isRtl(locale: string): boolean {
  return RTL.has(locale);
}

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "always",
});
```

- [ ] **Step 2: Write `src/lib/i18n/request.ts`**

```ts
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 3: Write `src/lib/i18n/navigation.ts`**

```ts
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

- [ ] **Step 4: Write `src/middleware.ts`**

```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "@/lib/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Everything except API routes, Next internals, and files with an extension.
  matcher: "/((?!api|_next|_vercel|admin|.*\\..*).*)",
};
```

- [ ] **Step 5: Create the four message files**

`src/messages/en.json`:

```json
{
  "_status": "authored",
  "nav": {
    "home": "Home",
    "work": "Work",
    "experience": "Experience",
    "stack": "Stack",
    "schedule": "Book a call",
    "contact": "Contact"
  },
  "common": {
    "skipToContent": "Skip to content",
    "toggleTheme": "Switch theme",
    "selectLanguage": "Language"
  }
}
```

`src/messages/de.json`:

```json
{
  "_status": "machine",
  "nav": {
    "home": "Start",
    "work": "Arbeiten",
    "experience": "Erfahrung",
    "stack": "Stack",
    "schedule": "Termin buchen",
    "contact": "Kontakt"
  },
  "common": {
    "skipToContent": "Zum Inhalt springen",
    "toggleTheme": "Design wechseln",
    "selectLanguage": "Sprache"
  }
}
```

`src/messages/nl.json`:

```json
{
  "_status": "machine",
  "nav": {
    "home": "Home",
    "work": "Werk",
    "experience": "Ervaring",
    "stack": "Stack",
    "schedule": "Gesprek plannen",
    "contact": "Contact"
  },
  "common": {
    "skipToContent": "Naar inhoud",
    "toggleTheme": "Thema wisselen",
    "selectLanguage": "Taal"
  }
}
```

`src/messages/fa.json`:

```json
{
  "_status": "machine",
  "nav": {
    "home": "خانه",
    "work": "نمونه‌کارها",
    "experience": "سوابق",
    "stack": "ابزارها",
    "schedule": "رزرو جلسه",
    "contact": "تماس"
  },
  "common": {
    "skipToContent": "پرش به محتوا",
    "toggleTheme": "تغییر پوسته",
    "selectLanguage": "زبان"
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/i18n src/middleware.ts src/messages
git commit -m "feat: four-locale routing with rtl flag"
```

---

### Task 6: Root layout, theme provider and direction

**Files:**
- Create: `src/app/layout.tsx`, `src/app/[locale]/layout.tsx`, `src/app/[locale]/page.tsx`, `src/components/layout/ThemeProvider.tsx`, `src/components/layout/ThemeToggle.tsx`, `src/components/layout/LocaleSwitch.tsx`, `src/lib/cn.ts`

**Interfaces:**
- Consumes: `fontVariables` (Task 4); `routing`, `isRtl`, `Locale` (Task 5); `Link`, `usePathname`, `useRouter` from `src/lib/i18n/navigation`
- Produces: `cn(...inputs): string`; a rendered shell with `<html lang dir>`, `data-theme` toggling, and a working locale switch

- [ ] **Step 1: Write `src/lib/cn.ts`**

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Write the two layouts**

`src/app/layout.tsx` — a pass-through, because `[locale]/layout.tsx` owns `<html>`:

```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
```

`src/app/[locale]/layout.tsx`:

```tsx
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing, isRtl } from "@/lib/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import "@/styles/globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      dir={isRtl(locale) ? "rtl" : "ltr"}
      className={fontVariables}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Write the theme provider and toggle**

`src/components/layout/ThemeProvider.tsx`:

```tsx
"use client";

import { ThemeProvider as NextThemes } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemes>
  );
}
```

`src/components/layout/ThemeToggle.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("common");

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={t("toggleTheme")}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="grid size-9 place-items-center rounded-full text-dim transition-colors hover:text-text"
    >
      {/* Render a stable icon until mounted so SSR and client markup agree. */}
      {mounted && !isDark ? (
        <Sun className="size-4" aria-hidden />
      ) : (
        <Moon className="size-4" aria-hidden />
      )}
    </button>
  );
}
```

`src/components/layout/LocaleSwitch.tsx`:

```tsx
"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { locales } from "@/lib/i18n/routing";

const LABELS: Record<string, string> = {
  en: "EN",
  de: "DE",
  nl: "NL",
  fa: "فا",
};

export function LocaleSwitch() {
  const t = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">{t("selectLanguage")}</span>
      <select
        value={params.locale as string}
        onChange={(e) =>
          router.replace(
            // @ts-expect-error pathname is a validated route string
            { pathname, params },
            { locale: e.target.value },
          )
        }
        className="bg-transparent font-mono text-xs text-dim focus-visible:text-text"
      >
        {locales.map((l) => (
          <option key={l} value={l}>
            {LABELS[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
```

- [ ] **Step 4: Write a placeholder home page that proves the shell**

`src/app/[locale]/page.tsx`:

```tsx
import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LocaleSwitch } from "@/components/layout/LocaleSwitch";

export default function HomePage() {
  const t = useTranslations("nav");

  return (
    <main id="main" className="min-h-dvh p-8">
      <header className="flex items-center justify-between">
        <span className="font-mono text-xs text-dim">v2 · foundation</span>
        <div className="flex items-center gap-4">
          <LocaleSwitch />
          <ThemeToggle />
        </div>
      </header>
      <h1 className="mt-24 text-[length:var(--text-display)] tracking-[var(--tracking-display)] leading-[var(--leading-display)]">
        {t("home")}
      </h1>
    </main>
  );
}
```

- [ ] **Step 5: Verify the app boots and the guard still passes**

```bash
pnpm typecheck
pnpm test:tokens
pnpm build
```

Expected: all three PASS, and the build output lists `/en`, `/de`, `/nl`, `/fa`.

- [ ] **Step 6: Commit**

```bash
git add src/app src/components/layout src/lib/cn.ts
git commit -m "feat: localized shell with theme and dir"
```

---

### Task 7: Lint rules that enforce the constraints

**Files:**
- Modify: `eslint.config.mjs`

**Interfaces:**
- Consumes: the constraint list in Global Constraints
- Produces: `pnpm lint` fails on `framer-motion` imports, on `npm`/`yarn` lockfiles, and on physical-direction class strings

- [ ] **Step 1: Write the config**

Replace `eslint.config.mjs` with:

```js
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "framer-motion",
              message: "Import from 'motion/react' instead.",
            },
            {
              name: "@supabase/auth-helpers-nextjs",
              message: "Import from '@supabase/ssr' instead.",
            },
          ],
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    ignores: [".next/**", "node_modules/**", "scripts/**"],
  },
];
```

- [ ] **Step 2: Prove the import rule fires**

```bash
printf 'import { motion } from "framer-motion";\nexport const a = motion;\n' > src/lib/_probe.ts
pnpm lint
```

Expected: FAIL naming `src/lib/_probe.ts` and "Import from 'motion/react' instead."

- [ ] **Step 3: Remove the probe and confirm clean**

```bash
rm src/lib/_probe.ts
pnpm lint
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add eslint.config.mjs
git commit -m "chore: lint gates for imports and any"
```

---

### Task 8: Playwright shell tests and the a11y gate

**Files:**
- Create: `playwright.config.ts`, `tests/shell.spec.ts`, `tests/a11y.spec.ts`

**Interfaces:**
- Consumes: the running dev server and the routes produced in Task 6
- Produces: `pnpm test` covering locale routing, `dir`, theme persistence and axe cleanliness

- [ ] **Step 1: Write `playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm build && pnpm start",
    url: "http://localhost:3000/en",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
```

- [ ] **Step 2: Write the failing shell test**

`tests/shell.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("root redirects to the default locale", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/en$/);
});

test.describe("locale direction", () => {
  for (const [locale, dir] of [
    ["en", "ltr"],
    ["de", "ltr"],
    ["nl", "ltr"],
    ["fa", "rtl"],
  ] as const) {
    test(`${locale} renders dir=${dir}`, async ({ page }) => {
      await page.goto(`/${locale}`);
      await expect(page.locator("html")).toHaveAttribute("dir", dir);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
    });
  }
});

test("theme toggle flips data-theme and survives reload", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.getByRole("button", { name: /switch theme/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("paper colour actually changes between themes", async ({ page }) => {
  await page.goto("/en");
  const dark = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  await page.getByRole("button", { name: /switch theme/i }).click();
  const light = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  expect(dark).not.toBe(light);
});
```

- [ ] **Step 3: Run it and watch it pass against the real shell**

Run: `pnpm test`
Expected: PASS. If the theme test fails with `data-theme` absent, confirm `attribute="data-theme"` in `ThemeProvider`.

- [ ] **Step 4: Write the a11y gate**

`tests/a11y.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const locale of ["en", "fa"] as const) {
  for (const theme of ["dark", "light"] as const) {
    test(`${locale} / ${theme} has no axe violations`, async ({ page }) => {
      await page.goto(`/${locale}`);
      // Drive the real control. Setting the attribute by hand works until
      // next-themes rehydrates and overwrites it, which makes this flaky.
      if (theme === "light") {
        await page.getByRole("button", { name: /switch theme|تغییر پوسته/i }).click();
        await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
      }
      const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
        .analyze();
      expect(violations).toEqual([]);
    });
  }
}
```

- [ ] **Step 5: Run the full suite**

Run: `pnpm test`
Expected: all tests PASS. Contrast failures here mean a Layer 1 ramp needs adjusting in `tokens.css` — fix the token, never the component.

- [ ] **Step 6: Commit**

```bash
git add playwright.config.ts tests
git commit -m "test: shell routing, theme and axe gates"
```

---

### Task 9: Document the phase and hand off

**Files:**
- Create: `.hallmark/log.json`, `docs/decisions.md`
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: every decision made in Tasks 1–8
- Produces: a `CLAUDE.md` that matches the v2 reality, so later phases are not steered by v1's constitution

- [ ] **Step 1: Seed the hallmark log**

`.hallmark/log.json`:

```json
[
  {
    "date": "2026-09-19",
    "macrostructure": "Bento Grid",
    "theme": "custom",
    "theme_axes": "dark / grotesk-sans / warm-amber",
    "vibe": "instrument panel, measured, technical",
    "enrichment": "none",
    "brief": "fadaeixlii.dev v2 — AI and full-stack engineer portfolio"
  }
]
```

- [ ] **Step 2: Replace `CLAUDE.md` wholesale**

The v1 constitution names a stack and a workflow that no longer exist. Overwrite the file with:

```markdown
# fadaeixlii.dev — v2

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
- Host: own VPS, Docker + Caddy, Cloudflare proxy in front. Domain `fadaeixlii.dev`.

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
```

- [ ] **Step 3: Record the decisions**

`docs/decisions.md` — one line each, with the reason:

```markdown
# Decisions

- **2026-09-19 · Own VPS behind Cloudflare, not Vercel.** The box already runs `job` and `outreach`, so the marginal cost is zero and the deploy pattern exists. Cloudflare's free proxy supplies the edge cache, TLS and DDoS protection that a single-region origin cannot. The v1 Cloudflare Pages adapter was never actually installed — that doc was all TODOs.
- **2026-09-19 · Domain `fadaeixlii.dev`.** Matches the GitHub handle. `.dev` is HSTS-preloaded, so HTTPS is not optional.
- **2026-09-19 · Booking window 09:00–18:00 `Asia/Tehran`, Mon–Fri.** 08:00–16:00 would have ended at 13:30 Berlin, making every European afternoon unbookable on a site whose entire job is getting a call booked.
- **2026-09-19 · No `googleapis` package.** Three `fetch` calls replace a ~2 MB dependency.
- **2026-09-19 · Content as typed TS, not MDX.** With the blog cut, MDX earned nothing and cost three dependencies.
- **2026-09-19 · react-bits vendored, not installed.** MIT + Commons Clause; it ships as copy-paste source. Two components under `src/components/motion/` carry attribution headers.
- **2026-09-19 · `<Reveal>` is opt-in per section.** Fade-up on every section is the clearest generated-page tell; the primitive exists so the call is reversible in one place.
- **2026-09-19 · Amber on blue-slate.** Rejects both the template's orange/lime and the near-black + acid-accent AI default.
```

- [ ] **Step 4: Verify the whole gate set one final time**

```bash
pnpm lint && pnpm typecheck && pnpm test:tokens && pnpm test
```

Expected: four passes, no warnings.

- [ ] **Step 5: Commit and push the branch**

```bash
git add .hallmark docs/decisions.md CLAUDE.md
git commit -m "docs: v2 constitution and decision log"
git push -u origin feat/v2
```

---

## Phase exit criteria

Phase 1 is done when all of these hold:

- [ ] `v1-archive` tag and `archive/v1` branch exist on the remote, and `git show v1-archive:src/app/\(public\)/page.tsx` still prints v1 source
- [ ] `/` redirects to `/en`; all four locale routes render
- [ ] `/fa` renders `dir="rtl"` and Farsi nav labels in Vazirmatn, not a system fallback
- [ ] The theme toggle changes `data-theme`, changes the computed body background, and persists across reload
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test:tokens` and `pnpm test` all pass
- [ ] `check-tokens` has been demonstrated to fail on a planted violation and pass once removed
- [ ] No file outside `src/styles/tokens.css` contains a hex, `rgb()` or `oklch()` value
- [ ] `CLAUDE.md` describes v2, not v1
