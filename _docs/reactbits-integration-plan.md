# ReactBits Integration Plan

> Mapping of ReactBits components to fadaeixlii.com portfolio sections.
> All components should use the **TS-TW** (TypeScript + Tailwind) variant.
> MCP server installed: `reactbits-dev-mcp-server` in `.mcp.json`.

## Compatibility Notes

- ReactBits uses `framer-motion` internally — Motion v12 (`motion/react`) is the direct successor, should be compatible. Verify imports when integrating.
- Some components use GSAP or Three.js as optional peer deps — evaluate bundle cost before adding.
- Our motion budget: ONE signature hero animation + ≤200ms hover polish elsewhere.
- All components must respect `prefers-reduced-motion`.
- Prefer variants that use Tailwind CSS over raw CSS (TS-TW).

---

## Priority 1 — High Impact, Clear Fit

### 1. `SplitText` → Hero Name Animation
**Where:** Homepage hero — "Mohammad Fadaei" display text
**Why:** Replace custom word stagger with a polished character-split animation. GSAP-powered with ScrollTrigger support.
**Replaces:** Current `HeroAnimation` word stagger
**Note:** Evaluate GSAP dep size. If too heavy, use `BlurText` (Framer Motion based) instead.

### 2. `BlurText` → Hero Tagline
**Where:** Homepage hero — subtitle text
**Why:** Words fade from blurred to focused. More visually interesting than a simple opacity fade.
**Replaces:** Current `HeroItem` fade-up on tagline

### 3. `CountUp` → Stats Section
**Where:** Homepage "about" section — "6+", "10+", "5" stats
**Why:** Numbers animate counting up when scrolled into view. Adds life to a static section.
**Current:** Static numbers

### 4. `SpotlightCard` → Project Cards
**Where:** Homepage "selected work" + /work page
**Why:** Cards with a spotlight/glow that follows the cursor. Much more engaging than plain bordered cards.
**Replaces:** Current `ProjectCard` hover effect
**Alternative:** `TiltCard` — 3D perspective tilt on hover

### 5. `Magnet` → CTA Buttons & Nav Links
**Where:** "Get in touch" button, header nav links
**Why:** Magnetic pull effect — element slightly moves toward cursor on hover. Subtle but premium feel.
**Budget:** ≤200ms, transform-only — fits our motion rules

### 6. `ClickSpark` → CTA Button
**Where:** "Get in touch" button click
**Why:** Sparkle/particle burst on click. Delightful micro-interaction.
**Budget:** Single event, ≤200ms — fits budget

### 7. `Dock` → Navigation Enhancement
**Where:** Header desktop nav or a floating dock (macOS-style)
**Why:** Icons/items scale and magnify on hover proximity. Premium feel.
**Evaluate:** Whether it fits our minimal header or works better as a separate floating element

---

## Priority 2 — Nice to Have, Phase 3+

### 8. `ScrollProgress` → Page Scroll Indicator
**Where:** Top of page (thin bar) or side indicator
**Why:** Shows reading/scroll progress. Useful on long single-page homepage.

### 9. `GradientText` → Accent Text
**Where:** Section headings or highlighted phrases
**Why:** Animated gradient sweep across text. Could accent "let's work together" heading.

### 10. `StarBorder` → Contact Form Card
**Where:** Contact page form wrapper
**Why:** Animated star/sparkle border effect. Makes the form feel special.

### 11. `AnimatedList` → Blog Posts / Project List
**Where:** /blog page (when posts exist), /work project list
**Why:** Items animate in sequentially with smooth stagger.

### 12. `GlareHover` → Card Hover Effect
**Where:** Project cards, skill category cards
**Why:** Glossy glare that follows cursor across the card surface.

### 13. `FadeContent` → Section Scroll Reveals
**Where:** All homepage sections (about, work, skills, contact)
**Why:** Sections fade/slide into view as user scrolls. Adds rhythm to the page.

### 14. `Aurora` or `Silk` → Background Accent
**Where:** Contact section or about section background
**Why:** Ethereal animated background. Aurora = colorful waves, Silk = flowing fabric.
**Caution:** Evaluate performance cost. May conflict with HeroScene canvas.

---

## Priority 3 — Playground / Experimental

### 15. `Ballpit` → /playground Demo
**Where:** /playground route
**Why:** Interactive physics ball pit. Fun showcase of technical capability.

### 16. `MetaBalls` → /playground Demo
**Where:** /playground route
**Why:** Organic blob merging animation. Visually impressive.

### 17. `CircularGallery` → Project Showcase Alternative
**Where:** /playground or alternative /work view
**Why:** Circular rotating gallery of project screenshots.

### 18. `FlyingPosters` → 3D Project Gallery
**Where:** /playground or portfolio showcase
**Why:** 3D floating poster layout. Could display project screenshots.

### 19. `LiquidChrome` → /playground
**Where:** /playground background experiment
**Why:** Chrome/liquid metal effect. Pure eye candy.

### 20. `Orb` → Hero Alternative
**Where:** Homepage hero (alternative to current HeroScene)
**Why:** 3D animated orb. Could replace the custom particle sphere.
**Evaluate:** Compare visual quality vs. our custom canvas solution.

---

## Implementation Strategy

### Phase A — Immediate (Hero + Homepage Polish)
1. Integrate `SplitText` or `BlurText` for hero text animation
2. Add `CountUp` to stats section
3. Replace `ProjectCard` with `SpotlightCard`
4. Add `Magnet` to CTA button
5. Add `ClickSpark` to CTA button

### Phase B — Navigation + Scroll (After Phase A)
6. Evaluate `Dock` for navigation
7. Add `FadeContent` scroll reveals to homepage sections
8. Add `ScrollProgress` indicator

### Phase C — Page-Level Enhancements
9. `StarBorder` on contact form
10. `AnimatedList` on blog/work pages
11. `GlareHover` on cards
12. Background effects where appropriate

### Phase D — Playground
13-20. Build /playground with Ballpit, MetaBalls, FlyingPosters, etc.

---

## Installation

Use the ReactBits MCP server tools:
```
list_categories        — See all categories
search_components      — Find by name/description
get_component          — Get source code (TS-TW variant)
get_component_demo     — Get usage examples
```

Or install via shadcn CLI:
```bash
npx shadcn@latest add @react-bits/ComponentName-TS-TW
```

## Bundle Budget

Each component must be evaluated for:
- Bundle size impact (<30KB gzipped per route)
- Peer dependencies (GSAP ~45KB, Three.js ~150KB)
- Runtime performance (requestAnimationFrame budget)
- CWV impact (LCP, CLS, INP)

Prefer components that use CSS/Tailwind animations or Framer Motion (already in bundle via motion/react) over those requiring GSAP or Three.js.
