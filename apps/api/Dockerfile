# syntax=docker/dockerfile:1

FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@11.22.0 --activate

WORKDIR /app

FROM base AS dependencies

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
RUN pnpm fetch --frozen-lockfile

COPY . .
RUN pnpm install --offline --frozen-lockfile

FROM dependencies AS build

RUN pnpm --filter @cursorhack/api build \
    && pnpm --filter @cursorhack/api deploy --prod --legacy /prod/api

FROM node:22-alpine AS runtime

ENV NODE_ENV=production
ENV PORT=3000

RUN apk add --no-cache curl

WORKDIR /app

COPY --from=build --chown=node:node /prod/api ./

USER node

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=5 \
  CMD curl --fail --silent --show-error http://127.0.0.1:3000/api/health >/dev/null || exit 1

CMD ["node", "dist/main.js"]
