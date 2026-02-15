import { env } from "@/config/env.js";
import { ConnectionOptions } from "bullmq";

export const redisConfig: ConnectionOptions = env.LOCAL_REDIS
    ? {
          host: "localhost",
          port: 6379,
      }
    : {
          host: env.REDIS_HOST,
          port: env.REDIS_PORT,
          username: env.REDIS_USERNAME,
          password: env.REDIS_PASSWORD,
      };
