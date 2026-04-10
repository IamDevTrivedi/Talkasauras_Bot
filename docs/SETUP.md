# Setup Instructions

This file contains the setup instructions for a newly cloned instance of this repository.

## Environment Variables Reference

Please refer to the [Environment Variables Reference](ENV_VARS_REFERENCE.md) document for detailed information on all environment variables used in this project, including their descriptions, formats, and examples.

---

## How to Run the Project

By this point, you should have all the necessary environment variables set up as per the reference document.

> **Important:** If any value in `.env.*` is missing or invalid, the server will fail to start and throw an error at startup. Ensure all variables are filled with proper values before starting the server.

### Prerequisites

| Requirement | Details |
|-------------|---------|
| **Docker & Docker Compose** | [Install Guide](https://docs.docker.com/get-started/get-docker/) |
| **Node.js & pnpm** | [Node.js Download](https://nodejs.org/en/download) |
| **Git (for hooks)** | Required for Husky pre-commit checks |
| **Configuration** | Ensure all `.env` files are populated |

---

### Development Mode

#### 0. Install Dependencies and Git Hooks

Install dependencies on your host machine. Husky is configured through the `prepare` script and automatically installs Git hooks during install.

```bash
pnpm install
```

If hooks are ever missing (for example after cloning with skipped scripts), run:

```bash
pnpm prepare
```

Pre-commit checks now run automatically before each commit using:

```bash
pnpm run check
```

#### 1. Fresh Build

Run this at the root of the project:

```bash
docker compose -f docker-compose.dev.yml build --no-cache
```

#### 2. Start Services

By default, development mode starts all required services except local Ollama.

```bash
docker compose -f docker-compose.dev.yml up
```

To include the local Ollama container, enable the `local-ollama` profile:

```bash
docker compose -f docker-compose.dev.yml --profile local-ollama up
```

#### 3. Local Ollama Setup *(Optional)*

If using the local Ollama container (started with `--profile local-ollama`), pull your model:

```bash
docker exec talkasauras-dev-ollama ollama pull gemma3:4b
```

If you opt out of local Ollama, set `OLLAMA_HOST` (and `OLLAMA_API_KEY` if required by your provider) in `.env.development` to your external Ollama endpoint.

> **Constraint:** Ensure the model you pull matches the one specified in your `.env.development` file (e.g. `gemma3:4b`). A mismatch will cause the server to fail to respond to requests due to a model-not-found error.
>
> Note: Pulling a model can take a long time depending on your internet speed — models are typically several gigabytes.

#### 4. Prisma Migrations

To manage the Prisma schema in development:

```bash
# Creates a versioned migration stored in ./prisma/migrations
docker exec talkasauras-dev-bot pnpm db:migrate

# Does NOT create a migration — just syncs the schema directly with the DB
docker exec talkasauras-dev-bot pnpm db:push
```

#### 5. Database Viewer

To open Prisma Studio (available at `http://localhost:51212`):

```bash
docker exec talkasauras-dev-bot pnpm db:studio
```

#### 6. Monitoring Logs

If the server stops unexpectedly (fail-fast), check the logs to identify the missing environment variable or connection error:

```bash
docker compose -f docker-compose.dev.yml logs -f
```

---

#### Adding Dependencies

To add a new package:

1. Install on your host machine:

```bash
pnpm install <package-name>
```

2. Rebuild the environment:

```bash
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml build --no-cache
docker compose -f docker-compose.dev.yml up
```

---

### Production Mode

In production, all services run behind **Nginx** for single-port access on port `8080` of the container. You can map this to any port on your host machine (e.g. `5004`).

#### 1. Build

```bash
docker compose build --no-cache
```

#### 2. Run

```bash
docker compose up
```

#### Endpoints

| Service | URL |
|---------|-----|
| **Application** | `http://localhost:5004/app` |
| **Redis Commander** | `http://localhost:5004/commander` |
| **pgAdmin** | `http://localhost:5004/pgadmin` |