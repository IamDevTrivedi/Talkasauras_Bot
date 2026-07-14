# Talkasauras Bot — Telegram AI Chatbot Powered by Ollama

## Project Overview

A Telegram chatbot powered by Ollama LLM with real-time AI conversations, scheduled reminders, job queuing (BullMQ), and PostgreSQL persistence. Live at [@TalkasaurasBot](https://t.me/TalkasaurasBot).
---

## Tech Stack

| Layer             | Technology                                                                  |
| ----------------- | --------------------------------------------------------------------------- |
| **Runtime**       | Node.js 24+, TypeScript 5.9, ESM (`"type": "module"`)                       |
| **Framework**     | Express 5 (API), Telegraf 4 (Telegram bot client)                           |
| **LLM**           | Ollama (via `ollama` npm SDK), mock endpoint for offline dev                |
| **Database**      | PostgreSQL 18 + Prisma ORM 7 (`@prisma/adapter-pg`)                         |
| **Cache / Queue** | Redis 8 + BullMQ (5 job queues)                                             |
| **Auth**          | Admin bot restricted to `ADMINS` env list; HMAC + AES-256-GCM for user data |
| **Validation**    | Zod 4                                                                       |
| **Logging**       | Pino + pino-pretty (console + file transports)                              |
| **Infra**         | Docker / Compose, GitHub Actions CI/CD (lint → build → GHCR → VPS deploy)   |

---

## Project Structure

```
src/                        Main source code
├── index.ts                App entry point (init DB, Redis, Express, bots)
├── shutdown.ts             Graceful shutdown (SIGINT/SIGTERM)
├── config/
│   ├── checkEnv.ts         Zod env validation
│   ├── env.ts              Typed env export (dev/prod)
│   └── ollama.ts           Ollama client init
├── constants/
│   └── app.ts              Prompts, rate limits, cron schedule, writing styles
├── db/
│   ├── prisma.ts           Prisma client (PrismaPg adapter)
│   └── redis.ts            Redis client
├── utils/
│   ├── crypto.ts           HMAC + AES-256-GCM encrypt/decrypt
│   ├── genPrompt.ts        Dynamic system prompt builder
│   └── logger.ts           Pino logger
└── modules/
    ├── root/               Express GET /
    ├── health/             Express GET /api/v1/health
    ├── mock/               Express mock Ollama API (/api/v1/mock/*)
    ├── bot/                User-facing Telegram bot
    │   ├── bot.ts          prepare() + launch()
    │   ├── botInstance.ts  Telegraf instance
    │   ├── handlers/       10 handlers (start, info, feedback, clear,
    │   │                   temporary, instructions, remindMe, writingStyle,
    │   │                   photo, text)
    │   ├── middleware/     4 middleware (errorHandler, identifyUser,
    │   │                   createUser, rateLimiter)
    │   └── services/       4 services (chat, message, user, reminder)
    ├── admin/              Admin/internal Telegram bot
    │   ├── bot.ts          prepare() + launch()
    │   ├── botInstance.ts  Telegraf instance
    │   ├── handlers/       8 handlers (start, help, whoami, cancel,
    │   │                   broadcast, feedbacks, analytics, status)
    │   ├── middleware/     2 middleware (auth, errorHandler)
    │   └── services/       4 services (broadcast, feedback, analytics, status)
    └── queue/              BullMQ job queues
        ├── queues.ts       5 typed queues
        ├── workers.ts      5 workers
        ├── redisConfig.ts  Redis connection config
        └── processors/
            ├── updateLastActivity.ts
            ├── sendReminder.ts
            ├── sendBroadcast.ts
            ├── dailyMsgCreator.ts
            └── dailyMsgSender.ts

prisma/
├── schema.prisma           4 models, 3 enums
├── migrations/             13 timestamped migrations
└── seed.ts                 Optional seed

scripts/                    clean-all, install-all, reset-all, diagrams
docs/                       SETUP.md, architecture/ER/CI-CD diagrams
docker-compose.yml          Production stack (bot + redis + redis-commander)
docker-compose.dev.yml      Dev stack (redis + postgres + cloudbeaver + ollama)
Dockerfile                  Multi-stage build (Node 24 Alpine)
```

---

## Key Architecture Patterns

### Bot Registration

Handlers are registered as `registerXxx()` functions. Each handler file exports a single register function that calls `bot.command(...)` or `bot.on(...)`.

### API Response (Express)

Express routes use `res.json()` directly with status codes.

### Middleware Order (User Bot)

```
errorHandler → identifyUser → createUser → [commands] → rateLimiter → text/photo
```

### Security

- User `telegramIdHash` stored as HMAC-SHA256
- Sensitive fields (`telegramIdEnc`, message content, custom instructions, reminders) encrypted with AES-256-GCM
- Admin bot guarded by `authMiddleware` checking `ADMINS` env list
- Rate limiting: 10 messages / 60s per user (Redis-based)

### Database

- Prisma 7 with `@prisma/adapter-pg` (driver adapter pattern, not direct Prisma binary)
- All timestamps stored as `BigInt` (Unix milliseconds)
- 4 models: `User` (with `WritingStyle` enum), `Message` (with `Role` enum), `Feedback`, `Reminder`

### Background Jobs

5 BullMQ queues:

| Queue                  | Purpose                             | Retries |
| ---------------------- | ----------------------------------- | ------- |
| `lastActivityQueue`    | Update user `lastActive` timestamp  | 1       |
| `reminderQueue`        | Deliver scheduled reminder messages | 3       |
| `broadcastQueue`       | Send broadcast to batch of users    | 2       |
| `dailyMsgCreatorQueue` | Generate daily msgs via Ollama      | 1       |
| `dailyMsgSenderQueue`  | Send generated daily msgs to users  | 3       |

### Writing Styles

4 styles defined in `WRITING_STYLE_PROMPTS`: `DEFAULT` (empty), `FORMAL`, `DESCRIPTIVE`, `CONCISE`. Applied dynamically via `genPrompt.ts`.

### Temporary Messages

Messages with `isTemporary = true` auto-delete after 5 minutes (`TEMPORARY_MSG_TIMEOUT`).

---

## Conventions

| Rule               | Detail                                                           |
| ------------------ | ---------------------------------------------------------------- |
| **TypeScript**     | Strict mode (`strict: true`), ES2022 target, Node16 module       |
| **Imports**        | ESM with `.js` extensions (`import { x } from "./foo.js"`)       |
| **Path alias**     | `@/` maps to `./src/*` (configured in `tsconfig.json`)           |
| **Exports**        | Named exports preferred; handlers export `registerXxx` functions |
| **Formatting**     | Prettier (tabWidth 4, semi, singleQuote false, printWidth 100)   |
| **Linting**        | ESLint + typescript-eslint (zero warnings required)              |
| **Error handling** | Bot handlers catch errors and log via Pino                       |

---

## Commands

### Root

| Command             | Description                      |
| ------------------- | -------------------------------- |
| `pnpm dev`          | Dev watch mode via `tsx`         |
| `pnpm build`        | TypeScript compile + `tsc-alias` |
| `pnpm start`        | Production start from `dist/`    |
| `pnpm lint`         | ESLint auto-fix                  |
| `pnpm lint:check`   | ESLint check (zero warnings)     |
| `pnpm format`       | Prettier auto-format             |
| `pnpm format:check` | Prettier check                   |
| `pnpm check`        | `lint:check` + `format:check`    |

### Database

| Command                  | Description                       |
| ------------------------ | --------------------------------- |
| `pnpm db:generate`       | Generate Prisma client            |
| `pnpm db:push`           | Push schema to DB (no migration)  |
| `pnpm db:migrate`        | Create + apply migration (dev)    |
| `pnpm db:migrate:deploy` | Apply pending migrations (prod)   |
| `pnpm db:studio`         | Launch Prisma Studio on port 5004 |
| `pnpm db:seed`           | Run seed script                   |
| `pnpm db:reset`          | Reset DB (drops all data)         |

### Docker

| Command                                                              | Description              |
| -------------------------------------------------------------------- | ------------------------ |
| `docker compose -f docker-compose.dev.yml up`                        | Start dev infrastructure |
| `docker compose -f docker-compose.dev.yml up --profile local-ollama` | Dev + local Ollama       |
| `docker compose up`                                                  | Start production stack   |

---

## Important Notes

- Pre-commit hook runs `pnpm check` (Husky + lint-staged)
- Build output: `dist/`
- Dev env file: `.env.development` (gitignored; use `.env.development.example` as template)
- Prod env file: `.env.production` (gitignored; use `.env.production.example` as template)
- Mock Ollama API available at `/api/v1/mock/*` for offline development
- Daily messages sent at 6 AM IST (cron `0 6 * * *`, timezone `Asia/Kolkata`)
- Admin bot runs on same process as user bot, guarded by auth middleware

## Critical Rules

- NEVER make git commits, git pushes, or GitHub PR changes without explicit user permission
- Always ask before committing, pushing, or creating/modifying pull requests
- NEVER use `any` type
- Run `pnpm check` before considering work complete
