# Claude Design Prompt — fadaeixlii.com Portfolio

> Use this prompt when generating UI designs, mockups, or visual assets in Claude Design for the fadaeixlii.com portfolio project. Copy-paste the entire prompt, then describe what you need designed.

---

## Who This Is For

**Mohammad M Khani** (brand name: **fadaeixlii**) — a senior full-stack developer based in the Netherlands with 6+ years of experience in React, Next.js, TypeScript, Node.js, NestJS, and Solidity. The portfolio must feel like a senior consultant's site — confident, specific, technically credible — not a junior dev's template.

**Goal**: Awwwards-minimal portfolio that converts client leads. Every design decision must serve: "does this make a potential client trust me and reach out?"

---

## Visual Identity

### Aesthetic
- **Editorial minimalism** — think Stripe meets an architecture firm's portfolio
- Warm monochromatic base, NOT cold grays or pure black/white
- Single vivid accent color (deep orange) used sparingly for emphasis
- No decorative patterns, gradients, or illustrations in UI chrome
- Sections separated by single horizontal rules, not background color alternation
- Lowercase section headings ("selected work", "tech stack") as a deliberate brand voice choice
- Dense negative space — let content breathe without filler
- Dark mode is the primary presentation (near-black, not dark gray)

### Brand Elements
- **Logo**: 8px orange circle + "fadaeixlii" in small medium-weight sans-serif
- **Name treatment**: "Mohammad" in foreground color, "M Khani" in orange accent
- **Profile image**: Pixel art isometric dev desk scene (not realistic photography)
- **Interaction philosophy**: Subtle magnetic hover effects, one hero animation, everything else under 200ms

---

## Color System (OKLCH)

All colors use OKLCH color space. The hue family is **50** (warm orange) for accent and **75** (warm neutral) for gray tones.

### Light Mode — Bone + Charcoal

| Token | Value | Use |
|---|---|---|
| Background | `oklch(0.94 0.015 75)` | Page background — warm off-white "bone" |
| Foreground | `oklch(0.22 0.005 75)` | Primary text — warm charcoal |
| Card | `oklch(0.96 0.012 75)` | Card surfaces |
| Muted | `oklch(0.90 0.012 75)` | Tag/badge backgrounds |
| Muted foreground | `oklch(0.60 0.005 75)` | Secondary text, captions |
| Accent | `oklch(0.58 0.16 50)` | Deep orange — CTAs, links, highlights |
| Accent foreground | `oklch(0.98 0.005 75)` | Text on accent backgrounds |
| Border | `oklch(0.85 0.012 75)` | Dividers, card borders |

### Dark Mode — Near-Black + Vivid Orange (primary presentation)

| Token | Value | Use |
|---|---|---|
| Background | `oklch(0.08 0.003 50)` | Near-black with warm undertone |
| Foreground | `oklch(0.92 0.012 75)` | Warm off-white text |
| Card | `oklch(0.12 0.004 50)` | Elevated surface |
| Muted | `oklch(0.15 0.006 50)` | Tag/badge backgrounds |
| Muted foreground | `oklch(0.55 0.005 75)` | Secondary text |
| Accent | `oklch(0.65 0.18 50)` | Vivid deep orange — brighter than light mode |
| Accent foreground | `oklch(0.10 0.003 50)` | Text on accent backgrounds |
| Border | `oklch(0.20 0.006 50)` | Subtle dividers |

### Key Color Rules
- The orange is WARM, hue 50 — not red-orange (30) or yellow-orange (70)
- Gray tones have a warm hue at 75, never cool/blue
- Accent is used for: logo dot, active nav underline, category labels, interactive elements, focus rings, CTA text/arrows
- Emerald green (`bg-emerald-500`) used ONLY for the availability status dot
- Never use pure white (`#fff`) or pure black (`#000`) — always warm-shifted
- Card backgrounds are only slightly lighter than page background
- Border opacity at 50% on header (`border-border/50`), 30% on experience timeline (`border-accent/30`), 40% on hover (`border-accent/40`)

---

## Typography

### Font Stack
- **Display/Headings**: Deltha — a local display serif. Used via `font-serif`. Always `font-normal` weight (never bold serif).
- **Body**: Geist Sans — variable weight sans-serif. Clean, technical, modern.
- **Monospace**: Geist Mono — for code, category labels, small system text.

### Scale

