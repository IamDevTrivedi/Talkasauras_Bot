import { checkEnv } from "@config/checkEnv";
import { connectDB } from "@db/prisma";
import { connectRedis } from "./db/redis";
import { shutdownManager } from "./shutdown";

const init = async () => {
    checkEnv();
    await connectDB();
    await connectRedis();
    shutdownManager();
};

init().catch(console.error);
