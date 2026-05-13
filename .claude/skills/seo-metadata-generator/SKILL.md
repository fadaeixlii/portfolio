---
name: seo-metadata-generator
description: Use this skill when adding generateMetadata to a page. Provides the metadata template, JSON-LD patterns, and OG image conventions.
allowed-tools: Read, Write, Edit
---

# SEO Metadata Generator

## generateMetadata template
```tsx
import type { Metadata } from 'next'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getData(slug)

  return {
    title: data.title,              // ≤60 chars
    description: data.description,   // ≤155 chars
    alternates: { canonical: `https://fadaeixlii.com/${slug}` },
    openGraph: {
      title: data.title,
      description: data.description,
      type: 'article',
      url: `https://fadaeixlii.com/${slug}`,
    },
    twitter: { card: 'summary_large_image' },
  }
}
```

## JSON-LD patterns
- Home/About: `Person` schema
- Blog posts: `BlogPosting` schema
- Case studies: `CreativeWork` schema
- Nested pages: `BreadcrumbList` schema

## OG image
- Each public page gets `opengraph-image.tsx` using `next/og` ImageResponse
- Size: 1200x630, bone background, charcoal text, ochre dot accent
- Fonts: Geist Medium + Fraunces Regular loaded as ArrayBuffer
