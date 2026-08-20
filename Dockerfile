FROM oven/bun:1.3.14-alpine AS production
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --production --ignore-scripts

COPY tsconfig.json ./
COPY prisma/ ./prisma
COPY prisma.config.ts ./
COPY src/ ./src

RUN chown -R bun:bun /app

USER bun

RUN bun run db:generate

EXPOSE 5000

CMD [ "sh", "-c", "bun run db:migrate:deploy && bun run start" ]