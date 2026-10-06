#!/bin/sh
# Runs ON the VPS, fed over ssh by .github/workflows/deploy.yml after the image
# (tagged with $SHA) has been `docker load`ed and compose.yaml + the Caddy site
# file have been copied in. POSIX sh: Ubuntu's /bin/sh is dash.
set -eu
: "${SHA:?SHA is required}"

cd ~/portfolio
if [ ! -f .env ]; then
  echo "~/portfolio/.env is missing - see docs/deployment.md" >&2
  exit 1
fi

# Keep the running image as :previous so a failed start can fall back to it.
docker image inspect portfolio:latest >/dev/null 2>&1 && docker tag portfolio:latest portfolio:previous
docker tag "portfolio:$SHA" portfolio:latest

# `run` starts db first and waits for its healthcheck (depends_on condition).
# Migrations are transactional per file, so a failure here leaves the old
# container serving and the schema untouched.
docker compose run --rm portfolio node scripts/migrate.mjs

docker compose up -d

ok=""
for _ in $(seq 1 30); do
  cid=$(docker compose ps -q portfolio)
  if [ -n "$cid" ] && [ "$(docker inspect --format '{{.State.Health.Status}}' "$cid" 2>/dev/null)" = "healthy" ]; then
    ok=yes
    break
  fi
  sleep 5
done
if [ -z "$ok" ]; then
  echo "portfolio did not become healthy within 150s; rolling back" >&2
  docker compose logs --tail 50 portfolio >&2
  if docker image inspect portfolio:previous >/dev/null 2>&1; then
    docker tag portfolio:previous portfolio:latest
    docker compose up -d
  fi
  exit 1
fi
echo "portfolio healthy"

# Outreach's Caddy owns 80/443 and imports ~/caddy-sites/*.caddy. Reload it so
# a changed site file takes effect; a reload with a broken file is rejected and
# the old config keeps serving.
cd ~/outreach
docker compose --profile public exec -T caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile

# Drop the per-commit tag (latest/previous still point at the images we keep)
# and anything left dangling. Volumes are never pruned.
docker rmi "portfolio:$SHA" >/dev/null
docker image prune -f >/dev/null
