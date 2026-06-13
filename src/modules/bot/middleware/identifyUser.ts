import { bot } from "../botInstance.js";
import { env } from "@/config/env.js";
import { logger } from "@/utils/logger.js";
import { HMAC, encrypt } from "@/utils/crypto.js";

const registerIdentifyUser = () => {
    bot.use(async (ctx, next) => {
        try {
            const { id } = ctx.from!;

            if (!id) {
                await ctx.reply(
                    "Sorry, I couldn't identify you. Please make sure your Telegram account is properly set up"
                );
                return;
            }

            const telegramIdHash = HMAC({
                data: id.toString(),
                key: env.KEYS.SECRET_KEY_1,
            });

            const telegramIdEnc = encrypt({
                data: id.toString(),
                key: env.KEYS.SECRET_KEY_2,
            });

            ctx.state.telegramIdHash = telegramIdHash;
            ctx.state.telegramIdEnc = telegramIdEnc;
            ctx.sendChatAction("typing");
            await next();
        } catch (error) {
            logger.error("Failed to identify user", error);
            await ctx.reply("Sorry, something went wrong. Please try again later.");
        }
    });
};

export { registerIdentifyUser };
