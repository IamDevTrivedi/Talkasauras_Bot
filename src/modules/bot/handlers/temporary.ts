import { bot } from "../botInstance.js";
import { prisma } from "@/db/prisma.js";
import { logger } from "@/utils/logger.js";
import { TEMPORARY_MSG_TIMEOUT } from "@/constants/app.js";

const registerTemporary = () => {
    bot.command("current_mode", async (ctx) => {
        const telegramIdHash = ctx.state.telegramIdHash as string;

        try {
            const user = await prisma.user.findUnique({
                where: { telegramIdHash },
            });

            await ctx.reply(
                `Current Chat Mode\n` +
                    `========================\n\n` +
                    `Active Mode:  ${user!.temporaryOn ? "Temporary" : "Default"}\n\n` +
                    `Available actions:\n` +
                    `  /temporary_on   -  Switch to Temporary Mode\n` +
                    `  /temporary_off  -  Switch back to Default Mode\n\n` +
                    `Note: Temporary messages are automatically removed after ${TEMPORARY_MSG_TIMEOUT / (1000 * 60)} minutes of inactivity or when you switch back to Default Mode.`
            );
        } catch (error) {
            logger.error("Failed to fetch user for current_mode command", error);
            await ctx.reply("Sorry, I couldn't fetch your current mode. Please try again later.");
        }
    });

    bot.command("temporary_on", async (ctx) => {
        const telegramIdHash = ctx.state.telegramIdHash as string;

        try {
            await prisma.user.update({
                where: { telegramIdHash },
                data: { temporaryOn: true },
            });

            await ctx.reply(
                "Temporary Mode is now active.\n\n" +
                    `All new messages from this point forward will be treated as temporary. ` +
                    `They will be automatically deleted when you switch back to Default Mode ` +
                    `or after ${TEMPORARY_MSG_TIMEOUT / (1000 * 60)} minutes of inactivity.\n\n` +
                    "To return to Default Mode, use /temporary_off."
            );
        } catch (error) {
            logger.error("Failed to enable temporary mode", error);
            await ctx.reply("Sorry, I couldn't enable Temporary Mode. Please try again later.");
        }
    });

    bot.command("temporary_off", async (ctx) => {
        const telegramIdHash = ctx.state.telegramIdHash as string;

        try {
            await prisma.message.deleteMany({
                where: {
                    telegramIdHash,
                    isTemporary: true,
                },
            });

            await prisma.user.update({
                where: { telegramIdHash },
                data: { temporaryOn: false },
            });

            await ctx.reply(
                "Temporary Mode has been deactivated.\n\n" +
                    "All temporary messages have been permanently deleted and you are now " +
                    "back in Default Mode. Your future messages will be stored as usual.\n\n" +
                    "To re-enable Temporary Mode, use /temporary_on."
            );
        } catch (error) {
            logger.error("Failed to disable temporary mode", error);
            await ctx.reply("Sorry, I couldn't disable Temporary Mode. Please try again later.");
        }
    });
};

export { registerTemporary };
