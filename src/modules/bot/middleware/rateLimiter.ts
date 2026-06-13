import { bot } from "../botInstance.js";
import { redisClient } from "@/db/redis.js";
import { RATE_LIMIT_WINDOW, RATE_LIMIT_MAX } from "@/constants/app.js";

const registerRateLimiter = () => {
    bot.use(async (ctx, next) => {
        try {
            const telegramIdHash = ctx.state.telegramIdHash as string;
            const rateLimitKey = `ratelimit:${telegramIdHash}`;

            const current = await redisClient.incr(rateLimitKey);

            if (current === 1) {
                await redisClient.expire(rateLimitKey, RATE_LIMIT_WINDOW);
            }

            if (current > RATE_LIMIT_MAX) {
                await ctx.reply(
                    "You're sending messages too quickly. Please wait a moment before trying again."
                );
                return;
            }

            return next();
        } catch {
            return next();
        }
    });
};

export { registerRateLimiter };
