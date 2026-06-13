import { env } from "@/config/env.js";
import { logger } from "@/utils/logger.js";
import { Context } from "telegraf";

const normalize = (value: string): string => value.trim().toLowerCase();

const isAuthorizedAdmin = (username?: string, userId?: number): boolean => {
    const normalizedUsername = username ? normalize(username) : null;
    const idAsText = typeof userId === "number" ? userId.toString() : null;

    return env.ADMINS.some((admin) => {
        const normalizedAdmin = normalize(admin);

        if (!normalizedAdmin) {
            return false;
        }

        if (normalizedUsername && normalizedAdmin === normalizedUsername) {
            return true;
        }

        if (idAsText && normalizedAdmin === idAsText) {
            return true;
        }

        return false;
    });
};

const authMiddleware = async (ctx: Context, next: () => Promise<void>) => {
    try {
        const username = ctx.from?.username;
        const userId = ctx.from?.id;

        if (!isAuthorizedAdmin(username, userId)) {
            if (ctx.updateType === "callback_query") {
                await ctx.answerCbQuery("Unauthorized");
            }

            await ctx.reply(
                "This bot is for authorized administrators only.\n\n" +
                    "If you believe this is an error, please contact the developer."
            );
            return;
        }

        await next();
    } catch (error) {
        logger.error("Admin auth middleware error", error);
        await ctx.reply("Sorry, something went wrong. Please try again later.");
    }
};

export { isAuthorizedAdmin, authMiddleware };
