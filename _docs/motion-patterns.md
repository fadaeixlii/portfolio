# Motion Patterns Library

> Animation recipes for fadaeixlii.com using Motion v12 (`motion/react`).

## Rules (non-negotiable)
- Import from `motion/react`, NEVER `framer-motion`
- Every component: `useReducedMotion()` guard, zero durations when true
- Only animate `transform` and `opacity`
- Motion budget: ONE signature hero hook, everything else ≤200ms hover polish
- Exit animations: ≤150ms
- Stagger: max 50ms between items, max 300ms total

<!-- TODO: Add FadeUp, StaggerContainer, MagneticButton, TextReveal patterns -->
<!-- TODO: Add the signature hero animation once designed -->
