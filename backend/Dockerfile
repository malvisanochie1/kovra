# syntax=docker/dockerfile:1
# Build from the repository root:  docker build -f backend/Dockerfile -t kovra-api .

FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN npm ci --workspace @kovra/backend --include-workspace-root=false
COPY shared shared
COPY backend backend
RUN npm run build -w @kovra/backend && npm prune --omit=dev --workspace @kovra/backend

FROM node:22-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app/backend
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/drizzle ./drizzle
COPY --from=build /app/backend/package.json ./
RUN mkdir -p data && chown -R node:node /app/backend
USER node
EXPOSE 4000
CMD ["node", "dist/server.js"]
