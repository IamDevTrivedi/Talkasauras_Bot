import { env } from "@/config/env.js";
import { logger } from "@/utils/logger.js";
import { z } from "zod";

const envSchema = z
    .object({
        NODE_ENV: z.enum(["development", "production"]),
        isProduction: z.boolean(),
        isDevelopment: z.boolean(),

        PORT: z.int().min(3000).max(5050),

        DATABASE_URL: z.url(),

        REDIS_USERNAME: z.string().min(1),
        REDIS_PASSWORD: z.string().min(1),
        REDIS_HOST: z.string().min(1),
        REDIS_PORT: z.int().min(1).max(65535),
        LOCAL_REDIS: z.boolean(),

        TELEGRAM_BOT_TOKEN: z.string().min(1),
    })
    .strict();

export const checkEnv = () => {
    const result = envSchema.safeParse(env);

    if (!result.success) {
        console.error("Environment variable validation failed:", z.treeifyError(result.error));
        process.exit(1);
    } else {
        logger.info("Environment variables validated successfully.");
    }
};

export type EnvSchema = z.infer<typeof envSchema>;
