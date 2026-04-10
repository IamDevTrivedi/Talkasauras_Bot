# Setup Instructions

This file contains the setup instructions for a newly cloned instance of this repository.

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

In production, all services run behind **Nginx** for single-port access (`8080` of the container).
you can map this to any port on your host machine (let `5004` for example)

1. **Build:**

```bash
docker compose build --no-cache
```

2. **Run:**

```bash
docker compose up
```

**Endpoints:**

- **Application:** `http://localhost:5004/app`
- **Redis Commander:** `http://localhost:5004/commander`
- **pgAdmin:** `http://localhost:5004/pgadmin`
