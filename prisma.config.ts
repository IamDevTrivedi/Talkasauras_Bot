import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

const env = process.env["NODE_ENV"] ?? "development";

const result = dotenv.config({
    path: `.env.${env}`,
});

if (result.error) {
    throw result.error;
}

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        url: process.env["DATABASE_URL"],
    },
});
