# SEO Strategy

> Metadata, OG images, JSON-LD, and sitemap reference for fadaeixlii.com.

## Per-page requirements
- Every public page exports `generateMetadata`
- Every public page has `opengraph-image.tsx`
- Title: ≤60 chars, description: ≤155 chars
- Canonical URL set
- Twitter card: summary_large_image

## JSON-LD schemas
- Home/About: Person
- Blog posts: BlogPosting
- Case studies: CreativeWork
- Nested pages: BreadcrumbList

## Sitemap
- Auto-generated via Next.js `sitemap.ts`
- Include all published pages
- Exclude admin routes, auth routes

## robots.txt
- Allow all public routes
- Disallow /admin, /auth, /api

<!-- TODO: Document keyword strategy per page -->
<!-- TODO: Document internal linking plan -->
