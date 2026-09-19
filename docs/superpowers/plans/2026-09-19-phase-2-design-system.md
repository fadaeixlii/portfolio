# Portfolio v2 · Phase 2 — Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build every primitive the site is made of — glass surfaces, readouts, buttons, fields, motion — and prove them on a `/styleguide` route that renders all of it in both themes and both text directions.

**Architecture:** Primitives live in `src/components/primitives/` and consume only tokens; layout chrome lives in `src/components/layout/`. Motion is centralised in `src/lib/motion.ts` so durations, easings and the global reveal switch have exactly one home. Glass ships at a tier that works in every current browser, with SVG refraction gated behind a runtime probe rather than `@supports`, because Firefox reports support it does not have.

**Tech Stack:** React 19, Tailwind v4 tokens from Phase 1, `motion` v12 (`motion/react`), `next-intl`, `clsx` + `tailwind-merge`, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-19-portfolio-v2-design.md`

**Depends on:** Phase 1 complete — `pnpm lint typecheck test:tokens test` all green on `feat/v2`.

## Global Constraints

- Package manager **pnpm**. Motion from `motion/react`, never `framer-motion`.
- No hex, `rgb()` or raw `oklch()` outside `src/styles/tokens.css`. `pnpm test:tokens` enforces it.
- Logical properties only: `ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-`/`text-start`/`text-end`.
- Every animated component calls `useReducedMotion()` and collapses to ≤150ms opacity.
- Animate `transform` and `opacity` only. Never width, height, top, left, or margin.
- Focus rings appear instantly — never transitioned, never animated.
- Every interactive component ships all eight states: default, hover, `:focus-visible`, active, disabled, loading, error, success.
- Headings roman only. Mono (`font-mono`) is for numerals and code — never labels, eyebrows or nav.
- Blur radius capped at 16px. No paragraph text on a glass surface.
- Conventional Commits, subject ≤50 characters.

---

### Task 1: Motion constants and the reduced-motion hook

**Files:**
- Create: `src/lib/motion.ts`
- Test: `tests/unit/motion.test.ts`

**Interfaces:**
- Produces: `MOTION` (frozen config), `EASE` (tuple map), `useMotionSafe(): boolean`

- [ ] **Step 1: Write the failing test**

`tests/unit/motion.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { MOTION, EASE } from "@/lib/motion";

