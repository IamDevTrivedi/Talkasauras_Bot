# Setup Guide

This guide walks you through getting **Talkasauras Bot** running on your own machine, from a clean checkout to a working bot — in both development and production.

By the end you will have:

- A running PostgreSQL, Redis, and (optionally) Ollama stack.
- A correctly configured `.env` file with all required secrets.
- The bot compiled, migrated, and answering on Telegram.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Environment Configuration](#2-environment-configuration)
    - [Create the `.env` file](#21-create-the-env-file)
    - [Variable reference](#22-variable-reference)
    - [Development vs. production values](#23-development-vs-production-values)
3. [Local Development](#3-local-development)
4. [Production Deployment](#4-production-deployment)
5. [Port Reference](#5-port-reference)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Prerequisites

### Software

| Tool           | Version | Purpose                       |
| -------------- | ------- | ----------------------------- |
| Node.js        | 24+     | Application runtime           |
| pnpm           | 10+     | Package manager               |
| Docker         | recent  | Container runtime             |
| Docker Compose | v2+     | Orchestrating the local stack |
| Git            | any     | Cloning the repository        |

### Telegram

| Requirement        | Description                                                              |
| ------------------ | ------------------------------------------------------------------------ |
| A Telegram account | To chat with the bot and register yourself as an admin                   |
| Main bot token     | Created via [@BotFather](https://t.me/BotFather) for the user-facing bot |
| Admin bot token    | A second token via BotFather for the private admin panel                 |

> **Note:** The admin bot is a _separate_ Telegram bot, not a mode of the main bot. You need two distinct tokens.

---

## 2. Environment Configuration

All configuration lives in a single `.env` file at the project root. There is no separate `.env.development` / `.env.production` — the same file is used for both, with different values depending on where you are running.

### 2.1 Create the `.env` file

```bash
cp .env.example .env
```

Then open `.env` and fill in every value. The file starts with empty placeholders such as `<telegram_bot_token>` — replace each one as described below.

### 2.2 Variable reference

The tables below document every variable. For each one you will find:

- **What it is** — its purpose in the application.
- **How to obtain it** — where the value comes from.
- **Required in** — whether it is needed in development, production, or both.

---

#### Server

##### `PORT`

- **What it is:** The port the Express API server listens on.
- **How to set it:** Any free integer between `3000` and `5050` (this range is enforced by validation at startup).
- **Development:** `5000` (the default used in the examples below).
- **Production:** Keep `5000`. The production container maps host port `5004` → container port `5000`.
- **Required in:** development · production

---

#### PostgreSQL

##### `DATABASE_URL`

- **What it is:** The connection string the application uses to reach PostgreSQL.
- **How to set it:** Strictly follow this format:

    ```
    postgresql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DB>?schema=public
    ```

- **Development:** `postgresql://postgres:password@localhost:5003/talkasauras_bot?schema=public`
- **Production:** The (pooled) connection string from your managed Postgres provider.
- **Required in:** development · production

##### `DIRECT_URL`

- **What it is:** The _direct_ (non-pooled) connection string used by the Prisma CLI to run migrations (`db:migrate`, `db:migrate:deploy`).
- **How to obtain it:** Managed Postgres providers expose a separate "direct" URL alongside the pooled one.
- **Development:** Identical to `DATABASE_URL` — `postgresql://postgres:password@localhost:5003/talkasauras_bot?schema=public`
- **Production:** The provider's direct/non-pooled URL.
- **Required in:** development · production

##### `POSTGRES_USER`

- **What it is:** Username for the local Postgres container.
- **How to set it:** `postgres`
- **Required in:** development only _(used by the `postgres` container)_

##### `POSTGRES_PASSWORD`

- **What it is:** Password for the local Postgres container.
- **How to set it:** `password` (change this for anything non-local).
- **Required in:** development only _(used by the `postgres` container)_

##### `POSTGRES_DB`

- **What it is:** Name of the database to create.
- **How to set it:** `talkasauras_bot`
- **Required in:** development only _(used by the `postgres` container)_

> In production there is no Postgres container — the database is cloud-managed — so the `POSTGRES_*` values are only needed to _construct_ `DATABASE_URL` / `DIRECT_URL`.

---

#### Redis

##### `REDIS_HOST`

- **What it is:** Hostname of the Redis server.
- **Development:** `localhost` (the dev container publishes Redis to the host).
- **Production:** `redis` (the service name on the internal Docker network — the production stack does **not** publish Redis to the host).
- **Required in:** development · production

##### `REDIS_PORT`

- **What it is:** Port of the Redis server.
- **Development:** `5001` (host-published port).
- **Production:** `6379` (internal container port).
- **Required in:** development · production

##### `REDIS_USERNAME`

- **What it is:** Username for the Redis server.
- **How to set it:** `default`
- **Required in:** development · production

##### `REDIS_PASSWORD`

- **What it is:** Password for the Redis server.
- **How to set it:** `password` (change this for anything non-local).
- **Required in:** development · production

---

#### Telegram

##### `TELEGRAM_BOT_TOKEN`

- **What it is:** The token for the main (user-facing) bot.
- **How to obtain it:** Message [@BotFather](https://t.me/BotFather) → `/newbot`, follow the prompts, and copy the token.
- **Required in:** development · production

##### `TELEGRAM_BOT_TOKEN_INTERNAL`

- **What it is:** The token for the admin (internal) bot.
- **How to obtain it:** Repeat the BotFather flow for a _second_ bot.
- **Required in:** development · production

---

#### Ollama (LLM)

##### `OLLAMA_HOST`

- **What it is:** The base URL of the Ollama server. Must be a valid URL.
- **How to set it — choose one:**
    - **Remote provider** (default): your provider's URL, e.g. `https://ollama.com`
    - **Local container**: `http://localhost:5005` (the compose stack maps the Ollama container's `11434` to host `5005`)
    - **Mock server** (development only, no real LLM): `http://localhost:<PORT>/api/v1/mock`, e.g. `http://localhost:5000/api/v1/mock`
- **Required in:** development · production

##### `OLLAMA_API_KEY`

- **What it is:** The API key sent as a `Bearer` token with every request to the Ollama server.
- **How to set it:**
    - **Local / mock:** any non-empty string (it is not verified locally), e.g. `local-dev-key`
    - **Remote:** the key issued by your Ollama provider.
- **Required in:** development · production

##### `OLLAMA_MODEL_NAME`

- **What it is:** The name of the model to use for inference.
- **How to set it:**
    - **Remote:** the model name given by your provider, e.g. `minimax-m3`
    - **Local:** the name of the model you pulled into the Ollama container (see [Local Ollama](#33-optional-local-ollama)).
- **Required in:** development · production

---

#### Security keys

Both keys are generated the same way:

```bash
openssl rand -hex 32
```

This produces a 64-character hex string (the app requires at least 32 characters).

##### `SECRET_KEY_1`

- **What it is:** HMAC key used to hash the Telegram ID before storing it in the database.
- **How to obtain it:** `openssl rand -hex 32`
- **Required in:** development · production

##### `SECRET_KEY_2`

- **What it is:** AES-256-GCM key used to encrypt the Telegram ID before storing it in the database.
- **How to obtain it:** `openssl rand -hex 32` (generate a value _different_ from `SECRET_KEY_1`).
- **Required in:** development · production

---

#### Admins

##### `ADMINS`

- **What it is:** A `|`-separated list of Telegram usernames (or user IDs) that may access the admin bot.
- **How to set it:** `CypherBeing|another_admin_username`
- **Required in:** development · production

---

### 2.3 Development vs. production values

The variables that **differ** between environments are summarised below. Everything else is the same in both.

| Variable       | Development                                                                   | Production                           |
| -------------- | ----------------------------------------------------------------------------- | ------------------------------------ |
| `DATABASE_URL` | `postgresql://postgres:password@localhost:5003/talkasauras_bot?schema=public` | Cloud provider (pooled) URL          |
| `DIRECT_URL`   | same as `DATABASE_URL`                                                        | Cloud provider (direct) URL          |
| `REDIS_HOST`   | `localhost`                                                                   | `redis`                              |
| `REDIS_PORT`   | `5001`                                                                        | `6379`                               |
| `POSTGRES_*`   | used by the local Postgres container                                          | not used (cloud database)            |
| `OLLAMA_HOST`  | `http://localhost:5005` (local) or mock                                       | remote provider (or local container) |

---

## 3. Local Development

### 3.1 Clone and install

```bash
git clone https://github.com/IamDevTrivedi/Talkasauras_Bot.git
cd Talkasauras_Bot
```

```bash
cp .env.example .env
# ... fill in the values using the development column above ...
```

### 3.2 Start the infrastructure

```bash
docker compose -f docker-compose.dev.yml up -d
```

This starts Redis, Redis Insight, PostgreSQL, and CloudBeaver.

### 3.3 (Optional) Local Ollama

If you prefer a local model over a remote Ollama provider, start the Ollama container as well:

```bash
docker compose -f docker-compose.dev.yml --profile local-ollama up -d
```

Then pull a model of your choice into the container:

```bash
docker exec -it talkasauras-dev-ollama ollama run <model-name>
```

After pulling, set `OLLAMA_MODEL_NAME=<model-name>` and `OLLAMA_HOST=http://localhost:5005` in `.env`.

### 3.4 Install dependencies and set up the database

```bash
pnpm run install:all     # installs dependencies (pnpm install)
pnpm run db:generate     # generates the Prisma client
pnpm run db:migrate      # applies database migrations (prisma migrate dev)
```

### 3.5 Run the application

```bash
pnpm run dev
```

The server starts on `PORT` and logs `Server is running on port <PORT>` when ready.

---

## 4. Production Deployment

The production stack deliberately **omits the database-observation containers** (CloudBeaver, Redis Insight) to reduce the attack surface. It consists of:

- **Cloud PostgreSQL** — managed database (connection strings only, no container).
- **Local Redis** — internal container, not exposed to the host.
- **Application** — the bot image running in Docker.
- **Optional local Ollama** — only if you are not using a remote provider.

### 4.1 Deploy

```bash
git clone https://github.com/IamDevTrivedi/Talkasauras_Bot.git
cd Talkasauras_Bot
```

```bash
cp .env.example .env
# ... fill in the values using the production column above ...
```

Start the stack — choose the command that matches your Ollama setup:

```bash
docker compose up -d                           # remote Ollama provider
docker compose --profile local-ollama up -d    # local Ollama container
```

> The production compose file references the published image `ghcr.io/iamdevtrivedi/talkasauras_bot:latest` (and falls back to building from the `Dockerfile` if needed).

### 4.2 Apply database migrations

If migrations are not applied automatically by your CI/CD pipeline, run them once against the production database:

```bash
pnpm run db:migrate:deploy
```

---

## 5. Port Reference

### Development (`docker-compose.dev.yml`)

| Service         | Host port               | Container port |
| --------------- | ----------------------- | -------------- |
| Redis           | `5001`                  | `6379`         |
| Redis Insight   | `5002`                  | `5540`         |
| PostgreSQL      | `5003`                  | `5432`         |
| CloudBeaver     | `5004`                  | `8978`         |
| Ollama (opt-in) | `5005`                  | `11434`        |
| App (Express)   | `PORT` (default `5000`) | —              |

### Production (`docker-compose.yml`)

| Service         | Host port       | Container port |
| --------------- | --------------- | -------------- |
| Bot (app)       | `5004`          | `5000`         |
| Redis           | _internal only_ | `6379`         |
| Ollama (opt-in) | `5005`          | `11434`        |

---

## 6. Troubleshooting

### "Environment variable validation failed"

The app validates the entire environment on startup and exits with a detailed tree of errors. Common causes:

- `PORT` outside the `3000`–`5050` range.
- `OLLAMA_HOST` not a valid URL (it must include the scheme, e.g. `http://` / `https://`).
- `SECRET_KEY_1` / `SECRET_KEY_2` shorter than 32 characters.
- An empty required value such as `TELEGRAM_BOT_TOKEN` or `ADMINS`.

Read the printed error tree — it names the exact field that failed.

### Redis or PostgreSQL not healthy

```bash
docker compose -f docker-compose.dev.yml ps
```

Confirm the containers are `healthy` (not `starting` or `unhealthy`). The dev stack uses healthchecks; wait a few seconds after `up -d` before running the app.

### Port already in use

If a host port (`5001`–`5005`) is occupied, either stop the conflicting process or change the host side of the mapping in the compose file and update `.env` to match.

### Bot doesn't respond on Telegram

- Confirm `TELEGRAM_BOT_TOKEN` matches the token from BotFather.
- Check the startup log for `Mode: production` / `Mode: development` and the `Server is running` line.
- Ensure the machine can reach `OLLAMA_HOST` (the bot needs it to generate replies).
