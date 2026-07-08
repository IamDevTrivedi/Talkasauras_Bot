import { adminBot } from "../botInstance.js";
import { logger } from "@/utils/logger.js";

const registerErrorHandler = () => {
    adminBot.catch((err, ctx) => {
        logger.error(`Admin bot error for update ${ctx.updateType}`, err);
        try {
            ctx.reply("An unexpected error occurred. Please try again later.");
        } catch {
            logger.error("Failed to send error message to admin");
        }
    });
};

export { registerErrorHandler };
