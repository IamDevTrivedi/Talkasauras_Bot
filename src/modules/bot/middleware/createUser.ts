import { bot } from "../botInstance.js";
import { prisma } from "@/db/prisma.js";
import { redisClient } from "@/db/redis.js";
import { logger } from "@/utils/logger.js";
import { lastActivityQueue, QueueNames } from "../../queue/index.js";

const registerCreateUser = () => {
    bot.use(async (ctx, next) => {
        try {
            const telegramIdHash = ctx.state.telegramIdHash as string;
            const telegramIdEnc = ctx.state.telegramIdEnc as string;

            const exists = await redisClient.exists(`user:${telegramIdHash}`);

            if (!exists) {
                const existingUser = await prisma.user.findUnique({
                    where: { telegramIdHash },
                });

                if (!existingUser) {
                    await prisma.user.create({
                        data: {
                            telegramIdHash,
                            telegramIdEnc,
                            createdAt: BigInt(Date.now()),
                            lastActive: BigInt(Date.now()),
                        },
                    });
                }
            }

            await redisClient.set(`user:${telegramIdHash}`, "1", {
                EX: 60 * 60 * 3,
            });

            lastActivityQueue.add(QueueNames.UPDATE_LAST_ACTIVITY, {
                lastActive: Date.now(),
                telegramIdHash,
            });

            await next();
        } catch (error) {
            logger.error("Failed to create/verify user", error);
            await ctx.reply("Sorry, something went wrong. Please try again later.");
        }
    });
};

export { registerCreateUser };
