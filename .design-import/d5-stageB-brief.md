# Modernist import — Part 2: page layouts

Part 1 landed the tokens, nav and footer (commits `49553ac`, `3e0edbb`, `91cc41f`).
Part 2 rebuilds the page layouts to match the imported design.

Read first, both binding:
- `.design-import/MODERNIST-SPEC.md` — the design contract, including the
  **"What must NOT be implemented"** table. That table is not advisory.
- `docs/superpowers/specs/2026-09-19-portfolio-v2-design.md` — the project spec.
  Where the two disagree, MODERNIST-SPEC wins on *visual* questions and the project
  spec wins on *content and claims*.

## Branch

Work on `main`. Commit to `main`. Do not create a branch, do not create a worktree.

## Rules that hold across every stage

**Colour.** `src/styles/tokens.css` is the only file allowed to author a colour. No hex,
no `oklch(...)`, no `rgb(...)` anywhere else — `pnpm test:tokens` fails the build if you
try. Use the semantic utilities.

`--signal` is a **fill** role: `bg-signal`, `border-signal`. It is 3.75:1 on paper in the
light theme, below AA for text. Signal-coloured *text* uses `text-signal-text`. A guard in
`scripts/check-tokens.mjs` enforces this; do not weaken it.

**Geometry.** Radius is 0 everywhere except `--radius-full` (the availability dot, the
avatar). Dividers and boxes are `2px solid`, not 1px. Sections are 88px apart. The content
column caps at 1180px.

**Imagery.** Every project screenshot and the portrait carry `filter: var(--shot)`.

**RTL.** Farsi is a first-class locale. Use logical properties only — `ms-*`/`me-*`,
`ps-*`/`pe-*`, `start-*`/`end-*`, `text-start`/`text-end`. No `ml-*`, `pr-*`, `left-*`.
Every element holding content text gets `dir="auto"`.

**Prose.** Apply `/hallmark`, `/no-slop:no-slop` and `/no-ai-slop` to every string you
write or touch. Specifically:
- No `↗` or `→` inside link text. Keep the affordance as a separate `aria-hidden` element.
- No `A · B` middle-dot strings. Render as two elements.
- No small uppercase kicker above a heading. ALL-CAPS is for the display headline itself.
- No em dashes in UI copy, no "seamless", "robust", "leverage", "dive into", "in today's".
- Sentences carry one idea. Two sentences maximum per summary.

**Claims.** The only numbers permitted anywhere, in any language:
`since 2019 · 9 shipped products · 3 EU providers · 4.2s → 2.9s · 8 days → 5 days · 5,000+ users`.
Everything else on the banned list in `tests/unit/content.test.ts` stays banned. That test
scans content files **and** all five message files.

**Messages.** Five locales: `en`, `de`, `nl`, `fa`, `el`. Every file must end with an
identical key set — `pnpm test:messages` enforces it. New `el`/`de`/`nl`/`fa` strings are
machine-quality and those files already carry `"_status": "machine"`.

**Routes.** Real routes, prerendered. Pages read `params` with `use(params)`, never
`await` — `await` makes the component async, `useTranslations` throws, and the route
silently drops out of the prerender manifest. Check the build output: pages must print
`●`, not `ƒ`.

## Gates — all of these, green, before you report done

```
pnpm test:tokens && pnpm test:messages && pnpm typecheck && pnpm lint
pnpm test:unit
pnpm build
pnpm exec playwright test
```

`pnpm build` must show `●` for every `[locale]` route. Playwright is 64 tests and was
64/64 green at `91cc41f` — a regression is yours. If you add a visual snapshot, look at
the PNG before you accept it.

**Prove any new test can fail.** Break the code, watch it go red for the intended reason,
restore. A test that cannot fail is worse than no test.

## Honesty

If something does not work, say so and leave it failing rather than relaxing the check.
If you cannot finish a stage, report exactly what is done and what is not. Do not report
a gate as green without having run it in that session.
