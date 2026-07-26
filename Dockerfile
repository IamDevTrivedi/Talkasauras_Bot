FROM node:24-alpine AS builder

RUN corepack enable pnpm
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build
RUN pnpm db:generate

# ─── Production Stage ───────────────────────────────────────

FROM node:24-alpine

RUN corepack enable pnpm
ENV NODE_ENV=production
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist
COPY prisma/ ./prisma
COPY prisma.config.ts ./
RUN pnpm db:generate

EXPOSE 5000

CMD [ "sh", "-c", "pnpm run db:migrate:deploy && pnpm run start" ]
