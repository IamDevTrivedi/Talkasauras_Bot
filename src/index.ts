import { checkEnv } from "@/config/checkEnv.js";
import { connectDB } from "@/db/prisma.js";
import { connectRedis } from "@/db/redis.js";
import { shutdownManager } from "@/shutdown.js";
import express from "express";
import { env } from "@/config/env.js";
import { logger } from "@/utils/logger.js";
import { services as botService } from "@/modules/bot/services.js";
import { services as adminServices } from "@/modules/admin/services.js";
import { connectOllama } from "@/config/ollama.js";

const init = async () => {
    checkEnv();
    await connectDB();
    await connectRedis();
    connectOllama();
    shutdownManager();

    const app = express();
    app.use(express.json());

    const { default: rootRouter } = await import("@/modules/root/routes.js");
    const { default: healthRouter } = await import("@/modules/health/routes.js");
    const { default: mockRouter } = await import("@/modules/mock/routes.js");
    app.use("/", rootRouter);
    app.use("/api/v1/health", healthRouter);
    app.use("/mock", mockRouter);

    app.listen(env.PORT, () => {
        logger.info(`Mode: ${env.NODE_ENV}`);
        logger.info(`Server is running on port ${env.PORT}`);
    });

    await botService.prepare();
    botService.launch();
    await adminServices.prepare();
    adminServices.launch();
};

init().catch(console.error);
