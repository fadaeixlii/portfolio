---
name: case-study-writing
description: Use this skill when writing or editing case study content. Provides the narrative structure, voice rules, and frontmatter schema.
allowed-tools: Read, Write, Edit
---

# Case Study Writing

## Structure (in order)
1. **Hero** — project title, one-line tagline, role, year, hero image
2. **Problem** — what was broken or missing, who felt the pain (2-3 paragraphs)
3. **Approach** — how I chose to solve it, why this approach over alternatives (2-3 paragraphs)
4. **Solution** — what I built, with gallery images and code highlights (3-5 paragraphs)
5. **Impact** — quantified results (≥1 metric required), what changed for users
6. **Tech stack** — flat list, no skill walls, max 8 items
7. **Reflections** — what I'd do differently, what I learned (1-2 paragraphs)

## Voice rules
- First-person singular, past tense
- No buzzwords (see content-writer agent for ban list)
- Show, don't tell — quantify everything possible
- 600–1,200 words total
- One idea per sentence

## Frontmatter
```yaml
title: string
slug: string (kebab-case, keyword-leaning)
tagline: string (≤120 chars)
role: string
year: number
status: draft | published
tech: string[] (max 8)
featured: boolean
sort_order: number
```
