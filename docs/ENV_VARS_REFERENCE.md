# Environment Variables Reference

This document provides a reference for all environment variables used in the application.

Example files are provided in the repository for each environment:

| File | Example |
|------|---------|
| Root `.env` | [.env.example](../.env.example) |
| Development | [.env.development.example](../.env.development.example) |
| Production | [.env.production.example](../.env.production.example) |

**Quick setup — copy all example files at once:**

```bash
cp -n .env.example .env
cp -n .env.development.example .env.development
cp -n .env.production.example .env.production
```

> **Important:** If any value in `.env.*` is missing or invalid, the server will fail to start and throw an error at startup. Ensure all variables are filled with proper values before starting the server.

---

## Root `.env`

Contains a single variable used by Prisma to connect to the database.

#### `DATABASE_URL`

| Field | Value |
|-------|-------|
| **Description** | Connection string for the database, used by Prisma |
| **Format** | `postgresql://<username>:<password>@<host>:<port>/<database_name>?schema=<schema_name>` |
| **Example** | `postgresql://postgres:password@postgres:5432/talkasauras_bot?schema=public` |

---

## Development `.env.development`

Contains environment variables specific to development mode.

> **Note:** `.env.development` is a subset of `.env.production` — all variables here must also be present in `.env.production`, typically with different values suited for production.
>
> **Docker profile note:** In development, local Ollama runs only when Docker Compose is started with `--profile local-ollama`. If you do not enable that profile, point `OLLAMA_HOST` to an external Ollama endpoint.

---

### Application

#### `PORT`

| Field | Value |
|-------|-------|
| **Description** | Port on which the Express server listens for incoming requests |
| **Format** | `<port_number>` |
| **Example** | `5000` |

---

### PostgreSQL

You can use either a local PostgreSQL instance spun up via `docker compose up`, or an external service (e.g. ElephantSQL, Heroku Postgres). If using an external service, set the variables below accordingly.

**Default values for local Docker Compose PostgreSQL:**

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=talkasauras_bot

DATABASE_URL=postgresql://postgres:password@postgres:5432/talkasauras_bot?schema=public
```

#### `POSTGRES_USER`

| Field | Value |
|-------|-------|
| **Description** | Username for the PostgreSQL database |
| **Format** | `<username>` |
| **Example** | `postgres` |

#### `POSTGRES_PASSWORD`

| Field | Value |
|-------|-------|
| **Description** | Password for the PostgreSQL database |
| **Format** | `<password>` |
| **Example** | `password` |

#### `POSTGRES_DB`

| Field | Value |
|-------|-------|
| **Description** | Name of the PostgreSQL database |
| **Format** | `<database_name>` |
| **Example** | `talkasauras_bot` |

#### `DATABASE_URL`

| Field | Value |
|-------|-------|
| **Description** | Connection string constructed from the Postgres variables above, used by Prisma |
| **Format** | `postgresql://{{POSTGRES_USER}}:{{POSTGRES_PASSWORD}}@postgres:5432/{{POSTGRES_DB}}?schema=public` |
| **Example** | `postgresql://postgres:password@postgres:5432/talkasauras_bot?schema=public` |
| **Constraint** | Must match the `DATABASE_URL` in the root `.env` to ensure consistency |

---

### Redis

You can use either a local Redis instance spun up via `docker compose up`, or an external service (e.g. Redis Cloud, RedisLabs). If using an external service, set the variables below accordingly.

**Default values for local Docker Compose Redis:**

```env
REDIS_USERNAME=default
REDIS_PASSWORD=password
REDIS_HOST=redis
REDIS_PORT=6379
```

#### `REDIS_USERNAME`

| Field | Value |
|-------|-------|
| **Description** | Username for the Redis database |
| **Format** | `<username>` |
| **Example** | `default` |

#### `REDIS_PASSWORD`

| Field | Value |
|-------|-------|
| **Description** | Password for the Redis database |
| **Format** | `<password>` |
| **Example** | `password` |

#### `REDIS_HOST`

| Field | Value |
|-------|-------|
| **Description** | Host for the Redis database |
| **Format** | `<host>` |
| **Example** | `redis` |

#### `REDIS_PORT`

| Field | Value |
|-------|-------|
| **Description** | Port for the Redis database |
| **Format** | `<port_number>` |
| **Example** | `6379` |

---

### Telegram Bot

