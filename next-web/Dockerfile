ARG NODE_VERSION=22-alpine

FROM node:${NODE_VERSION} AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

FROM base AS prod-dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod

FROM base AS development
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV CI=true
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["pnpm", "dev"]

FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM node:${NODE_VERSION} AS production
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV CI=true
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder --chown=node:node /app/public ./public
RUN mkdir .next && chown node:node .next
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
CMD ["node", "server.js"]