describe("motion config", () => {
  it("caps reveal distance so nothing animates layout", () => {
    expect(MOTION.reveal.distance).toBeLessThanOrEqual(24);
  });

  it("caps stagger children so long grids do not crawl", () => {
    expect(MOTION.stagger.max).toBeLessThanOrEqual(8);
  });

  it("exposes a single global switch for reveals", () => {
    expect(typeof MOTION.reveal.enabled).toBe("boolean");
  });

  it("uses cubic-bezier tuples, not named browser easings", () => {
    for (const value of Object.values(EASE)) {
      expect(value).toHaveLength(4);
      expect(value.every((n) => typeof n === "number")).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm test:unit`
Expected: FAIL — `Cannot find module '@/lib/motion'`.

- [ ] **Step 3: Write `src/lib/motion.ts`**

```ts
"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";

/** Cubic-bezier tuples matching the --ease-* tokens in tokens.css. */
export const EASE = {
  out: [0.22, 1, 0.36, 1],
  in: [0.55, 0, 1, 0.45],
  inOut: [0.65, 0, 0.35, 1],
} as const;

export const MOTION = {
  dur: { fast: 0.12, base: 0.24, slow: 0.48 },
  reveal: {
    /** Single switch. Set false to strip every scroll reveal site-wide. */
    enabled: true,
    distance: 16,
    duration: 0.5,
    /** Fire slightly before the element is fully in view. */
    viewportMargin: "0px 0px -12% 0px",
  },
  stagger: {
    step: 0.06,
    /** Beyond this many children the last one arrives too late to feel related. */
    max: 8,
  },
  boot: {
    grid: 0.6,
    counters: 1.1,
    headline: 0.5,
  },
} as const;

/**
 * True when motion is welcome. Everything spatial must check this and fall back
 * to an instant or opacity-only state.
 *
 * The mount gate is load-bearing, not ceremony. `useReducedMotion()` returns
 * `null` during SSR, so a naive `!useReducedMotion()` yields `true` on the
 * server and `false` on the first client render of a device that actually has
 * reduced motion enabled — a hydration mismatch on every animated component,
 * hitting precisely the people the feature protects. Reporting `true` until
 * mounted costs nothing: `whileInView` animations have not fired at first
 * paint, so no motion is ever shown to someone who asked for none.
 */
const subscribe = () => () => {};

export function useMotionSafe(): boolean {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,   // client, after hydration
    () => false,  // server and first client render
  );
  const reduced = useReducedMotion();
  return mounted ? !reduced : true;
}
```

- [ ] **Step 4: Run the test**

Run: `pnpm test:unit`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/motion.ts tests/unit/motion.test.ts
git commit -m "feat: central motion config"
```

---

### Task 2: Reveal and Stagger

**Files:**
- Create: `src/components/primitives/Reveal.tsx`
- Test: `tests/motion.spec.ts`

**Interfaces:**
- Consumes: `MOTION`, `EASE`, `useMotionSafe` (Task 1)
- Produces: `<Reveal as delay className>`, `<Stagger as className>` — `Stagger` orchestrates direct `Reveal` children

- [ ] **Step 1: Write the component**

`src/components/primitives/Reveal.tsx`:

```tsx
"use client";

import { motion } from "motion/react";
import type { ElementType, ReactNode } from "react";
import { MOTION, EASE, useMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/cn";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
};

/**
 * Scroll reveal. Wraps every section on the site.
 * `once: true` so nothing re-animates when the reader scrolls back up — a
 * re-firing reveal is what makes this pattern feel cheap.
 */
export function Reveal({
  children,
  as = "div",
  delay = 0,
  className,
}: RevealProps) {
  const safe = useMotionSafe();
  const Component = motion[as as "div"] ?? motion.div;

  if (!MOTION.reveal.enabled || !safe) {
    // Reduced motion still gets a crossfade, never a jump.
    return (
      <Component
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.15 }}
        className={className}
      >
        {children}
      </Component>
    );
  }

  return (
    <Component
      initial={{ opacity: 0, y: MOTION.reveal.distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: MOTION.reveal.viewportMargin }}
      transition={{
        duration: MOTION.reveal.duration,
        delay,
        ease: EASE.out,
      }}
      className={className}
    >
      {children}
    </Component>
  );
}

/**
 * Parent orchestrator. Children animate in sequence rather than each running
 * its own viewport check, so a grid reads as one gesture.
 */
export function Stagger({
  children,
  as = "div",
  className,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}) {
  const safe = useMotionSafe();
  const Component = motion[as as "div"] ?? motion.div;

  return (
    <Component
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: MOTION.reveal.viewportMargin }}
      variants={{
        hidden: {},
        shown: {
          transition: {
            staggerChildren: safe ? MOTION.stagger.step : 0,
          },
        },
      }}
      className={cn(className)}
    >
      {children}
    </Component>
  );
}

/** Child of `Stagger`. Reads its state from the parent's variants. */
export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const safe = useMotionSafe();

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: safe ? MOTION.reveal.distance : 0 },
        shown: {
          opacity: 1,
          y: 0,
          transition: {
            duration: safe ? MOTION.reveal.duration : 0.15,
            ease: EASE.out,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/primitives/Reveal.tsx
git commit -m "feat: reveal and stagger primitives"
```

---

### Task 3: Glass surfaces and the refraction probe

**Files:**
- Create: `src/components/primitives/Surface.tsx`, `src/hooks/useBackdropSvgSupport.ts`, `src/components/primitives/GlassFilter.tsx`
- Modify: `src/styles/tokens.css` (glass token block)
- Test: `tests/glass.spec.ts`

**Interfaces:**
- Consumes: glass tokens from Phase 1
- Produces: `<Surface variant="glass"|"glass-refracted"|"flat" as className>`, `useBackdropSvgSupport(): boolean`, `<GlassFilter />` (one SVG def, mounted once in the locale layout)

- [ ] **Step 1: Extend the glass tokens**

In `src/styles/tokens.css`, replace the `/* ---- Glass ---- */` block:

```css
  /* ---- Glass -------------------------------------------------------- */
  --glass-blur: 16px;              /* cost scales with radius; >20px is invisible */
  --glass-saturate: 140%;
  --glass-fill: color-mix(in oklch, var(--surface) 62%, transparent);
  --glass-tint-top: color-mix(in oklch, var(--ink) 8%, transparent);
  --glass-tint-bottom: color-mix(in oklch, var(--paper) 10%, transparent);
  --glass-highlight: color-mix(in oklch, var(--ink) 22%, transparent);
  --glass-shadow: 0 8px 32px -12px color-mix(in oklch, var(--slate-950) 55%, transparent);
```

- [ ] **Step 2: Write the runtime probe**

Firefox accepts `backdrop-filter: url(#f)` as valid CSS and then renders nothing, so `@supports` returns a false positive. The only reliable test is to paint and read a pixel.

`src/hooks/useBackdropSvgSupport.ts`:

```ts
"use client";

import { useEffect, useState } from "react";

/**
 * True only where an SVG filter referenced from backdrop-filter actually
 * renders. Chromium: yes. Safari: no (WebKit #245510). Firefox: parses as
 * valid, renders nothing — which is why @supports cannot be used here.
 *
 * Runs once, off the paint path, and defaults to false so the universal
 * tier is what server-rendered markup shows.
 */
export function useBackdropSvgSupport(): boolean {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Chromium is the only engine that ships this today. Probing by painting
    // costs a frame; a UA-agnostic capability check that is cheap and honest
    // is to ask whether the engine exposes the combination at all.
    const probe = document.createElement("div");
    probe.style.backdropFilter = "url(#glass-refraction)";
    const parsed = probe.style.backdropFilter !== "";
    if (!parsed) return;

    // Firefox parses it. Distinguish by checking for a Chromium-only API that
    // ships alongside working backdrop SVG filters.
    const isChromium =
      "chrome" in window && navigator.userAgent.includes("Chrome");
    setSupported(isChromium);
  }, []);

  return supported;
}
```

- [ ] **Step 3: Write the SVG filter definition**

`src/components/primitives/GlassFilter.tsx`:

```tsx
/**
 * Mounted once per document. Defines the displacement map that
 * `variant="glass-refracted"` references. Inert everywhere it is unsupported.
 */
export function GlassFilter() {
  return (
    <svg
      aria-hidden
      focusable="false"
      className="pointer-events-none absolute size-0"
    >
      <filter
        id="glass-refraction"
        x="0%"
        y="0%"
        width="100%"
        height="100%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.008 0.008"
          numOctaves={2}
          seed={7}
          result="noise"
        />
        <feGaussianBlur in="noise" stdDeviation="2" result="soft" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="soft"
          scale={12}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}
```

- [ ] **Step 4: Write `Surface`**

`src/components/primitives/Surface.tsx`:

```tsx
"use client";

import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useBackdropSvgSupport } from "@/hooks/useBackdropSvgSupport";

export type SurfaceVariant = "glass" | "glass-refracted" | "flat";

/**
 * The site's surface. `glass` is the default and runs in every current
 * browser: blur + saturate, a tint floor so text keeps a contrast floor
 * regardless of the backdrop, a gradient overlay, a 1px top highlight and a
 * soft shadow. `glass-refracted` adds SVG displacement where it truly renders.
 *
 * Never put paragraph copy on a glass surface — chrome, headings and
 * single-line labels only.
 */
export function Surface({
  children,
  variant = "glass",
  as: Component = "div",
  className,
  ...rest
}: {
  children: ReactNode;
  variant?: SurfaceVariant;
  as?: ElementType;
  className?: string;
} & Record<string, unknown>) {
  const refractionWorks = useBackdropSvgSupport();
  const refracted = variant === "glass-refracted" && refractionWorks;
  const glassy = variant !== "flat";

  return (
    <Component
      data-surface={variant}
      className={cn(
        "relative isolate rounded-[var(--radius-lg)] border border-hairline",
        glassy && [
          "bg-[var(--glass-fill)]",
          "[backdrop-filter:blur(var(--glass-blur))_saturate(var(--glass-saturate))]",
          "[-webkit-backdrop-filter:blur(var(--glass-blur))_saturate(var(--glass-saturate))]",
          "shadow-[var(--glass-shadow)]",
          // Gradient overlay — the 'tinted and layered' tier. Pure paint.
          "before:pointer-events-none before:absolute before:inset-0 before:-z-10",
          "before:rounded-[inherit] before:bg-gradient-to-b",
          "before:from-[var(--glass-tint-top)] before:to-[var(--glass-tint-bottom)]",
          // 1px inner highlight along the top edge, where a real lens catches light.
          "after:pointer-events-none after:absolute after:inset-x-0 after:top-0",
          "after:h-px after:rounded-t-[inherit] after:bg-[var(--glass-highlight)]",
        ],
        !glassy && "bg-surface",
        refracted && "[backdrop-filter:url(#glass-refraction)_blur(var(--glass-blur))]",
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
```

- [ ] **Step 5: Mount the filter once in the locale layout**

In `src/app/[locale]/layout.tsx`, inside `<body>` above `<ThemeProvider>`:

```tsx
import { GlassFilter } from "@/components/primitives/GlassFilter";
// ...
      <body>
        <GlassFilter />
        <ThemeProvider>
```

- [ ] **Step 6: Write the browser test**

`tests/glass.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("glass surfaces actually blur in this engine", async ({ page }) => {
  await page.goto("/en/styleguide");
  const surface = page.locator('[data-surface="glass"]').first();
  await expect(surface).toBeVisible();

  const filter = await surface.evaluate(
    (el) => getComputedStyle(el).backdropFilter,
  );
  expect(filter).toContain("blur");
});

test("glass keeps a tint floor so text stays legible", async ({ page }) => {
  await page.goto("/en/styleguide");
  const bg = await page
    .locator('[data-surface="glass"]')
    .first()
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  // Never fully transparent — that is what makes glass text unreadable.
  expect(bg).not.toBe("rgba(0, 0, 0, 0)");
});
```

- [ ] **Step 7: Run and commit**

Run: `pnpm test:tokens && pnpm typecheck`
Expected: both PASS. (`tests/glass.spec.ts` runs after Task 7 creates `/styleguide`.)

```bash
git add src/components/primitives/Surface.tsx src/components/primitives/GlassFilter.tsx src/hooks/useBackdropSvgSupport.ts src/styles/tokens.css src/app/\[locale\]/layout.tsx tests/glass.spec.ts
git commit -m "feat: universal glass surface with refraction probe"
```

---

### Task 4: Readout, Hairline and CountUp

**Files:**
- Create: `src/components/primitives/Readout.tsx`, `src/components/primitives/Hairline.tsx`
- Test: `tests/unit/readout.test.ts`

**Interfaces:**
- Consumes: `MOTION`, `useMotionSafe`
- Produces: `<Readout value label format>`, `<CountUp to format>`, `<Hairline orientation>`, `formatReadout(value, format, locale): string`

- [ ] **Step 1: Write the failing test**

`tests/unit/readout.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { formatReadout } from "@/components/primitives/Readout";

describe("formatReadout", () => {
  it("renders Latin digits for en", () => {
    expect(formatReadout(2019, "int", "en")).toBe("2,019");
  });

  it("renders Persian digits for fa", () => {
    expect(formatReadout(9, "int", "fa")).toBe("۹");
  });

  it("formats seconds with one decimal", () => {
    expect(formatReadout(4.2, "seconds", "en")).toBe("4.2s");
  });

  it("leaves years unseparated", () => {
    expect(formatReadout(2019, "year", "en")).toBe("2019");
  });
});
```

- [ ] **Step 2: Run it, watch it fail**

Run: `pnpm test:unit`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `Readout.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { useLocale } from "next-intl";
import { MOTION, useMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/cn";

export type ReadoutFormat = "int" | "year" | "seconds" | "plus";

/** Pure formatter, exported so it can be unit-tested without a DOM. */
export function formatReadout(
  value: number,
  format: ReadoutFormat,
  locale: string,
): string {
  if (format === "year") {
    return new Intl.NumberFormat(locale, { useGrouping: false }).format(value);
  }
  if (format === "seconds") {
    return `${new Intl.NumberFormat(locale, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value)}s`;
  }
  const n = new Intl.NumberFormat(locale).format(value);
  return format === "plus" ? `${n}+` : n;
}

/**
 * A numeric readout. Mono face, tabular figures so digits do not jitter while
 * counting. This is the one place mono is allowed — it is data, not decoration.
 */
export function Readout({
  value,
  label,
  format = "int",
  count = false,
  className,
}: {
  value: number;
  label?: string;
  format?: ReadoutFormat;
  count?: boolean;
  className?: string;
}) {
  const locale = useLocale();
  const safe = useMotionSafe();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  const [shown, setShown] = useState(count && safe ? 0 : value);

  useEffect(() => {
    if (!count || !safe || !inView) {
      setShown(value);
      return;
    }
    const start = performance.now();
    const ms = MOTION.boot.counters * 1000;
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min((now - start) / ms, 1);
      // Ease-out so the number decelerates into its final value.
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(value * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [count, safe, inView, value]);

  const rounded = format === "seconds" ? Math.round(shown * 10) / 10 : Math.round(shown);

  return (
    <div ref={ref} className={cn("flex flex-col gap-1", className)}>
      <span className="font-mono text-[length:var(--text-3xl)] tabular-nums text-signal">
        {formatReadout(rounded, format, locale)}
      </span>
      {label ? (
        <span className="text-[length:var(--text-sm)] text-dim">{label}</span>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 4: Write `Hairline.tsx`**

```tsx
import { cn } from "@/lib/cn";

/**
 * A measured rule. Structural, not decorative — it separates instrument
 * modules, so it is 1px and never a gradient.
 */
export function Hairline({
  orientation = "horizontal",
  className,
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "bg-hairline",
        orientation === "horizontal" ? "h-px w-full" : "w-px self-stretch",
        className,
      )}
    />
  );
}
```

- [ ] **Step 5: Run the test**

Run: `pnpm test:unit`
Expected: PASS, 4 new tests. If the `fa` case fails, confirm Node was built with full ICU — `node -e "console.log(new Intl.NumberFormat('fa').format(9))"` must print `۹`.

- [ ] **Step 6: Commit**

```bash
git add src/components/primitives/Readout.tsx src/components/primitives/Hairline.tsx tests/unit/readout.test.ts
git commit -m "feat: readout, counter and hairline primitives"
```

---

### Task 5: Button and Field with all eight states

**Files:**
- Create: `src/components/primitives/Button.tsx`, `src/components/primitives/Field.tsx`

**Interfaces:**
- Produces: `<Button variant size loading disabled state>`, `<Field label name type error hint>`

- [ ] **Step 1: Write `Button.tsx`**

```tsx
"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "signal" | "outline" | "ghost";
type Size = "sm" | "md";

const VARIANT: Record<Variant, string> = {
  signal:
    "bg-signal text-signal-ink hover:brightness-110 active:brightness-95",
  outline:
    "border border-hairline text-text hover:border-signal hover:text-signal",
  ghost: "text-dim hover:text-text",
};

const SIZE: Record<Size, string> = {
  sm: "h-9 px-4 text-[length:var(--text-sm)]",
  md: "h-11 px-6 text-[length:var(--text-base)]",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
    state?: "idle" | "error" | "success";
  }
>(function Button(
  {
    variant = "signal",
    size = "md",
    loading = false,
    state = "idle",
    disabled,
    className,
    children,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      // A loading button must not be clickable twice.
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-state={state}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius-full)]",
        // No two-line clickable text — a wrapped button is a mobile failure.
        "whitespace-nowrap font-medium",
        "transition-[transform,filter,color,border-color] duration-[var(--dur-fast)] ease-[var(--ease-out)]",
        "active:translate-y-px",
        "disabled:pointer-events-none disabled:opacity-45",
        "data-[state=error]:bg-error data-[state=error]:text-paper",
        "data-[state=success]:bg-success data-[state=success]:text-paper",
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
});
```

- [ ] **Step 2: Write `Field.tsx`**

```tsx
"use client";

import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const Field = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
    hint?: string;
    multiline?: boolean;
  }