#### `TELEGRAM_BOT_TOKEN`

| Field | Value |
|-------|-------|
| **Description** | Token for the main Telegram bot, used to authenticate with the Telegram API |
| **Format** | `<bot_token>` |
| **Example** | `7692349333:Ahjefgjhe-NMNfbjeefnfkjejnkjwY` |
| **Obtain from** | [Telegram BotFather](https://t.me/BotFather) |

#### `TELEGRAM_BOT_TOKEN_INTERNAL`

| Field | Value |
|-------|-------|
| **Description** | Token for the internal Telegram bot, used to authenticate the internal bot with the Telegram API |
| **Format** | `<bot_token>` |
| **Example** | `8482738499:AAGdb8a9c2cc847369786f3daa54773Xhu4` |
| **Obtain from** | [Telegram BotFather](https://t.me/BotFather) |

---

### Ollama

You can use either a local Ollama instance (started via `docker compose --profile local-ollama up`) or an external Ollama service. If using an external service, set the variables below accordingly.

**Default values for local Docker Compose Ollama (`--profile local-ollama`):**

```env
OLLAMA_API_KEY=any_bullshit_value_since_ollama_does_not_require_api_key_for_localhost
OLLAMA_HOST=http://ollama:11434
OLLAMA_MODEL_NAME=phi3:mini
```

#### `OLLAMA_API_KEY`

| Field | Value |
|-------|-------|
| **Description** | API key for Ollama, used to authenticate with the Ollama API |
| **Format** | `<ollama_api_key>` |
| **Example** | `qwertyuioplkjhgfdsazxcvbnm1234567890` |
| **Note** | Local Ollama: any non-empty value works. External Ollama: use a real key if your provider requires one |
| **Obtain from** | [Ollama](https://ollama.com/) |

#### `OLLAMA_HOST`

| Field | Value |
|-------|-------|
| **Description** | Host URL for the Ollama API |
| **Format** | `<ollama_host>` |
| **Example (local profile enabled)** | `http://ollama:11434` |
| **Example (external Ollama)** | `https://ollama.example.com` |
| **Constraint** | Must be reachable from inside the `bot` container |

#### `OLLAMA_MODEL_NAME`

| Field | Value |
|-------|-------|
| **Description** | Name of the model to use with the Ollama API |
| **Format** | `<ollama_model_name>` |
| **Example** | `phi3:mini` |

---

### Application Security

#### `SECRET_KEY_1`

| Field | Value |
|-------|-------|
| **Description** | Used by HMAC for key hashing of Telegram user IDs before storing them in the database |
| **Format** | `<secret_key>` |
| **Example** | `any_random_string_of_characters_and_numbers` |

Generate with one of:

```bash
openssl rand -hex 32
```
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### `SECRET_KEY_2`

| Field | Value |
|-------|-------|
| **Description** | Used for encryption and decryption within the application |
| **Format** | `<secret_key>` |
| **Example** | `any_random_string_different_from_SECRET_KEY_1` |

Generate with one of:

```bash
openssl rand -hex 32
```
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### Admin Users

#### `ADMINS`

| Field | Value |
|-------|-------|
| **Description** | Telegram usernames of admins with access to the internal Telegram bot |
| **Format** | `<username_1>\|<username_2>\|<username_3>` |
| **Separator** | `\|` (pipe character) |
| **Example** | `CypherBeing\|Admin2\|Admin3` |

---

## Production `.env.production`

`.env.production` is a **superset** of `.env.development` — all development variables must be present here with the same names but values appropriate for the production environment.

### Additional Production-Only Variables

#### `HTTP_USER`

| Field | Value |
|-------|-------|
| **Description** | Username for Redis Commander UI authentication in production |
| **Format** | `<username>` |
| **Example** | `admin` |

#### `HTTP_PASSWORD`

| Field | Value |
|-------|-------|
| **Description** | Password for Redis Commander UI authentication in production |
| **Format** | `<password>` |
| **Example** | `password` |

#### `PGADMIN_DEFAULT_EMAIL`

| Field | Value |
|-------|-------|
| **Description** | Email address for pgAdmin authentication in production |
| **Format** | `<email>` |
| **Example** | `you@example.com` |

#### `PGADMIN_DEFAULT_PASSWORD`

| Field | Value |
|-------|-------|
| **Description** | Password for pgAdmin authentication in production |
| **Format** | `<password>` |
| **Example** | `password` |