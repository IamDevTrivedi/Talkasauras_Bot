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

    OLLAMA: {
        PROVIDER: process.env.PROVIDER as "HF" | "LOCAL" | "MOCK" | "CLOUD",
        API_KEY: process.env.API_KEY as string,

        HOSTS: {
            HF: process.env.OLLAMA_HOST_HF as string,
            LOCAL: process.env.OLLAMA_HOST_LOCAL as string,
            MOCK: process.env.OLLAMA_HOST_MOCK as string,
            CLOUD: process.env.OLLAMA_HOST_CLOUD as string,
        },

        BASE_URL: (() => {
            switch (process.env.PROVIDER) {
                case "HF":
                    return process.env.OLLAMA_HOST_HF as string;
                case "LOCAL":
                    return process.env.OLLAMA_HOST_LOCAL as string;
                case "MOCK":
                    return process.env.OLLAMA_HOST_MOCK as string;
                case "CLOUD":
                    return process.env.OLLAMA_HOST_CLOUD as string;
                default:
                    process.exit(1);
            }
        })(),

        MODEL_NAME: process.env.OLLAMA_MODEL_NAME as string,
    },

    KEYS: {
        SECRET_KEY_1: (process.env.SECRET_KEY_1 as string)
            .split("|")
            .filter(Boolean)
            .map((key) => key.trim()),
        SECRET_KEY_2: (process.env.SECRET_KEY_2 as string)
            .split("|")
            .filter(Boolean)
            .map((key) => key.trim()),
        VERSION: Number(process.env.KEYS_VERSION),
    },
} as const;
