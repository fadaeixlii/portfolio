# professional-portfolio

The portfolio of Mohammad M. Khani at [fadaeixlii.dev](https://fadaeixlii.dev).

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
and runbook; `Dockerfile`, `docker-compose.prod.yml`, `deploy/fadaeixlii.dev.caddy` and
`deploy/remote-deploy.sh` are the artifacts. `docker-compose.yml` is the local-dev database.

## Docs

Spec and phase plans live in [`docs/superpowers/`](docs/superpowers/).

v1 is archived at the `v1-archive` tag.
