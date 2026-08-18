import { bot } from "../botInstance.js";
import { redisClient } from "@/db/redis.js";
import { RATE_LIMIT_WINDOW, RATE_LIMIT_MAX } from "@/constants/app.js";

const registerRateLimiter = () => {
    bot.use(async (ctx, next) => {
        try {
            const telegramIdHash = ctx.state.telegramIdHash as string;
            const rateLimitKey = `ratelimit:${telegramIdHash}`;

            const now = Date.now();
            const windowStart = now - RATE_LIMIT_WINDOW * 1000;
            const member = `${now}:${Math.random().toString(36).slice(2)}`;

            // Add current request timestamp to sorted set
            await redisClient.zAdd(rateLimitKey, { score: now, value: member });

            // Remove requests older than the sliding window
            await redisClient.zRemRangeByScore(rateLimitKey, "-inf", windowStart);

            // Count remaining requests in the current window
            const current = await redisClient.zCard(rateLimitKey);

            // Keep the key alive for the window duration
            await redisClient.expire(rateLimitKey, RATE_LIMIT_WINDOW);

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
