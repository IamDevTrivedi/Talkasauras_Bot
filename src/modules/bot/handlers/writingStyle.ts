import { bot } from "../botInstance.js";
import { prisma } from "@/db/prisma.js";
import { logger } from "@/utils/logger.js";
import { Markup } from "telegraf";
import { WritingStyle } from "@prisma/client";
import { writingStyleLabels } from "../constants.js";

const registerWritingStyle = () => {
    bot.command("writing_style", async (ctx) => {
        await ctx.reply(
            "Choose your preferred writing style:",
            Markup.inlineKeyboard([
                [Markup.button.callback("Default", "ws:DEFAULT")],
                [Markup.button.callback("Formal", "ws:FORMAL")],
                [Markup.button.callback("Descriptive", "ws:DESCRIPTIVE")],
                [Markup.button.callback("Concise", "ws:CONCISE")],
            ])
        );
    });

    bot.action(/^ws:(.+)$/, async (ctx) => {
        const style = ctx.match[1] as WritingStyle;

        if (!Object.values(WritingStyle).includes(style)) {
            await ctx.answerCbQuery("Invalid writing style.");
            return;
        }

        const telegramIdHash = ctx.state.telegramIdHash as string;

        try {
            await prisma.user.update({
                where: { telegramIdHash },
                data: { writingStyle: style },
            });

            await ctx.answerCbQuery(`Writing style set to ${writingStyleLabels[style]}!`);
            await ctx.editMessageText(`Writing style updated to: ${writingStyleLabels[style]}`);
        } catch (error) {
            logger.error("Failed to update writing style", error);
            await ctx.answerCbQuery("Something went wrong. Please try again.");
        }
    });

    bot.command("subscribe", async (ctx) => {
        const telegramIdHash = ctx.state.telegramIdHash as string;

        try {
            await prisma.user.update({
                where: { telegramIdHash },
                data: { subscribed: true },
            });

            await ctx.reply("You've been subscribed to daily messages!");
        } catch (error) {
            logger.error("Failed to subscribe to daily messages", error);
            await ctx.reply("Something went wrong. Please try again later.");
        }
    });

    bot.action("daily:unsubscribe", async (ctx) => {
        const telegramIdHash = ctx.state.telegramIdHash as string;

        try {
            await prisma.user.update({
                where: { telegramIdHash },
                data: { subscribed: false },
            });

            await ctx.answerCbQuery("Daily messages disabled!");
            await ctx.editMessageText(
                "Daily messages have been disabled.\n\n" +
                    "Use /subscribe to re-enable them anytime."
            );
        } catch (error) {
            logger.error("Failed to unsubscribe from daily messages", error);
            await ctx.answerCbQuery("Something went wrong. Please try again.");
        }
    });
};

export { registerWritingStyle };
