# Directory Structure of the project

The project is organized into the following directory structure:

```
.
├── docker-compose.dev.yml
├── docker-compose.yml
├── Dockerfile
├── Dockerfile.dev
├── docs
│   ├── diagrams
│   │   ├── database_schema.excalidraw
│   │   ├── db_schema.png
│   │   ├── deployment_architecture.excalidraw
│   │   ├── deployment_architecture.png
│   │   ├── life_cycle.excalidraw
│   │   ├── life_cycle.png
│   │   ├── system_design.excalidraw
│   │   └── system_design.png
|   ├── DIRECTORY_STRUCTURE.md
│   ├── ENV_VARS_REFERENCE.md
│   ├── SCRIPTS.md
│   └── SETUP.md
├── eslint.config.mjs
├── LICENSE
├── nginx.conf
├── package.json
├── pnpm-lock.yaml
├── prisma
│   ├── migrations
│   │   ├── 20260214192752_user_msg_schema
│   │   │   └── migration.sql
│   │   ├── 20260215190915_add_feedback_model
│   │   │   └── migration.sql
│   │   ├── 20260215191543_anonlymized_feedback
│   │   │   └── migration.sql
│   │   ├── 20260217162337_bytes_to_string
│   │   │   └── migration.sql
│   │   ├── 20260217174614_key_version_default_0
│   │   │   └── migration.sql
│   │   ├── 20260217184829_add_reminder_model
│   │   │   └── migration.sql
│   │   ├── 20260217203209_simplify_crypto
│   │   │   └── migration.sql
│   │   ├── 20260220195926_add_telegram_id_enc_to_user
│   │   │   └── migration.sql
│   │   ├── 20260220212010_fix_encrpted_id_condition
│   │   │   └── migration.sql
│   │   ├── 20260221124155_rm_key_versioning
│   │   │   └── migration.sql
│   │   ├── 20260221130810_optional_custom_instructions
│   │   │   └── migration.sql
│   │   ├── 20260301184849_add_subscribed_to_user
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   ├── schema.prisma
│   └── seed.ts
├── prisma.config.ts
├── public
│   └── image.png
├── README.md
├── scripts
│   ├── clean-all.js
│   ├── install-all.js
│   └── reset-all.js
├── src
│   ├── config
│   │   ├── adminBot.ts
│   │   ├── bot.ts
│   │   ├── checkEnv.ts
│   │   ├── env.ts
│   │   └── ollama.ts
│   ├── constants
│   │   └── app.ts
│   ├── db
│   │   ├── prisma.ts
│   │   └── redis.ts
│   ├── index.ts
│   ├── modules
│   │   ├── admin
│   │   │   └── services.ts
│   │   ├── bot
│   │   │   └── services.ts
│   │   ├── health
│   │   │   ├── controller.ts
│   │   │   └── routes.ts
│   │   ├── mock
│   │   │   ├── controller.ts
│   │   │   └── routes.ts
│   │   ├── queue
│   │   │   ├── index.ts
│   │   │   ├── processors
│   │   │   │   ├── dailyMsgCreator.ts
│   │   │   │   ├── dailyMsgSender.ts
│   │   │   │   ├── sendBroadcast.ts
│   │   │   │   ├── sendReminder.ts
│   │   │   │   └── updateLastActivity.ts
│   │   │   ├── queues.ts
│   │   │   ├── redisConfig.ts
│   │   │   └── workers.ts
│   │   └── root
│   │       ├── controller.ts
│   │       └── routes.ts
│   ├── shutdown.ts
│   └── utils
│       ├── crypto.ts
│       ├── genPrompt.ts
│       └── logger.ts
└── tsconfig.json

32 directories, 73 files
```

This structure includes configuration files, source code, database schema and migrations, documentation, and scripts for managing the project. Each directory serves a specific purpose, such as `src` for source code, `prisma` for database-related files, and `docs` for documentation.