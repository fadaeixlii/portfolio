# Case Study Template

> Skeleton for case study pages on fadaeixlii.com.

## MDX Frontmatter

```yaml
---
title: "Project Title"
slug: "project-slug"
tagline: "One-line description (≤120 chars)"
role: "Lead Developer" | "Full-Stack Developer" | etc.
year: 2024
status: "draft" | "published"
tech: ["Next.js", "TypeScript", "Supabase"]  # max 8
featured: true
sort_order: 1
hero_image: "/images/projects/slug/hero.avif"
---
```

## Narrative Structure

### 1. Hero
- Project title (display type, Fraunces)
- Tagline (one sentence)
- Role + Year + Tech badges (max 3 visible)
- Full-bleed hero image

### 2. Problem (2-3 paragraphs)
- Who felt the pain? Be specific about the user or business.
- What was broken, slow, missing, or expensive?
- Quantify the problem if possible ("4.2s load time", "30% bounce rate").

### 3. Approach (2-3 paragraphs)
- What approaches did I consider?
- Why did I choose this one? (constraints, trade-offs, timeline)
- What was the key technical insight?

### 4. Solution (3-5 paragraphs + gallery)
- What did I build? Walk through the architecture.
- Highlight 2-3 interesting technical decisions with code snippets.
- Gallery: ≥3 images showing the product (screenshots, diagrams, before/after).

### 5. Impact (1-2 paragraphs)
- ≥1 quantified metric (REQUIRED): load time, conversion rate, user growth, etc.
- What changed for the users/business after launch?

### 6. Tech Stack
- Flat list, no skill walls. Max 8 items.
- Format: `Next.js · TypeScript · Supabase · Tailwind CSS`

### 7. Reflections (1-2 paragraphs)
- What would I do differently?
- What did I learn that I'll carry forward?

## Voice Rules
- First-person singular, past tense — narrating what *I* did (Problem, Approach, Impact, Reflections)
- Exception: the **Solution** section may use present tense to describe how the *shipped, still-live product* works ("the dashboard shows…", "the API serves…"). This is intentional, not a violation.
- First-person **singular** throughout — no "we"/"our" even on team projects (this is one author's account)
- No buzzwords (see voice-guide.md)
- 600–1,200 words total
- One idea per sentence
