# Decisions

- **2026-09-19 · Own VPS behind Cloudflare, not Vercel.** The box already runs `job` and `outreach`, so the marginal cost is zero and the deploy pattern exists. Cloudflare's free proxy supplies the edge cache, TLS and DDoS protection that a single-region origin cannot. The v1 Cloudflare Pages adapter was never actually installed — that doc was all TODOs.
- **2026-09-19 · Domain `mohammadmkh.dev`.** Matches the GitHub handle. `.dev` is HSTS-preloaded, so HTTPS is not optional.
- **2026-09-19 · Booking window 09:00–18:00 `Asia/Tehran`, Mon–Fri.** 08:00–16:00 would have ended at 13:30 Berlin, making every European afternoon unbookable on a site whose entire job is getting a call booked.
- **2026-09-19 · No `googleapis` package.** Three `fetch` calls replace a ~2 MB dependency.
- **2026-09-19 · Content as typed TS, not MDX.** With the blog cut, MDX earned nothing and cost three dependencies.
- **2026-09-19 · react-bits vendored, not installed.** MIT + Commons Clause; it ships as copy-paste source. Two components under `src/components/motion/` carry attribution headers.
- **2026-09-19 · `<Reveal>` is opt-in per section.** Fade-up on every section is the clearest generated-page tell; the primitive exists so the call is reversible in one place.
- **2026-09-19 · Amber on blue-slate.** Rejects both the template's orange/lime and the near-black + acid-accent AI default.
- **2026-09-19 · `middleware.ts` is `proxy.ts` in Next 16.** Verified in `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`. A file named `middleware.ts` is silently ignored, so locale routing would never have run.
- **2026-09-19 · No `--radius-*` mapping in `@theme inline`.** Tailwind v4 reserves that namespace, so `--radius-sm: var(--radius-sm)` resolves to itself. Radii are used as arbitrary values, `rounded-[var(--radius-lg)]`, reading Layer 1 directly.
- **2026-09-19 · Pages use React's `use(params)`, not `await params`.** Awaiting makes the component async, where `useTranslations` throws. `use()` keeps it synchronous so `setRequestLocale` and the hook coexist, and the routes stay prerendered.
- **2026-09-19 · `ThemeToggle` uses `useSyncExternalStore` as its mount flag.** The `useState` + `useEffect` pattern trips `react-hooks/set-state-in-effect`; this shape gives identical server and first-client markup, so there is no hydration mismatch.
- **2026-09-19 · Display name is "Mohammad M. Khani".** The formal "Mohammad MohammadKhani" is for formal contexts only. Farsi keeps the natural compound "محمد محمدخانی" because Persian does not use middle initials.
