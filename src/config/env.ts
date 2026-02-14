import process from "node:process";
import dotenv from "dotenv";
import fs from "fs";

const ENV_FILES = {
    development: "./.env.development",
    production: "./.env.production",
} as const;

const NODE_ENV = process.env.NODE_ENV as "development" | "production";

const loadEnvironmentConfig = (): void => {
    const envPath = ENV_FILES[NODE_ENV];

    if (NODE_ENV === "development") {
        if (!fs.existsSync(envPath)) {
            console.error(`Error: ${envPath} not found.`);
            process.exit(1);
        }
        dotenv.config({ path: envPath });
    } else {
        if (fs.existsSync(envPath)) {
            dotenv.config({ path: envPath });
        } else {
            console.warn(
                `Warning: ${envPath} not found. Falling back to default environment variables.`
            );
            dotenv.config();
        }
    }
};

loadEnvironmentConfig();

export const env = {
    NODE_ENV,
    isProduction: NODE_ENV === "production",
    isDevelopment: NODE_ENV === "development",

    PORT: Number(process.env.PORT),

    DATABASE_URL: process.env.DATABASE_URL as string,

    REDIS_USERNAME: process.env.REDIS_USERNAME as string,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD as string,
    REDIS_HOST: process.env.REDIS_HOST as string,
    REDIS_PORT: Number(process.env.REDIS_PORT),
    LOCAL_REDIS: process.env.LOCAL_REDIS === "1",

    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN as string,
} as const;
