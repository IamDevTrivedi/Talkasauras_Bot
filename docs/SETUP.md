# Setup Instructions

This file contains the setup instructions for a newly cloned instance of this repository.

## Environment Files

The application uses three main environment (`.env`) files. Each serves a specific role in the containerized ecosystem.

### 1. Quick Start: Configure Environments

Copy the example files to create your active configuration:

```bash
cp .env.example .env
cp .env.development.example .env.development
cp .env.production.example .env.production
```

### 2. `.env`

Used solely by **Prisma** for the database connection.

- **DATABASE_URL**
    - **Meaning:** The connection string for PostgreSQL.
    - **Requirement:** Must follow the strict format: `postgresql:<POSTGRES_USER>:<POSTGRES_PASSWORD>@<postgres container name>:5432/<POSTGRES_DB>`
    - **Example:** `DATABASE_URL=postgresql://postgres:password@postgres:5432/talkasauras_bot?schema=public`

---

### 3. `.env.development`

Contains variables for the main application and its dependencies (PostgreSQL, Redis, etc.) during development.

#### **Server & Database**

- **PORT**
    - **Meaning:** The port number used by the Express server.
    - **Requirement:** Must be available (not occupied) when the container starts.
    - **Example:** `5000`

- **DATABASE_URL**
    - **Requirement:** Must match the value used in the `.env` file.

- **POSTGRES_USER**
    - **Meaning:** The PostgreSQL username.
    - **Requirement:** Must be reflected in the `DATABASE_URL`.
    - **Example:** `postgres`

- **POSTGRES_PASSWORD**
    - **Meaning:** The password for the PostgreSQL user.
    - **Requirement:** Must be reflected in the `DATABASE_URL`.
    - **Example:** `password`

- **POSTGRES_DB**
    - **Meaning:** The name of the database.
    - **Requirement:** Must be reflected in the `DATABASE_URL`.
    - **Example:** `talkasauras_bot`

#### **Redis Configuration**

- **REDIS_USERNAME**
    - **Meaning:** The Redis database user.
    - **Requirement:** Use `default` for local Docker Redis. For cloud, use the provider's value.
    - **Example:** `default`

- **REDIS_PASSWORD**
    - **Meaning:** The password for the Redis user.
    - **Requirement:** Use `password` (or any string) for local Docker. For cloud, use the provider's value.
    - **Example:** `password`

- **REDIS_HOST**
    - **Meaning:** The network host address for Redis.
    - **Requirement:** Use the Redis container name (e.g., `redis`) for local Docker.
    - **Example:** `redis`

- **REDIS_PORT**
    - **Meaning:** The port Redis is listening on.
    - **Requirement:** Use `6379` for local Docker.
    - **Example:** `6379`

#### **AI & Telegram Integration**

- **TELEGRAM_BOT_TOKEN**
    - **Meaning:** The Telegram API token for the main AI chatbot.
    - **Requirement:** Obtain this from [@BotFather](https://t.me/botfather) on Telegram.

- **OLLAMA_API_KEY**
    - **Meaning:** API key for your Ollama cloud provider.
    - **Requirement:** If using local Ollama, enter any random value to satisfy the requirement.

- **OLLAMA_HOST**
    - **Meaning:** The host address for the Ollama service.
    - **Requirement:** \* **Cloud:** `https://ollama.com`
    - **Local Container:** `http://ollama:11434`
    - **Mock Server:** `http://localhost:5000/api/v1/mock`

- **OLLAMA_MODEL_NAME**
    - **Meaning:** The specific AI model used to generate responses.
    - **Requirement:** The model **must** support image inputs (multimodal).
    - **Example:** `gemma3:4b`

#### **Security & Internal Admin**

- **SECRET_KEY_1**
    - **Meaning:** Key used for HMAC hashing of Telegram IDs.
    - **Requirement:** Minimum 32 characters in length.
    - **Example:** `f29a0b98b9672530a4c1a0e57a0291e16b9aa7f42bfece8cb26d039aa7f42bfe`

- **SECRET_KEY_2**
    - **Meaning:** Key used for encryption of user information.
    - **Requirement:** Minimum 32 characters in length.
    - **Example:** `f29a0b98b9672530a4c1a0e57a0291e16b9aa7f42bfece8cb26d039aa7f42bfe`

- **KEYS_VERSION**
    - **Meaning:** The versioning for the secret keys above.
    - **Requirement:** A unique number. Incremental (1, 2, 3...) is preferred.
    - **Example:** `1`

- **ADMINS**
    - **Meaning:** List of usernames allowed to access the internal admin bot.
    - **Requirement:** Usernames must be separated by a pipe (`|`).
    - **Example:** `user1|user2|user3`

- **TELEGRAM_BOT_TOKEN_INTERNAL**
    - **Meaning:** The Telegram token for the internal admin bot.
    - **Requirement:** Used for analytics and broadcasting announcements.

---

### 4. `.env.production`

Contains variables for the production environment. It mirrors `.env.development` with two additional security variables:

- **HTTP_USER**
    - **Meaning:** The username for the `redis-commander` web interface.
    - **Example:** `admin`

- **HTTP_PASSWORD**
    - **Meaning:** The password for the `redis-commander` web interface.
    - **Example:** `secure_password_123`

---

## How to Run the Project

### Prerequisites

- **Docker & Docker Compose:** [Install Guide](https://docs.docker.com/get-started/get-docker/)
- **Node.js & pnpm:** [Node.js Download](https://nodejs.org/en/download)
- **Configuration:** Ensure all `.env` files are populated.

### Development Mode

1. **Fresh Build:** Run this at the root of the project:

```bash
docker compose -f docker-compose.dev.yml build --no-cache
```

2. **Start Services:**

```bash
docker compose -f docker-compose.dev.yml up
```

3. **Local Ollama Setup (Optional):** If using the local Ollama container, pull your model:

```bash
docker exec talkasauras-dev-ollama ollama pull gemma3:4b
```

Pulling a model can take a long time depending on their internet speed (it's several gigabytes).

4. **New Prisma Migration:** to add a new migration in the prisma schema, run

```bash
docker exec talkasauras-dev-bot pnpm db:migrate # this CREATES a version of the migrate stored in ./prisma/migrations
docker exec talkasauras-dev-bot pnpm db:push    # this DO NOT CREATES migration and just syncs the schema with DB
```

5. **Database Viewer:** To open Prisma Studio (available at `http://localhost:51212`):

```bash
docker exec talkasauras-dev-bot pnpm db:studio
```

6. **Monitoring Logs:** If the server stops unexpectedly (fail-fast), check the logs to identify the missing environment variable or connection error:

```bash
docker compose -f docker-compose.dev.yml logs -f
```

#### Adding Dependencies

To add a new package:

1. Install on your host machine: `pnpm install <package-name>`
2. Rebuild the environment:

```bash
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml build --no-cache
docker compose -f docker-compose.dev.yml up
```

### Production Mode

In production, all services run behind **Nginx** for single-port access (`8080`).

1. **Build:**

```bash
docker compose build --no-cache
```

2. **Run:**

```bash
docker compose up
```

**Endpoints:**

- **Application:** `http://localhost:8080/app`
- **Redis Commander:** `http://localhost:8080/commander`
