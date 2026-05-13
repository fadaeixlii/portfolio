---
name: framer-motion-patterns
description: Use this skill when creating or modifying animations. Provides Motion v12 patterns, reduced-motion support, and performance-safe animation recipes.
allowed-tools: Read, Write, Edit
---

# Motion v12 Animation Patterns

IMPORTANT: Always import from `motion/react`, NEVER `framer-motion`.

## Reduced motion hook (required for every animation)

```tsx
import { useReducedMotion } from 'motion/react'

const shouldReduce = useReducedMotion()
const duration = shouldReduce ? 0 : 0.6
```

## FadeUp (most common entrance)

```tsx
<motion.div
  initial={{ opacity: 0, y: 24 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration, ease: [0.25, 0.46, 0.45, 0.94] }}
>
```

## Stagger container

```tsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    visible: { transition: { staggerChildren: 0.05 } },
  }}
>
```

## Rules
- Only transform/opacity — never width/height/top/left
- Hover effects: ≤200ms duration
- Exit animations: ≤150ms
- One signature hero animation per page, everything else is subtle
