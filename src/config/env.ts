import process from "node:process";
import dotenv from "dotenv";
import fs from "fs";

const devEnvPath = "./.env.development";
const prodEnvPath = "./.env.production";

const NODE_ENV = process.env.NODE_ENV as "development" | "production";
if (NODE_ENV === "development") {
    if (fs.existsSync(devEnvPath)) {
        dotenv.config({ path: devEnvPath });
    } else {
        console.error(`Error: ${devEnvPath} not found.`);
        process.exit(1);
    }
} else {
    if (fs.existsSync(prodEnvPath)) {
        dotenv.config({ path: prodEnvPath });
    } else {
        // NOTE: In production, we can still run with default environment variables if the .env.production file is missing
        console.warn(
            `Warning: ${prodEnvPath} not found. Falling back to default environment variables.`
        );
        dotenv.config();
    }
}

export const env = {
    NODE_ENV,
    isProduction: NODE_ENV === "production",
    isDevelopment: NODE_ENV === "development",

    PORT: Number(process.env.PORT),
} as const;
