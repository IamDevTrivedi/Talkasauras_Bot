# Setup Guide

This guide walks you through setting up the Talkasauras Bot for local development or production deployment.

---

## Prerequisites

Before you begin, ensure you have the following installed and configured.

### Required Software

| Requirement | Version | Purpose |
|---|---|---|
| Node.js | >= 24 | JavaScript runtime |
| pnpm | >= 10 | Package manager (install: `corepack enable pnpm`) |
| Docker & Docker Compose | Latest | Containerized services (Redis, PostgreSQL, Ollama) |
| Git | Latest | Version control, Husky hooks |

### Required Accounts

| Account | Purpose | How to Get |
|---|---|---|
| Telegram account | Create and test bots | Sign up at https://telegram.org |
| @BotFather access | Obtain bot tokens | Start chat at https://t.me/BotFather |

### Port Availability

The development stack uses the following ports. Ensure none are in use:

| Port | Service |
|---|---|
| 5000 | Express server (app) |
| 5001 | Redis |
| 5002 | Redis Commander (UI) |
| 5003 | PostgreSQL |
| 5004 | CloudBeaver (DB UI) |
| 5005 | Ollama (optional, local-ollama profile) |

### Clone the Repository

```bash
git clone https://github.com/IamDevTrivedi/Talkasauras_Bot.git
cd Talkasauras_Bot
```

---

## Environment Variables & Configuration

The project uses two separate environment files — one for development, one for production. Each file is documented with inline comments explaining every variable.

### Copy the Template Files

```bash
cp .env.development.example .env.development
cp .env.production.example .env.production
```

### Obtain Telegram Bot Tokens

You need **two** separate Telegram bots — one for users, one for admins.

