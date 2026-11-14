# private/shop

Paid downloads (`<product>.zip`, see `src/content/shop.ts`). The zips are never committed (the repo is public):
locally drop them here for testing; in production they live in `~/portfolio/shop/` on the VPS, which
`docker-compose.prod.yml` mounts read-only over this folder.
