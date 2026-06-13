import { bot } from "../botInstance.js";
import { logger } from "@/utils/logger.js";

const registerErrorHandler = () => {
    bot.catch((err, ctx) => {
        logger.error(`Bot error for update ${ctx.updateType}`, err);
        try {
            ctx.reply("An unexpected error occurred. Please try again later.");
        } catch {
            logger.error("Failed to send error message to user");
        }
    });
};

export { registerErrorHandler };
