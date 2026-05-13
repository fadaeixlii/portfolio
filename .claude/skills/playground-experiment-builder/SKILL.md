---
name: playground-experiment-builder
description: Use this skill when building playground experiments — interactive demos, component showcases, and creative coding pieces for the /playground route.
allowed-tools: Read, Write, Edit, Bash
---

# Playground Experiment Builder

Each experiment is a self-contained component showcased on /playground.

## Structure per experiment
```
src/components/playground/
  <experiment-name>/
    index.tsx          # main component
    README.md          # what it demonstrates, how it works
```

## Rules
- Each experiment must be self-contained (no cross-experiment dependencies)
- Must work without JavaScript (graceful degradation or SSR fallback)
- Must respect useReducedMotion()
- Must be keyboard-accessible
- Should demonstrate one concept clearly, not kitchen-sink
- Include a brief description visible on the page
- Performance: no experiment should add >50KB to the route bundle

## Registry pattern
Experiments are registered in `src/lib/playground-registry.ts`:
```ts
export const experiments = [
  { slug: 'experiment-name', title: 'Title', description: '...', component: lazy(() => import(...)) },
]
```
