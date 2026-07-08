import { bot } from "../botInstance.js";
import { env } from "@/config/env.js";
import { prisma } from "@/db/prisma.js";
import { encrypt } from "@/utils/crypto.js";
import { logger } from "@/utils/logger.js";

const registerInstructions = () => {
    bot.command("custom_instructions", async (ctx) => {
        ctx.reply(
            "Custom Instructions\n" +
                "========================\n\n" +
                "You can personalize how I respond to you by providing your own instructions.\n\n" +
                "Please reply to this message with your custom instructions.\n\n" +
                "Examples:\n" +
                "  - Always respond in bullet points\n" +
                "  - Explain things as if I am a beginner\n" +
                "  - Keep answers under 100 words",
            { reply_markup: { force_reply: true } }
        );
    });

    bot.on("message", async (ctx, next) => {
        try {
            const msg = ctx.message;

            if (
                "reply_to_message" in msg &&
                msg.reply_to_message &&
                "text" in msg.reply_to_message &&
                msg.reply_to_message.text?.includes(
                    "You can personalize how I respond to you by providing your own instructions."
                ) &&
                msg.reply_to_message.from?.id === ctx.botInfo.id
            ) {
                const instructionText = "text" in msg ? msg.text : null;

                if (!instructionText) {
                    await ctx.reply("Please send your custom instructions as a text message.");
                    return;
                }

                const telegramIdHash = ctx.state.telegramIdHash as string;

                try {
                    await prisma.user.update({
                        where: { telegramIdHash },
                        data: {
                            customInstructions: encrypt({
                                key: env.KEYS.SECRET_KEY_2,
                                data: instructionText,
                            }),
                        },
                    });

                    await ctx.reply(
                        "Your custom instructions have been saved successfully. " +
                            "All future responses will follow your personalized preferences."
                    );
                } catch (error) {
                    logger.error("Failed to save custom instructions", error);
                    await ctx.reply("Sorry, something went wrong. Please try again later.");
                }

                return;
            }

            return await next();
        } catch (error) {
            logger.error("Failed to process custom instructions", error);
            await ctx.reply("Sorry, something went wrong. Please try again later.");
        }
    });
};

export { registerInstructions };