1. Open Telegram and start a chat with [@BotFather](https://t.me/BotFather).
2. Send `/newbot` to create the main user-facing bot.
   - Choose a display name (e.g., `Talkasauras`).
   - Choose a username (e.g., `TalkasaurasBot`).
   - Copy the token (format: `1234567890:ABCdefGHIjklmNOPqrstUVwxyz`).
   - Paste it as `TELEGRAM_BOT_TOKEN` in both `.env` files.
3. Send `/newbot` again to create the admin/internal bot.
   - Use a different name and username (e.g., `TalkasaurasAdmin` / `TalkasaurasAdminBot`).
   - Copy the token and paste it as `TELEGRAM_BOT_TOKEN_INTERNAL` in both `.env` files.
4. Keep both tokens secret — they grant full control of your bots.

### Generate Encryption Keys

Two cryptographic keys are required for hashing and encrypting user data at rest:

```bash
openssl rand -hex 32   # → SECRET_KEY_1 (HMAC-SHA256, 64 hex chars)
openssl rand -hex 32   # → SECRET_KEY_2 (AES-256-GCM, 64 hex chars)
```

Paste the output values into `SECRET_KEY_1` and `SECRET_KEY_2` in both `.env` files. These must be different from each other.

### Configure Admins

The `ADMINS` variable is a pipe-separated (`|`) list of Telegram usernames or numeric user IDs authorized to use the admin bot.

To find your Telegram user ID, message [@userinfobot](https://t.me/userinfobot) or [@getidsbot](https://t.me/getidsbot) on Telegram.

```bash
# Examples:
ADMINS=john_doe
ADMINS=john_doe|jane_smith|123456789
```

### Environment Files Summary

| File | Used When | Loaded By |
|---|---|---|
| `.env.development` | `pnpm dev` | `src/config/env.ts` via `dotenv` |
| `.env.production` | `docker compose up` | Docker Compose `env_file` injects into process |

Each file has detailed inline comments explaining every variable — open them and fill in the remaining values (`OLLAMA_HOST`, `OLLAMA_MODEL_NAME`, `REDIS_*`, `DATABASE_URL`, etc.) according to your setup.

---

## Running in Development Mode

### Infrastructure — Start All Services

The `docker-compose.dev.yml` file defines all backing services the bot needs. Start them with:

```bash
docker compose -f docker-compose.dev.yml up -d
```

This launches:

| Container | Internal Port | Host Port | Purpose |
|---|---|---|---|
| Redis | 6379 | 5001 | BullMQ job queues + rate limiting |
| Redis Commander | 8081 | 5002 | Web UI for inspecting Redis |
| PostgreSQL | 5432 | 5003 | Primary database |
| CloudBeaver | 8978 | 5004 | Web UI for browsing the database |
| Ollama | — | — | Not started yet (see 3.2) |

Verify all services are healthy:

```bash
docker compose -f docker-compose.dev.yml ps
```

All services should show `Up` or `healthy`.

### Using Local Ollama

The Ollama container is behind a Docker profile so it only starts when explicitly requested.

#### Start the Ollama Container

```bash
docker compose -f docker-compose.dev.yml --profile local-ollama up -d
```

This starts the Ollama server on port `5005` (host) mapped to `11434` (container).

#### Install an LLM Model

Pull a model into the running Ollama container:

```bash
docker compose -f docker-compose.dev.yml exec ollama ollama pull llama3.2
```

Common models and their approximate sizes:

| Model | Parameters | Size (approx.) | Use Case |
|---|---|---|---|
| `llama3.2` | 3.8B | 2.4 GB | Fast, general purpose |
| `gemma3` | 9B | 5.5 GB | Strong reasoning |
| `mistral` | 7B | 4.1 GB | Efficient, good balance |
| `qwen2.5` | 7B | 4.2 GB | Multilingual, code |
| `minimax-m2.1` | — | varies | Alternative option |

#### List Installed Models

```bash
docker compose -f docker-compose.dev.yml exec ollama ollama list
```

#### Configure the Environment

Set these in `.env.development` to point the bot at your local Ollama:

```bash
OLLAMA_HOST=http://localhost:5005
OLLAMA_MODEL_NAME=llama3.2
```

#### Alternative: Use the Built-in Mock API

If you don't want to run Ollama at all, the app includes a mock Ollama API that returns canned responses. Set:

```bash
OLLAMA_HOST=http://localhost:5000/api/v1/mock
OLLAMA_API_KEY=anything
OLLAMA_MODEL_NAME=anything
```

This is useful for testing the bot's command handling, reminders, and admin features without needing a real LLM.

### Install Dependencies

```bash
pnpm install
```

This installs all Node.js dependencies and sets up Husky git hooks (pre-commit lint + format checks).

### Push Database Schema

Generate the Prisma client and push the schema to your PostgreSQL database:

```bash
pnpm db:push
```

This creates all tables (`User`, `Message`, `Feedback`, `Reminder`) and enums (`WritingStyle`, `Model`, `Role`).

> If you prefer SQL migrations instead of direct push, use `pnpm db:migrate` instead.

### Start the Application

```bash
pnpm dev
```

This uses `tsx watch` — the app automatically restarts when files change.

#### What Happens at Startup

1. Validates all environment variables (Zod schema).
2. Connects to PostgreSQL via Prisma.
3. Connects to Redis.
4. Initializes the Ollama client.
5. Starts the Express server on port `5000`.
   - `GET /` — Welcome message.
   - `GET /api/v1/health` — Health check.
   - `/api/v1/mock` — Mock Ollama endpoints (if enabled).
6. Launches the main user-facing Telegram bot.
7. Launches the admin/internal Telegram bot.
8. Schedules the daily message cron job (6 AM IST).

### Verify the Setup

#### Health Check

```bash
curl http://localhost:5000/api/v1/health
```

Expected response:

```json
{
  "success": true,
  "message": "Service is healthy"
}
```

#### Test the Main Bot

1. Open Telegram and find your main bot (the username you chose in @BotFather).
2. Send `/start`.
3. The bot should respond with a welcome message.
4. Send a text message — the bot will reply (via Ollama or mock).

#### Test the Admin Bot

1. Open Telegram and find your admin bot.
2. Send `/start`.
3. If your Telegram username or ID is in `ADMINS`, you'll see the admin menu.
4. Try `/status` to view system health and queue depths.

#### Check the Logs

```bash
tail -f logs/app-development.log
tail -f logs/error-development.log
```

---

## Running in Production Mode

### Fill `.env.production`

Open `.env.production` and set every variable to its production value. Key differences from development:

| Variable | Dev Value | Prod Value |
|---|---|---|
| `NODE_ENV` | `development` | `production` |
| `DATABASE_URL` | Local PostgreSQL on `localhost:5003` | Cloud/Supabase with pgBouncer (port 6543) |
| `DIRECT_URL` | Not needed | Direct connection for migrations (port 5432) |
| `REDIS_HOST` | `localhost` | `redis` (Docker network) |
| `REDIS_PORT` | `5001` | `6379` |
| `OLLAMA_HOST` | `http://localhost:5005` | Remote Ollama endpoint |

For PostgreSQL, [Supabase](https://supabase.com) is recommended — create a project and copy the connection strings from Project Settings → Database. Use the pooled connection (port 6543, `?pgbouncer=true`) for `DATABASE_URL` and the direct connection (port 5432) for `DIRECT_URL`.

### Deploy

```bash
docker compose up -d --build
```

That's it. This single command:

1. Builds the bot Docker image (Node 24 Alpine).
2. Starts a Redis container (BullMQ job queues).
3. Starts a Redis Commander container (monitoring UI on port `5005`).
4. Starts the bot container, which automatically:
   - Runs `prisma migrate deploy` to apply pending migrations.
   - Starts the Express server (internal port `5000`, mapped to host `5004`).
   - Launches both Telegram bots (main + admin).
   - Schedules the daily message cron (6 AM IST).

All moving parts — database migrations, Redis, bot processes, cron scheduling — are handled automatically inside the containers.

### Verify the Setup

```bash
# Health check
curl http://<your-server-ip>:5004/api/v1/health

# View logs
docker compose logs -f bot

# Check service status
docker compose ps
```

Then open Telegram and test both bots — the main user bot and the admin bot.

---

## Useful Commands Reference

| Command | Description |
|---|---|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm start` | Run compiled production build |
| `pnpm lint` | Run ESLint with auto-fix |
| `pnpm lint:check` | Check lint without auto-fix |
| `pnpm format` | Run Prettier formatter |
| `pnpm format:check` | Check formatting only |
| `pnpm check` | Run lint + format check (used by Husky pre-commit) |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to database (development) |
| `pnpm db:migrate` | Create and apply a new migration |
| `pnpm db:migrate:deploy` | Apply pending migrations (production) |
| `pnpm db:studio` | Open Prisma Studio on port 5004 |
| `pnpm db:seed` | Run database seed script |
| `pnpm clean:all` | Remove `dist/` and `node_modules/` |
| `pnpm install:all` | Fresh install of all dependencies |
| `pnpm reset:all` | Clean + reinstall |

---

## Troubleshooting

| Problem | Likely Cause | Solution |
|---|---|---|
| Bot doesn't respond | Wrong `TELEGRAM_BOT_TOKEN` | Re-check token from @BotFather |
| Bot responds "Unauthorized" | Your user not in `ADMINS` | Check your Telegram ID via @userinfobot |
| Database connection failed | PostgreSQL not running or wrong `DATABASE_URL` | Run `docker compose ps`, verify Postgres is up |
| Redis connection failed | Redis not running or wrong `REDIS_HOST/PORT` | Run `docker compose ps`, verify Redis is up |
| "Model not found" from Ollama | Model not pulled or wrong `OLLAMA_MODEL_NAME` | Run `ollama pull <model>` in the container |
| Rate limit errors | More than 10 messages in 60 seconds | Wait 60 seconds before sending more |
| Port already in use | Another service on same port | Change `PORT` in `.env` or stop conflicting service |
| Prisma migration fails | Wrong `DIRECT_URL` or DB not reachable | Verify `DIRECT_URL` uses direct port (5432), not pooler |
| App crashes on startup | Missing or invalid env var | Check logs for validation errors from Zod schema |
| Docker build fails | Out of disk space or network issues | Run `docker system prune`, retry |