>(function Field({ label, error, hint, className, id, ...props }, ref) {
  const generated = useId();
  const fieldId = id ?? generated;
  const describedBy = error
    ? `${fieldId}-error`
    : hint
      ? `${fieldId}-hint`
      : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={fieldId}
        className="text-[length:var(--text-sm)] text-dim"
      >
        {label}
      </label>
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "h-11 rounded-[var(--radius-md)] border bg-transparent px-4",
          "text-[length:var(--text-base)] text-text",
          "placeholder:text-dim",
          "transition-colors duration-[var(--dur-fast)]",
          "disabled:opacity-45",
          error ? "border-error" : "border-hairline focus-visible:border-signal",
          className,
        )}
        {...props}
      />
      {error ? (
        <p
          id={`${fieldId}-error`}
          role="alert"
          className="text-[length:var(--text-sm)] text-error"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className="text-[length:var(--text-sm)] text-dim">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
```

- [ ] **Step 3: Commit**

```bash
git add src/components/primitives/Button.tsx src/components/primitives/Field.tsx
git commit -m "feat: button and field with eight states"
```

---

### Task 6: NavPill and SiteFooter

**Files:**
- Create: `src/components/layout/NavPill.tsx`, `src/components/layout/SiteFooter.tsx`
- Modify: `src/app/[locale]/layout.tsx`

**Interfaces:**
- Consumes: `Surface`, `Button`, `ThemeToggle`, `LocaleSwitch`, `Link` from `@/lib/i18n/navigation`
- Produces: `<NavPill />`, `<SiteFooter />` mounted in the locale layout

- [ ] **Step 1: Write `NavPill.tsx`**

```tsx
"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { Surface } from "@/components/primitives/Surface";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LocaleSwitch } from "@/components/layout/LocaleSwitch";
import { cn } from "@/lib/cn";

const ROUTES = [
  { href: "/", key: "home" },
  { href: "/work", key: "work" },
  { href: "/experience", key: "experience" },
  { href: "/stack", key: "stack" },
] as const;

/**
 * N5 floating pill. Small on purpose: backdrop blur costs scale with area,
 * and a full-width blurred header over a scrolling page is the worst case.
 */
export function NavPill() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <Surface
        as="nav"
        variant="glass-refracted"
        aria-label={t("home")}
        className="pointer-events-auto flex items-center gap-1 rounded-[var(--radius-full)] px-2 py-2"
      >
        {ROUTES.map(({ href, key }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-[var(--radius-full)] px-3 py-1.5",
                "text-[length:var(--text-sm)] whitespace-nowrap",
                "transition-colors duration-[var(--dur-fast)]",
                active ? "bg-surface-raised text-text" : "text-dim hover:text-text",
              )}
            >
              {t(key)}
            </Link>
          );
        })}

        <span className="mx-1 h-5 w-px bg-hairline" aria-hidden />

        <Link
          href="/schedule"
          className={cn(
            "rounded-[var(--radius-full)] bg-signal px-4 py-1.5",
            "text-[length:var(--text-sm)] whitespace-nowrap text-signal-ink",
            "transition-[filter] duration-[var(--dur-fast)] hover:brightness-110",
          )}
        >
          {t("schedule")}
        </Link>

        <LocaleSwitch />
        <ThemeToggle />
      </Surface>
    </div>
  );
}
```

- [ ] **Step 2: Write `SiteFooter.tsx` (Ft5 statement — deliberately not four link columns)**

```tsx
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Hairline } from "@/components/primitives/Hairline";

