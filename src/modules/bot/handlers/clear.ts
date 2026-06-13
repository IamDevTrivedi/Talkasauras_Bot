import { bot } from "../botInstance.js";
import { prisma } from "@/db/prisma.js";
import { logger } from "@/utils/logger.js";

const registerClear = () => {
    bot.command("clear", async (ctx) => {
        const telegramIdHash = ctx.state.telegramIdHash as string;

        try {
            await prisma.message.deleteMany({
                where: { telegramIdHash },
            });

            await ctx.reply(
                "Done. Your entire conversation history has been cleared successfully."
            );
        } catch (error) {
            logger.error("Failed to clear conversation history", error);
            await ctx.reply(
                "Sorry, I couldn't clear your conversation history. Please try again later."
            );
        }
    });

    bot.command("clear_instructions", async (ctx) => {
        const telegramIdHash = ctx.state.telegramIdHash as string;

        try {
            await prisma.user.update({
                where: { telegramIdHash },
                data: { customInstructions: null },
            });

            await ctx.reply(
                "Your custom instructions have been cleared. The bot will now respond using its default behavior."
            );
        } catch (error) {
            logger.error("Failed to clear custom instructions", error);
            await ctx.reply("Sorry, something went wrong. Please try again later.");
        }
    });
};

export { registerClear };
