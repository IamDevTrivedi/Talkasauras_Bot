import { checkEnv } from "@/config/checkEnv.js";
import { connectDB } from "@/db/prisma.js";
import { connectRedis } from "@/db/redis.js";
import { shutdownManager } from "@/shutdown.js";

const init = async () => {
    checkEnv();
    await connectDB();
    await connectRedis();
    shutdownManager();
};

init().catch(console.error);
