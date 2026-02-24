import { env } from "@/config/env.js";
import { logger } from "@/utils/logger.js";
import { createClient, RedisClientType } from "redis";

const client: RedisClientType = createClient({
    socket: {
        host: env.REDIS.HOST,
        port: env.REDIS.PORT,
    },
    username: env.REDIS.USERNAME,
    password: env.REDIS.PASSWORD,
});

client.on("error", (error: Error) => {
    logger.error("Redis Client Error", error);
    process.exit(1);
});

client.on("connect", () => {
    logger.info(`Redis Client Connected successfully.`);
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
