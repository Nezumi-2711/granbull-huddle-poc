# Builds web (Vite) + api (Fastify) into one image; the API serves the SPA.
# Build context: repository root.
FROM node:22-slim AS build
WORKDIR /repo
RUN corepack enable
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared-types/package.json packages/shared-types/
RUN COREPACK_ENABLE_DOWNLOAD_PROMPT=0 pnpm install --frozen-lockfile
COPY . .
RUN pnpm build \
 && pnpm --filter @huddle/api deploy --prod --legacy /out/api \
 && cp -r apps/api/dist /out/api/dist \
 && mkdir -p /out/web && cp -r apps/web/dist /out/web/dist

FROM node:22-slim
ENV NODE_ENV=production PORT=3000
WORKDIR /app
COPY --from=build /out/api ./apps/api
COPY --from=build /out/web ./apps/web
WORKDIR /app/apps/api
EXPOSE 3000
USER node
CMD ["node", "dist/server.js"]
