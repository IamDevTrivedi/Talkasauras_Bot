# NPM Scripts Documentation

## Build Commands

```bash
pnpm run build # runs: tsc && tsc-alias
```

**Purpose:** Compiles TypeScript code to JavaScript and resolves path aliases for production deployment

```bash
pnpm run dev # runs: cross-env NODE_ENV=development tsx watch --clear-screen=true --tsconfig tsconfig.json --watch src src/index.ts
```

**Purpose:** Runs the application in development mode with hot-reload on file changes

```bash
pnpm run start # runs: cross-env NODE_ENV=production node dist/index.js
```

**Purpose:** Runs the compiled application in production mode
**Note:** Requires `build` to be run first

---

## Project Management Commands

```bash
pnpm run clean:all # runs: node scripts/clean-all.js
```

**Purpose:** Removes all generated files and dependencies (node_modules, dist, etc.)

```bash
pnpm run install:all # runs: node scripts/install-all.js
```

**Purpose:** Installs all project dependencies across the entire project

```bash
pnpm run reset:all # runs: node scripts/reset-all.js
```

**Purpose:** Resets the entire project to a clean state and reinstalls dependencies

---

## Code Quality Commands

```bash
pnpm run lint # runs: eslint . --fix
```

**Purpose:** Checks and automatically fixes code quality issues using ESLint

```bash
pnpm run lint:check # runs: eslint . --max-warnings=0
```

**Purpose:** Checks for linting errors without fixing them (fails on any warnings)

```bash
pnpm run format # runs: prettier --write .
```

**Purpose:** Formats all code files according to Prettier configuration

```bash
pnpm run format:check # runs: prettier --check .
```

**Purpose:** Checks if files are formatted correctly without modifying them

---

## Database Commands

```bash
pnpm run db:generate # runs: prisma generate
```

**Purpose:** Generates Prisma Client based on your schema file

```bash
pnpm run db:push # runs: prisma db push
```

**Purpose:** Pushes schema changes directly to the database without creating migrations
**Note:** Use for rapid prototyping; doesn't maintain migration history

```bash
pnpm run db:migrate # runs: prisma migrate dev
```

**Purpose:** Creates and applies a new database migration in development

```bash
pnpm run db:migrate:deploy # runs: prisma migrate deploy
```

**Purpose:** Applies pending migrations in production environments (non-interactive)

```bash
pnpm run db:studio # runs: prisma studio --browser none
```

**Purpose:** Opens Prisma Studio for visual database management at localhost:5555

```bash
pnpm run db:seed # runs: tsx prisma/seed.ts
```

**Purpose:** Populates the database with initial or test data from seed file

```bash
pnpm run db:reset # runs: prisma migrate reset
```

**Purpose:** Resets the database to a clean state and reapplies all migrations
**Warning:** Deletes all data in the database
