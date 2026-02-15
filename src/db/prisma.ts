import "dotenv/config";
import { logger } from "@/utils/logger.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { env } from "@/config/env.js";

const connectionString = env.DATABASE_URL;

const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });

process.on("beforeExit", async () => {
    await prisma.$disconnect();
});

export const connectDB = async () => {
    try {
        await prisma.$connect();
        logger.info("Database connected successfully.");
    } catch (error) {
        logger.error("Database connection failed:", error);
        process.exit(1);
    }
};

export const disconnectDB = async () => {
    try {
        await prisma.$disconnect();
        logger.info("Database disconnected successfully.");
    } catch (error) {
        logger.error("Database disconnection failed:", error);
    }
};
