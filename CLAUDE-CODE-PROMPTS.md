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

---

## 6 — Full-repo quality & improvement sweep (design + code + review)

> The big one. Paste as-is for a whole-repo audit that fans out across every reviewer agent, skill,
> and review command you have installed, produces ONE prioritized backlog, then executes only the
> safe wins. Runs the three-phase pattern. If it's too big for one pass, say *"run ANALYSIS only,
> then stop for my review"* and it will stop after the backlog.

```
Do a full-repo quality and improvement sweep of this portfolio. Goal: surface every place the site
could be better — visual design, code quality, performance, accessibility, SEO, content, security —
then fix only the safe, high-confidence wins. Stay 100% inside the locked stack and design system in
CLAUDE.md. Work on branch `chore/full-repo-sweep`. Run all three phases and label them.

ANALYSIS — fan out in parallel, each writes findings with file:line and a severity (P0/P1/P2):
  DESIGN & TOKENS
    - @agent-design-reviewer across src/app and src/components: token compliance (no hardcoded hex,
      OKLCH only), 8pt grid, radii 4/8/16/full, typography scale, semantic color usage.
    - Apply the tailwind-design-system skill lens; flag any arbitrary values (text-[13px], py-3, etc.)
      that break the grid or scale.
    - @agent-animation-architect + framer-motion-patterns skill: motion budget (one hero hook,
      ≤200ms elsewhere), useReducedMotion guards, transform/opacity only, no layout-animating props.
  CODE QUALITY
    - Run /simplify and ponytail-audit over src/: dead code, reinvented stdlib, speculative
      abstractions, unused deps, components that should be Server Components but are 'use client'.
    - Run /code-review high on the working tree for correctness bugs.
    - Report the pre-existing eslint debt (currently ~8 errors in admin/messages, ContactForm,
      Header, HeroScene, ThemeToggle) and whether each is a real bug or a rule to satisfy.
  PERFORMANCE
    - @agent-performance-auditor: bundle size per route, unnecessary client components, large imports,
      LCP risk on / and /work, image formats (avif/webp), font loading. Run `pnpm analyze` if a route
      looks heavy.
  ACCESSIBILITY
    - @agent-accessibility-checker: WCAG 2.2 AA on /, /about, /work, /work/[slug], /contact — focus
      order, ARIA, contrast (bone/charcoal/ochre), keyboard nav, reduced motion, tap-target ≥24px
      (note the py-3 buttons).
  SEO
    - @agent-seo-strategist + seo-metadata-generator skill: every public route has generateMetadata +
      opengraph-image, title ≤60 / desc ≤155, canonical, JSON-LD (Person/CreativeWork/BreadcrumbList),
      sitemap + robots correctness. Confirm the new title "Full-Stack Developer · AI & Web3" propagated
      to metadata + JSON-LD jobTitle.
  CONTENT
    - @agent-content-writer over src/content/*.json + case-studies/*.mdx: voice (senior consultant,
      no buzzwords), every case study meets the ≥1-quantified-impact-metric gate in
      _docs/case-study-template.md, no stale claims, consistent tense/person.
  SECURITY
    - Run /security-review on the branch: env/secret handling, Supabase RLS assumptions, the contact
      action + admin routes, any dangerouslySetInnerHTML (the JSON-LD blocks).

VERIFICATION — consolidate all findings into ONE deduped, prioritized backlog (P0 blockers →
P1 should-fix → P2 nice-to-have). For each item: file:line, one-line problem, proposed fix, blast
radius, and whether it's a "safe win" (isolated, no behavior change, no new dep) or "needs review"
(design/UX judgment, schema change, or >1 route affected). Run `pnpm typecheck` and `pnpm build` to
confirm the current baseline is green before touching anything.

EXECUTION — apply ONLY the P0/P1 items marked "safe win". Skip anything needing a design or product
call and leave it in the backlog for me. After edits, re-run the relevant agents on the changed files,
then `pnpm typecheck` + `pnpm build` + `pnpm lint`. Do NOT regress the eslint count. Open a PR with the
full backlog in the description (checked = done, unchecked = deferred with reason). Use /create-pr.
```

