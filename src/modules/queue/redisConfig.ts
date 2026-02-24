import { env } from "@/config/env.js";
import { ConnectionOptions } from "bullmq";

export const redisConfig: ConnectionOptions = {
    host: env.REDIS.HOST,
    port: env.REDIS.PORT,
    username: env.REDIS.USERNAME,
    password: env.REDIS.PASSWORD,
};
