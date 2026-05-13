---
name: og-image-builder
description: Use this skill to create per-page OG images via Next.js opengraph-image.tsx using ImageResponse.
allowed-tools: Read, Write, Edit
---

# OG Image Builder

Every public page gets a dynamic OG image at `app/[route]/opengraph-image.tsx`
using `next/og`'s `ImageResponse`. Size: 1200x630. Bundle: ≤500KB.

## Template

```tsx
import { ImageResponse } from 'next/og'

export const alt = 'fadaeixlii.com — [page name]'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const geist = await fetch(
    new URL('./fonts/Geist-Medium.ttf', import.meta.url)
  ).then(r => r.arrayBuffer())

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: 80,
        background: '#F2EDE4', fontFamily: 'Geist'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 12, height: 12, borderRadius: 12, background: '#B8895A' }} />
          <span style={{ fontSize: 24, color: '#2B2B28', opacity: 0.7 }}>fadaeixlii.com</span>
        </div>
        <h1 style={{ fontSize: 72, color: '#2B2B28', lineHeight: 1.0, margin: 0, letterSpacing: -2 }}>
          Page Title
        </h1>
      </div>
    ),
    { ...size, fonts: [{ name: 'Geist', data: geist, weight: 500, style: 'normal' }] },
  )
}
```

## Rules
- Flexbox only — no CSS grid, no float, no position absolute (ImageResponse limit)
- Fonts as ArrayBuffer from /public/fonts/
- Test by visiting `/[route]/opengraph-image` in dev
- Output is .png
