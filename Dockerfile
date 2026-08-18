# ─────────────────────────────────────────────
# Stage 1: Builder
# ─────────────────────────────────────────────
FROM oven/bun:1-alpine AS builder
WORKDIR /app

# Install all dependencies (frozen lockfile for reproducibility)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy only what the build needs
COPY tsconfig.json ./
COPY prisma/ ./prisma
COPY prisma.config.ts ./
COPY src/ ./src

# Generate Prisma client and build
RUN bun run db:generate
RUN bun run build

# ─────────────────────────────────────────────
# Stage 2: Production
# ─────────────────────────────────────────────
FROM oven/bun:1-alpine AS production
WORKDIR /app

# Install only production dependencies
COPY package.json bun.lock ./
RUN bun install --production

# Copy build output from builder
COPY --from=builder /app/dist ./dist

# Copy Prisma schema and config for migrate:deploy + generate
COPY prisma/ ./prisma
COPY prisma.config.ts ./

# Regenerate Prisma client in the production image
RUN bun run db:generate

EXPOSE 5000

CMD [ "sh", "-c", "bun run db:migrate:deploy && bun run start" ]