| Role | Font | Size | Weight | Line-height | Tracking | Notes |
|---|---|---|---|---|---|---|
| Hero display | Deltha | `clamp(64px, 15vw, 220px)` | normal | 0.92 | -0.03em | Responsive fluid |
| Page h1 | Deltha | 36→48→60→96px | normal | tight | tight | `text-4xl sm:text-5xl md:text-6xl lg:text-8xl` |
| Section h2 | Deltha | 30px | normal | tight | tight | `text-3xl`, always lowercase |
| Card h3 | Deltha | 20px | normal | tight | tight | `text-xl` |
| Subsection h2 | Geist Sans | 24px | medium | tight | tight | Used on About page (Experience, Skills) |
| Body large | Geist Sans | 18px | normal | relaxed | 0 | Intros, descriptions |
| Body | Geist Sans | 17px | normal | 1.6 | 0 | Base (set on `<html>`) |
| Small | Geist Sans | 14px | normal | 1.5 | 0 | Captions, metadata |
| Labels | Geist Mono | 12px | normal | — | widest | `uppercase`, used for category names |
| Tags | Geist Sans | 12px | normal | — | 0 | Inline tags/badges |

### Typography Rules
- Section headings are **lowercase** by design ("selected work" not "Selected Work")
- Serif headings never get bold — the font's normal weight is the statement
- Category labels always: `font-mono text-xs uppercase tracking-widest text-accent`
- Stat labels always: `text-xs uppercase tracking-widest text-muted-foreground`
- Name splits first/last: "Mohammad" in foreground, "M Khani" in accent
- Font rendering: antialiased on all platforms

---

## Spacing & Layout

### Grid
- **8pt grid only** — all spacing in multiples of 8px (Tailwind: 2=8px, 4=16px, 6=24px, 8=32px)
- No half-steps, no arbitrary pixel values

### Max Widths
- **Wide** (homepage sections, header, footer): `max-w-5xl` = 1024px
- **Editorial** (about, work, blog, case studies): `max-w-3xl` = 768px
- **Narrow** (contact form container): `max-w-2xl` = 672px
- **Form** (contact form itself): `max-w-lg` = 512px

### Section Padding
- Horizontal: 16px mobile → 24px tablet+
- Vertical (homepage sections): 48px mobile → 96px tablet+
- Vertical (inner pages): 40px mobile → 64px tablet+
- Card internal: 16px mobile → 24px tablet+

### Section Structure
All homepage sections follow this pattern:
```
<section class="border-t border-border px-4 py-12 sm:px-6 sm:py-24">
  <div class="mx-auto w-full max-w-5xl">
    ...content...
  </div>
</section>
```
Sections are separated by `border-t` — no background color alternation.

### Border Radii (locked — never use 12 or arbitrary)
- 4px (`rounded-sm`) — tags, small pills, badges
- 8px (`rounded-md`) — buttons, input fields (default)
- 16px (`rounded-lg`) — cards, modals, image containers
- 9999px (`rounded-full`) — dots, avatars, circular elements

---

## Component Patterns

### Cards
- **ProjectCard**: Full-card link, spotlight glow on hover (radial gradient follows cursor at 12% opacity), `border-border → hover:border-accent/40`
- **BlogPostCard**: Full-card link, `border-border → hover:border-accent/30`, no spotlight
- Both: serif title that transitions to accent on hover, muted description, xs tag pills

### Tags/Badges
- **Bordered** (homepage tech stack): `rounded-md border border-border px-3 py-1 text-sm hover:border-accent/40`
- **Filled** (about page, card tech): `rounded-sm bg-muted px-2 py-0.5 text-xs text-muted-foreground`
- **Accent badge**: `rounded-sm bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent`

### Navigation
- **Header**: Sticky, frosted glass (`bg-background/80 backdrop-blur-sm`), `border-b border-border/50`
- **Active state**: `text-foreground` + `h-0.5 w-full bg-accent` underline
- **Mobile**: Sheet drawer from right, 256px wide, auto-closes on navigation
- **Footer**: 3-column on desktop (copyright / social icons / "Built with Next.js"), stacked + centered on mobile

### Forms
- Full-width inputs within form max-width
- Label above each field
- Inline validation errors in `text-destructive`
- Submit button full-width, opacity reduction during pending state
- Success state: accent dot + confirmation message + reset option

### Stats
- 3-column grid, serif numbers with CountUp animation
- Number: `font-serif text-3xl`, suffix inline
- Label: `text-xs uppercase tracking-widest text-muted-foreground`

### Experience Timeline
- Left border: `border-l-2 border-accent/30` — orange at 30% opacity
- Indented content with `pl-6`
- Role (medium weight) + period + company on separate lines

---

## Motion & Animation

