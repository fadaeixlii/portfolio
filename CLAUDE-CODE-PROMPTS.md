# Claude Code — Portfolio Improvement Prompt Pack

Copy each block into Claude Code **inside `professional-portfolio/`**, one at a time, in order.
They assume your existing setup: the locked stack, the three-prompt pattern (analysis → verification → execution),
feature branches + PRs, and your installed agents (`design-reviewer`, `performance-auditor`,
`accessibility-checker`, `supabase-architect`, `seo-strategist`, `content-writer`) and skills
(`framer-motion-patterns`, `supabase-nextjs-integration`, `shadcn-component-import`).
Where design work is involved, lean on your global plugins (superpower, ponytail, frontend-design).

> Context I already applied via the data files (so don't redo these, just verify):
> renamed the 2024–25 company to **Exmodules** (DApp Solutions is the *project*), featured the
> **aim2balance reforestation mission** (Bergwaldprojekt eV), added **USDC** settlement to Roofcast,
> wired real **live URLs** (roofcast.io, intex.finance), and enriched `skills.json` + `stats`.
> Files touched: `src/content/{site,projects,experience,skills}.json` and
> `src/content/case-studies/{aim2balance,roofcast,dapp-solutions}.mdx`.

---

## 0 — Verify the content changes (start here)

```
On a new branch `chore/content-sync-audit`, audit the recent edits to src/content/*.json and
src/content/case-studies/*.mdx for correctness and consistency. Run all three phases and label them:

ANALYSIS: diff the four JSON files and three MDX files against the rest of the codebase. Find any place
that still references "DApp Solutions" as a *company* (it's now a project under Exmodules), any stale
"Resume on request" stat, any project whose `links.live` is rendered but empty, and any mismatch between
projects.json metrics/kpis and the matching case-study MDX.

VERIFICATION: run `pnpm typecheck` and `pnpm build`. Confirm the new live URLs (roofcast.io, intex.finance,
platform.aim2balance.ai, jeofferte.nl, meshi.nl) actually render as working external links on /work and the
case-study pages, with correct rel/target and no layout shift.

EXECUTION: fix only what the analysis surfaces. Then run @agent-content-writer over the aim2balance copy to
make sure the reforestation/Bergwaldprojekt framing reads as a confident differentiator, not a bolt-on.
Open a PR.
```

---

## 1 — Surface the environmental mission in the UI (design)

```
Feature aim2balance's reforestation mission visually, not just in copy. Branch `feat/home-mission-highlight`.
Use the superpower + frontend-design + ponytail plugins for the visual direction, and stay 100% within the
locked design system (bone/charcoal/ochre, 8pt grid, radii 4/8/16/full, semantic tokens only).

ANALYSIS: review the home page (src/app/(public)/page.tsx) and the aim2balance project card / case-study hero.
Propose ONE tasteful way to signal "AI platform that funds reforestation" — e.g. a single ochre stat or a
sustainability badge on the featured card — without adding a second hero motion hook.

VERIFICATION: confirm the proposal respects the motion budget (one signature hook total, ≤200ms elsewhere,
useReducedMotion, transform/opacity only) and adds <30KB gzipped to the route.

EXECUTION: implement it, then run @agent-design-reviewer for token/visual compliance before opening a PR.
```

---

## 2 — Refresh the About + Experience timeline (design + copy)

```
Branch `feat/about-experience-refresh`. The experience data now reflects 7 years across aim2balance (Co-Founder),
Zoof-it (Tech Lead), Exmodules, Intex, Panikar, 3gaam.

ANALYSIS: read src/app/(public)/about/page.tsx and src/components/marketing/ExperienceTimeline.tsx. Identify
where the Exmodules rename and the new Roofcast USDC / aim2balance mission details should surface, and whether
the timeline visually communicates the front-end → full-stack → co-founder arc.

VERIFICATION: check responsive behavior at 360 / 768 / 1280, reduced-motion, and that no copy overflows.

EXECUTION: apply the improvements, run @agent-content-writer on the About prose and @agent-design-reviewer on
the layout. PR when both pass.
```

---

## 3 — SEO + OG for the updated content

```
Branch `chore/seo-og-refresh`. Several project descriptions, the bio, and stats changed, plus two projects
gained live URLs.

Run @agent-seo-strategist + the seo-strategist/seo skill across: home, /work, /about, and the
aim2balance / roofcast / dapp-solutions case studies. Update generateMetadata descriptions to match the new
copy (mention reforestation for aim2balance, USDC/Polygon for roofcast), confirm each route still has an
opengraph-image.tsx that reflects current titles, and validate JSON-LD + sitemap entries for the projects
whose live links changed. Verify with `pnpm build`, then PR.
```

---

## 4 — Quality gates before merge

```
On the current feature branches, run the full pre-merge gate in parallel and apply every critical finding:
- @agent-design-reviewer  (token/visual compliance, no hardcoded hex)
- @agent-performance-auditor  (LCP <2.5s on 4G, bundle delta <30KB/route, run `pnpm analyze` if needed)
- @agent-accessibility-checker  (WCAG 2.2 AA on changed routes)

Then `pnpm typecheck`, `pnpm lint`, `pnpm test`. Report Lighthouse Perf/A11y/Best-Practices/SEO per changed
route (target ≥95). Do not declare done until all gates pass.
```

---

## 5 — Optional: data-driven resume export

```
Branch `feat/resume-from-content`. The "Resume on request" stat is gone — let's make the resume real and
always in sync. Generate a `/resume` route (and a downloadable PDF) sourced from the same
src/content/{site,experience,skills,projects}.json so it can never drift from the site. Match the print
layout to the design system. ANALYSIS → VERIFICATION → EXECUTION, then @agent-design-reviewer + PR.
```

### Tips
- If a prompt is too big for one pass, tell Claude Code: *"run ANALYSIS only, then stop for my review."*
- Keep the `chore/`, `feat/`, `fix/` branch naming and one PR per block — matches your constitution.
- Persian for discussion, English for deliverables, as your CLAUDE.md persona states.
