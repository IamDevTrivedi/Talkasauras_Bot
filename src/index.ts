import { checkEnv } from "@config/checkEnv";
import { connectDB } from "@db/prisma";

const init = async () => {
    checkEnv();
    await connectDB();
};

init().catch(console.error);
