---
description: Deploy the current branch to Cloudflare Pages preview, or main to production.
---

If on main:
1. Confirm: "Deploy main to production? (yes/no)"
2. On yes: `pnpm build && wrangler pages deploy .vercel/output/static --project-name fadaeixlii`
3. Output the production URL and a Lighthouse run command.

Else (feature branch):
1. `pnpm build && wrangler pages deploy .vercel/output/static --project-name fadaeixlii --branch <current-branch>`
2. Output the preview URL.
3. Suggest: paste preview URL into the PR description.
