import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

const env = process.env["NODE_ENV"] ?? "development";

if (env === "development") {
    dotenv.config({ path: "./.env.development" });
} else {
    dotenv.config();
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
