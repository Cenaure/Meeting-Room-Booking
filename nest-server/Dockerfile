FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

FROM base AS dependencies
RUN pnpm install --frozen-lockfile

# Development

FROM base AS development
ENV CI=true
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm exec prisma generate
CMD ["pnpm", "run", "start:dev"]

# Production

FROM dependencies AS build
ENV CI=true
COPY . .
RUN pnpm exec prisma generate
RUN pnpm run build

FROM node:22-alpine AS production
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile
COPY --from=build /app/dist ./dist
CMD ["node", "dist/main.js"]