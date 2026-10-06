FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Public env vars are inlined at build time; secrets are read at runtime.
ARG NEXT_PUBLIC_SITE_URL
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -g 1001 nodejs && adduser -u 1001 -G nodejs -S nextjs
# `output: standalone` traces exactly what the server needs.
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public
# The migration runner, for `docker compose run --rm portfolio node
# scripts/migrate.mjs` on every deploy. Next may bundle the `postgres` driver
# into server chunks rather than leave it in the traced node_modules, so the
# package (zero dependencies) is copied in explicitly from the pnpm store.
COPY --from=build --chown=nextjs:nodejs /app/scripts/migrate.mjs ./scripts/migrate.mjs
COPY --from=build --chown=nextjs:nodejs /app/db/migrations ./db/migrations
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/.pnpm/postgres@*/node_modules/postgres ./node_modules/postgres
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