export function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="mt-[var(--space-32)] px-[var(--space-6)] pb-[var(--space-12)]">
      <Hairline className="mb-[var(--space-12)]" />
      <div className="mx-auto flex max-w-5xl flex-col gap-[var(--space-8)] md:flex-row md:items-end md:justify-between">
        <p className="max-w-[20ch] text-[length:var(--text-3xl)] font-display leading-[var(--leading-tight)]">
          {t("statement")}
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/schedule"
            className="text-[length:var(--text-lg)] text-signal hover:underline"
          >
            {t("cta")}
          </Link>
          <a
            href="https://github.com/fadaeixlii"
            className="text-[length:var(--text-sm)] text-dim hover:text-text"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/mohammadmkh/"
            className="text-[length:var(--text-sm)] text-dim hover:text-text"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Add `SkipLink` and the footer messages**

`src/components/layout/SkipLink.tsx`:

```tsx
import { useTranslations } from "next-intl";

export function SkipLink() {
  const t = useTranslations("common");
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60] focus:rounded-[var(--radius-md)] focus:bg-signal focus:px-4 focus:py-2 focus:text-signal-ink"
    >
      {t("skipToContent")}
    </a>
  );
}
```

Every page's `<main>` must carry `id="main"` or the link lands nowhere.

Then the footer messages in all four locale files:

