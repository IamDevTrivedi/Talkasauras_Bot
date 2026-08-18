FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --ignore-scripts

COPY . .
RUN bunx prisma generate
RUN bun run build

# ─── Production Stage ───────────────────────────────────────

FROM oven/bun:1-alpine AS production

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --production --ignore-scripts

COPY --from=builder /app/dist ./dist
COPY src ./src
COPY prisma/ ./prisma
COPY prisma.config.ts ./
RUN bunx prisma generate

EXPOSE 5000

CMD [ "sh", "-c", "bun run db:migrate:deploy && bun run start" ]