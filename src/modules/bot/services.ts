import { bot } from "@/config/bot.js";
import { logger } from "@/utils/logger.js";

export const services = {
    prepare: async () => {
        try {
            bot.on("text", async (ctx) => {
                logger.info(ctx.message.text);
                await ctx.reply("Hello! This is a response from your bot.");
            });
        } catch (error) {
            logger.error("Failed to prepare bot", error);
            process.exit(1);
        }
    },

    launch: async () => {
        try {
            await bot.launch();
        } catch (error) {
            logger.error("Failed to launch bot", error);
            process.exit(1);
        }
    },
};