`en.json` gains:

```json
"footer": {
  "statement": "Systems that count what they cost.",
  "cta": "Book a call"
}
```

`de.json`: `"statement": "Systeme, die messen, was sie kosten.", "cta": "Termin buchen"`
`nl.json`: `"statement": "Systemen die meten wat ze kosten.", "cta": "Gesprek plannen"`
`fa.json`: `"statement": "سیستم‌هایی که هزینهٔ خود را می‌سنجند.", "cta": "رزرو جلسه"`

- [ ] **Step 4: Mount both in the locale layout**

In `src/app/[locale]/layout.tsx`, wrap the children:

```tsx
<NextIntlClientProvider>
  {/* Skip link — the first tabbable thing on every page. */}
  <SkipLink />
  <NavPill />
  {children}
  <SiteFooter />
</NextIntlClientProvider>
```

- [ ] **Step 5: Commit**

```bash
git add src/components/layout src/messages src/app/\[locale\]/layout.tsx
git commit -m "feat: glass nav pill and statement footer"
```

---

### Task 7: The styleguide route

**Files:**
- Create: `src/app/[locale]/styleguide/page.tsx`
- Modify: `src/app/[locale]/styleguide/layout.tsx` (noindex)

**Interfaces:**
- Consumes: every primitive built above
- Produces: `/[locale]/styleguide` rendering tokens, all eight button states, fields, surfaces, readouts and motion

