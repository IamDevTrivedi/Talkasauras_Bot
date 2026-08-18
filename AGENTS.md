# Talkasauras Bot — Telegram AI Chatbot Powered by Ollama

## Project Overview

A Telegram chatbot powered by Ollama LLM with real-time AI conversations, scheduled reminders, job queuing (BullMQ), and PostgreSQL persistence. Live at [@TalkasaurasBot](https://t.me/TalkasaurasBot).

## Tech Stack

| Layer             | Technology                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------------- |
| **Runtime**       | Bun 1.3+, TypeScript 5.9, ESM (`"type": "module"`)                                           |
| **Framework**     | Express 5 (API), Telegraf 4 (Telegram bot client)                                            |
| **LLM**           | Ollama (via `ollama` npm SDK), mock endpoint for offline dev                                 |
| **Database**      | PostgreSQL 18 + Prisma ORM 7 (`@prisma/adapter-pg`)                                          |
| **Cache / Queue** | Redis 8 + BullMQ (5 job queues)                                                              |
| **Auth**          | Admin bot restricted to `ADMINS` env list; HMAC + AES-256-GCM for user data                  |
| **Validation**    | Zod 4                                                                                        |
| **Logging**       | Pino + pino-pretty (console + file transports)                                               |
| **Infra**         | Docker / Compose, GitHub Actions CI/CD (lint, format, typecheck → build → GHCR → VPS deploy) |

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

## Commands

### Root

| Command            | Description                                 |
| ------------------ | ------------------------------------------- |
| `bun dev`          | Dev watch mode (Bun native TS)              |
| `bun build`        | Type-check + bundle to `dist/`              |
| `bun start`        | Production start from `dist/`               |
| `bun lint`         | ESLint auto-fix                             |
| `bun lint:check`   | ESLint check (zero warnings)                |
| `bun format`       | Prettier auto-format                        |
| `bun format:check` | Prettier check                              |
| `bun typecheck`    | TypeScript type check (no emit)             |
| `bun check`        | `lint:check` + `format:check` + `typecheck` |

### Database

| Command                 | Description                      |
| ----------------------- | -------------------------------- |
| `bun db:generate`       | Generate Prisma client           |
| `bun db:push`           | Push schema to DB (no migration) |
| `bun db:migrate`        | Create + apply migration (dev)   |
| `bun db:migrate:deploy` | Apply pending migrations (prod)  |
| `bun db:reset`          | Reset DB (drops all data)        |

### Docker

| Command                                                              | Description              |
| -------------------------------------------------------------------- | ------------------------ |
| `docker compose -f docker-compose.dev.yml up`                        | Start dev infrastructure |
| `docker compose -f docker-compose.dev.yml up --profile local-ollama` | Dev + local Ollama       |
| `docker compose up`                                                  | Start production stack   |

## Important Notes

- Pre-commit hook runs `bun check` (Husky)
- Build output: `dist/`
- Single `.env` file at project root (gitignored; use `.env.example` as template)
- Mock Ollama API available at `/api/v1/mock/*` for offline development
- Daily messages sent at 6 AM IST (cron `0 6 * * *`, timezone `Asia/Kolkata`)
- Admin bot runs on same process as user bot, guarded by auth middleware

## Critical Rules

- NEVER make git commits, git pushes, or GitHub PR changes without explicit user permission
- Always ask before committing, pushing, or creating/modifying pull requests
- NEVER use `any` type
- STRICTLY use `bun format` to auto-format code; do not manually format
- STRICTLY use `bun lint` to auto-fix lint issues; do not manually fix lint
- Run `bun check` before considering work complete
