# professional-portfolio

The portfolio of Mohammad M. Khani at [mohammadmkh.dev](https://mohammadmkh.dev).

Next.js 16 (App Router) + TypeScript + Tailwind v4 + next-intl, deployed to a VPS
behind Cloudflare.

## Commands

pnpm only.

```bash
pnpm dev          # dev server
pnpm build        # production build
pnpm start        # run the build
pnpm lint         # eslint
pnpm typecheck    # tsc --noEmit
pnpm test         # playwright e2e
pnpm test:unit    # vitest
pnpm test:tokens  # design-token guard (no raw colour, no physical-direction utilities)
```

## Deployment

Docker image behind Caddy (TLS) behind Cloudflare (DNS/proxy), auto-deployed on push to
`main`. See [`docs/deployment.md`](docs/deployment.md) for the env-var table, rollback,
and runbook; `Dockerfile`, `docker-compose.yml` and `deploy/Caddyfile` are the artifacts.

## Docs

Spec and phase plans live in [`docs/superpowers/`](docs/superpowers/).

v1 is archived at the `v1-archive` tag.