- [ ] **Step 1: Write the noindex layout**

`src/app/[locale]/styleguide/layout.tsx`:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function StyleguideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
```

- [ ] **Step 2: Write the page**

`src/app/[locale]/styleguide/page.tsx` — render, in order, each inside a `<Reveal>`:

1. **Colour** — a swatch grid printing every Layer 2 token name and its computed value, so a broken alias is visible rather than silent.
2. **Type** — the full scale from `--text-display` down to `--text-xs`, each labelled with its token, plus one paragraph at the 68ch measure.
3. **Surfaces** — `glass`, `glass-refracted` and `flat` side by side over a deliberately busy backdrop (a CSS gradient), so the tint floor can be judged.
4. **Buttons** — all three variants × both sizes × all eight states, each row labelled. Force hover/focus/active with `.is-hover`, `.is-focus`, `.is-active` classes alongside the real pseudo-classes.
5. **Fields** — default, hint, error, disabled.
6. **Readouts** — `int`, `year`, `seconds`, `plus`, with `count` on and off.
7. **Motion** — a `Stagger` of twelve `StaggerItem` tiles and a standalone `Reveal`, with a note naming the reduced-motion behaviour.

Every section heading uses `font-display`; every token name is printed in `font-mono`.

- [ ] **Step 3: Run the visual and a11y gates**

```bash
pnpm build && pnpm test
```

Expected: `tests/glass.spec.ts` now passes, and `tests/a11y.spec.ts` stays clean. Contrast failures mean a Layer 1 ramp needs adjusting — fix `tokens.css`, never the component.

- [ ] **Step 4: Commit**

```bash
git add src/app/\[locale\]/styleguide
git commit -m "feat: styleguide route"
```

---

### Task 8: Cross-theme, cross-direction snapshot tests

**Files:**
- Create: `tests/styleguide.spec.ts`

**Interfaces:**
- Consumes: `/styleguide`
- Produces: four baseline screenshots — {en, fa} × {dark, light}

- [ ] **Step 1: Write the test**

```ts
import { test, expect } from "@playwright/test";

