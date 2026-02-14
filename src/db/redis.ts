import { env } from "@/config/env.js";
import { logger } from "@/utils/logger.js";
import { createClient, RedisClientType } from "redis";

let client: RedisClientType;

if (env.LOCAL_REDIS) {
    client = createClient();
} else {
    client = createClient({
        username: env.REDIS_USERNAME,
        password: env.REDIS_PASSWORD,
        socket: {
            host: env.REDIS_HOST,
            port: env.REDIS_PORT,
        },
    });
}

client.on("error", (error: Error) => {
    logger.error("Redis Client Error", error);
    process.exit(1);
});

client.on("connect", () => {
    logger.info(`Redis Client Connected: ${env.LOCAL_REDIS ? "Local" : "Remote"} Instance`);
});

export const connectRedis = async (): Promise<void> => {
    try {
        await client.connect();
    } catch (error) {
        logger.error(
            "Failed to connect to Redis",
            error instanceof Error ? error : new Error(String(error))
        );
        process.exit(1);
    }
};

export const disconnectRedis = async (): Promise<void> => {
    try {
        await client.quit();
        logger.info("Redis Client Disconnected");
    } catch (error) {
        logger.error(
            "Failed to disconnect Redis",
            error instanceof Error ? error : new Error(String(error))
        );
    }
};

export { client as redisClient };
