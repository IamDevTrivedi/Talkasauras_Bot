import { logger } from "@utils/logger";
import { disconnectDB } from "@db/prisma";
import { disconnectRedis } from "@db/redis";

let isShuttingDown = false;

export const shutdownManager = () => {
    const shutdown = async (signal: string) => {
        if (isShuttingDown) {
            return;
        }

        isShuttingDown = true;
        logger.info(`Received ${signal}. Shutting down`);

        await Promise.all([disconnectDB(), disconnectRedis()]);

        logger.info("Shutdown complete.");
        process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
};