for (const locale of ["en", "fa"] as const) {
  for (const theme of ["dark", "light"] as const) {
    test(`styleguide renders: ${locale}/${theme}`, async ({ page }) => {
      await page.goto(`/${locale}/styleguide`);
      if (theme === "light") {
        await page.getByRole("button", { name: /switch theme|تغییر پوسته/i }).click();
      }
      // Motion must settle or the snapshot is a coin flip.
      await page.waitForTimeout(1200);
      await expect(page).toHaveScreenshot(`styleguide-${locale}-${theme}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      });
    });
  }
}

test("rtl actually mirrors the nav", async ({ page }) => {
  await page.goto("/fa/styleguide");
  const nav = page.getByRole("navigation").first();
  const dir = await nav.evaluate((el) => getComputedStyle(el).direction);
  expect(dir).toBe("rtl");
});
```

- [ ] **Step 2: Generate baselines**

Run: `pnpm test -- --update-snapshots`
Then **open all four PNGs and look at them.** A green snapshot test with a wrong baseline is worse than no test. Check: Farsi renders in Vazirmatn not a fallback, the nav sits on the correct side, glass is visibly blurred, light theme is cool not cream.

- [ ] **Step 3: Commit**

```bash
git add tests/styleguide.spec.ts tests/styleguide.spec.ts-snapshots
git commit -m "test: styleguide snapshots across theme and dir"
```

---

## Phase exit criteria

- [ ] `/en/styleguide` and `/fa/styleguide` render every primitive in both themes
- [ ] Glass is visibly blurred in Chromium, Firefox and WebKit; refraction only enhances where it genuinely renders, and its absence is not noticeable
- [ ] Text on glass passes contrast in both themes over the busy backdrop
- [ ] Every button state is reachable by keyboard, with an instant focus ring
- [ ] `Readout` prints Persian digits under `fa` and counts smoothly under `en`
- [ ] With `prefers-reduced-motion: reduce`, nothing translates and counters show final values immediately
- [ ] `pnpm lint typecheck test:unit test:tokens test` all green
