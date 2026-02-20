import { logger } from "@/utils/logger.js";
import { disconnectDB } from "@/db/prisma.js";
import { disconnectRedis } from "@/db/redis.js";
import { bot } from "@/config/bot.js";
import { adminBot } from "@/config/adminBot.js";

let isShuttingDown = false;

export const shutdownManager = () => {
    const shutdown = async (signal: string) => {
        if (isShuttingDown) {
            return;
        }

        isShuttingDown = true;
        logger.info(`Received ${signal}. Shutting down`);

        bot.stop(signal);
        adminBot.stop(signal);

        await Promise.all([disconnectDB(), disconnectRedis()]);

        logger.info("Shutdown complete.");
        process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
};
