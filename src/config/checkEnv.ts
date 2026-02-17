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

        OLLAMA: z.object({
            PROVIDER: z.enum(["HF", "LOCAL", "MOCK", "CLOUD"]),
            API_KEY: z.string().min(1),
            HOSTS: z.object({
                HF: z.url(),
                LOCAL: z.url(),
                MOCK: z.url(),
                CLOUD: z.url(),
            }),
            BASE_URL: z.url(),
        }),

        KEYS: z.object({
            SECRET_KEY_1: z.array(z.string().min(32)),
            SECRET_KEY_2: z.array(z.string().min(32)),
            VERSION: z.number().int().min(0),
        }).superRefine((data, ctx) => {
            if (data.SECRET_KEY_1.length !== data.SECRET_KEY_2.length) {
                ctx.addIssue({
                    code: "custom",
                    message: "SECRET_KEY_1 and SECRET_KEY_2 must have the same length",
                    path: ["SECRET_KEY_2"]
                });
            }

            if (data.VERSION >= data.SECRET_KEY_1.length) {
                ctx.addIssue({
                    code: "custom",
                    message: "VERSION must be less than the number of keys",
                    path: ["VERSION"]
                });
            }
        })
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
