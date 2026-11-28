# Fly.io image: one process serves the API (/api) and the built website (/).
# Replit does not use this file; its deployment still follows .replit-artifact.
FROM node:24-bookworm-slim AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10 --activate
COPY . .
RUN pnpm install --frozen-lockfile
# The Clerk publishable key is public by design (it ships in the browser bundle).
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_CLERK_PROXY_URL
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY VITE_CLERK_PROXY_URL=$VITE_CLERK_PROXY_URL
RUN test -n "$VITE_CLERK_PUBLISHABLE_KEY" || (echo "Build arg VITE_CLERK_PUBLISHABLE_KEY is required" >&2; exit 1)
RUN NODE_ENV=production BASE_PATH=/ PORT=8080 pnpm --filter @workspace/web run build \
 && NODE_ENV=production pnpm --filter @workspace/api-server run build \
 && pnpm store prune

FROM node:24-bookworm-slim
# ffmpeg/ffprobe process gratitude campaign photos and videos.
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg ca-certificates \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
# stripe-replit-sync is loaded from node_modules at runtime (see build.mjs externals).
COPY --from=build /app /app
ENV NODE_ENV=production PORT=8080 WEB_DIST_DIR=/app/artifacts/web/dist/public
USER node
EXPOSE 8080
CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
