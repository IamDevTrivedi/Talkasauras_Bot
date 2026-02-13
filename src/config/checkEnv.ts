import { env } from "@/config/env";
import { logger } from "@/utils/logger";
import { z } from "zod";

const envSchema = z
    .object({
        NODE_ENV: z.enum(["development", "production"]),
        isProduction: z.boolean(),
        isDevelopment: z.boolean(),

        PORT: z.int().min(3000).max(5050),

        DATABASE_URL: z.url(),
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