> Companion one-liners (run any standalone, outside the sweep):
> - `/code-review high` — correctness pass on the current diff before a PR.
> - `/code-review ultra` — deep multi-agent cloud review of the whole branch (billed, user-triggered).
> - `/simplify` — quality-only cleanup (reuse, dead code, altitude) on changed files.
> - `/review-pr` — self-review an open PR with every reviewer subagent in parallel.
> - `ponytail-audit` — whole-repo over-engineering report; `ponytail-review` for a single diff.
> - `/security-review` — security pass on pending branch changes.

### Tips
- If a prompt is too big for one pass, tell Claude Code: *"run ANALYSIS only, then stop for my review."*
- Keep the `chore/`, `feat/`, `fix/` branch naming and one PR per block — matches your constitution.
- Persian for discussion, English for deliverables, as your CLAUDE.md persona states.
- Prompt 6 is the recurring one — re-run it before any release to catch regressions.

---

## 6 — Sync aim2balance to the new CV (2026-06-28)

```
Branch `feat/aim2balance-role-reposition`. My latest CV (resume-2026-06-28.md) repositions aim2balance:
the title is no longer "Co-Founder" — it's now "Full-Stack & AI Agentic Engineer" — and the engagement
ended in June 2026 (Nov 2025 – Jun 2026), so it is no longer "Present" / "Ongoing". Apply this everywhere,
staying inside the locked design system and the three-phase workflow.

ANALYSIS: grep the repo for aim2balance role/status/founder language. Expect these spots:
- src/content/experience.json (first entry): role "Co-Founder & Lead Engineer", period "2025 — Present",
  type "Co-Founder".
- src/content/projects.json (aim2balance): role "Co-Founder & Lead Engineer", duration "Ongoing",
  client "Own venture", team "Co-founded, 2-person core".
- src/content/site.json: bio + about paragraphs containing "Co-founded aim2balance.ai" / "I've co-founded
  a company".
- src/content/case-studies/aim2balance.mdx: role "Co-Founder & Lead Engineer", "I co-founded aim2balance.ai".
- Any availability/status copy implying the role is current.

EXECUTION:
- Set the role/title to "Full-Stack & AI Agentic Engineer" in experience.json, projects.json, and the
  aim2balance.mdx frontmatter. In experience.json set "type" to "Full-time" (or "Contract").
- Update dates/status: experience.json period "2025 — 2026"; projects.json duration "8 months" (Nov 2025 –
  Jun 2026); remove "Ongoing"/"Present" wording for this role anywhere it appears.
- Reframe founder-implying metadata to match the CV's "Spearheaded ... under Bergwaldprojekt eV":
  projects.json client "Own venture" -> "Bergwaldprojekt eV"; team "Co-founded, 2-person core" ->
  "2-person core engineering team". Soften narrative verbs "I co-founded" / "Co-founded" to "I built" /
  "Spearheaded" / "Led the build of" in site.json + aim2balance.mdx. KEEP the reforestation / environmental
  mission framing intact — only the founder title and the end date change.
- Lean into the new positioning: make sure the aim2balance copy reflects AI *agentic* engineering
  (LiteLLM model routing, multi-agent / automation work) so "Full-Stack & AI Agentic Engineer" is earned.

VERIFICATION: `pnpm typecheck` + `pnpm build`; confirm no remaining "Co-Founder"/"Present"/"Ongoing" for
aim2balance; run @agent-content-writer over the changed copy and @agent-design-reviewer if any card/hero
text reflows. Open a PR.
```

> Note: everything else in the new CV vs the prior version is cosmetic (verbs "Led"→"Directed",
> "assistant professor"→"Teaching Assistant", bullet rewording) and does not require portfolio changes.