### Philosophy
- ONE signature hero animation (the canvas particle sphere + staggered text reveal)
- Everything else is ≤200ms hover polish or scroll-triggered fade-ins
- Only animate `transform` and `opacity` — never width, height, top, left
- Every animation must respect `prefers-reduced-motion` (zero durations)

### Signature Easing
`cubic-bezier(0.25, 0.46, 0.45, 0.94)` — used universally across all custom animations

### Hero
- **Particle sphere**: 200-point Fibonacci sphere on `<canvas>`, auto-rotating, mouse-interactive. Orange dots (`RGB 220, 130, 40`) with connection lines. Positioned right-of-center on desktop, centered on mobile.
- **Text reveal**: Each line staggers in at 120ms intervals, `opacity: 0, y: 24px → opacity: 1, y: 0`, 600ms duration
- **Tagline**: Word-by-word blur reveal (blur 12px → 0px + opacity + slight y-translate), 500ms per word with 40ms stagger

### Scroll Animations
- **FadeIn**: `opacity: 0, y: 24px → opacity: 1, y: 0`, 600ms, triggers at 15% viewport intersection, fires once
- **CountUp**: 1200ms ease-out-cubic number animation, fires at 50% viewport intersection

### Hover Interactions
- **Magnet**: Elements shift toward cursor position (CSS transform only), 150ms ease-out on move, 400ms ease on release. Strength 0.4 on social icons, 0.15 on CTA button.
- **SpotlightCard glow**: Radial gradient at `oklch(0.68 0.09 65 / 0.12)` follows cursor, 300ms opacity transition
- **ClickSpark**: 8 particles explode from click point, 400ms, orange dots

---

## Responsive Breakpoints

| Breakpoint | Width | Key Changes |
|---|---|---|
| Default (mobile) | 0-639px | Single column, compressed padding, centered images, hamburger nav |
| `sm` | 640px+ | 2-column grids, increased padding, about layout side-by-side possibility |
| `md` | 768px+ | Desktop nav appears, about section goes horizontal, images left-aligned |
| `lg` | 1024px+ | Full hero text size, 3-column tech grid, sphere shifts right |

### Mobile-Specific Design Notes
- Hero height: 70vh (not 85vh like desktop)
- Profile images scale: 192px → 256px → 320px
- Cards reduce internal padding from 24px to 16px
- Section vertical padding halves from 96px to 48px
- The particle sphere centers on mobile; shifts right on desktop
- Footer stacks vertically and centers

---

## Content & Voice

### Copy Style
- First-person singular, confident, specific
- No buzzwords: never "leverage", "synergy", "cutting-edge", "passionate"
- Quantify claims: "6+ years", "10+ projects", not "extensive experience"
- Lowercase section headings as personality ("selected work", not "Selected Work")
- Short sentences. One idea per sentence.
- The tagline sets the tone: "I build web applications that handle real users and real money."

### Page Content Map

| Page | Key Content |
|---|---|
| Home `/` | Availability badge → Name (serif, orange split) → Subtitle → Social links → About preview with stats → Featured projects (3) → Tech stack → Contact CTA |
| About `/about` | Profile image + bio → Extended paragraphs → Experience timeline → Skills grid |
| Work `/work` | Page heading → All project cards (staggered) |
| Blog `/blog` | Page heading → All blog post cards (staggered) |
| Contact `/contact` | Centered heading → Description → Form (name, email, message) |
| Case Study `/work/[slug]` | Back link → Title (serif) → Tagline → Role/Year/Tech badges → MDX content → Prev/Next nav |
| Blog Post `/blog/[slug]` | Date + reading time → Title (serif) → Excerpt → Tags → MDX content → Prev/Next nav |

---

## What NOT to Do

- No gradients on backgrounds or buttons
- No rounded corners larger than 16px
- No cold/blue grays — everything stays warm
- No bold serif text — Deltha is always normal weight
- No Title Case in section headings — always lowercase
- No decorative illustrations or stock photos in UI
- No colored section backgrounds — only `border-t` separation
- No more than 4 tech tags visible per card
- No animation longer than 600ms (except hero sphere which runs continuously)
- No layout shifts — all images have explicit dimensions
- No pure white or pure black — always warm-shifted OKLCH values

---

## Example Design Requests You Can Make

After pasting this prompt, try requests like:

- "Design a 404 page that fits this system"
- "Create a testimonials section for the homepage"
- "Design a project gallery/lightbox for case study pages"
- "Design a resume/CV download page"
- "Create an admin dashboard layout for the CMS"
- "Design the mobile navigation drawer with all states"
- "Create a newsletter signup component"
- "Design a blog post reading progress bar"
- "Create dark and light mode mockups of the full homepage"
