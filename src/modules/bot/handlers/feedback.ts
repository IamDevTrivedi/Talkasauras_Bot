import { bot } from "../botInstance.js";
import { prisma } from "@/db/prisma.js";
import { logger } from "@/utils/logger.js";

const registerFeedback = () => {
    bot.command("feedback", (ctx) => {
        ctx.reply(
            "Your feedback matters to us and helps improve the bot.\n\n" +
                "Please reply to this message with your valued feedback.",
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
                    "Please reply to this message with your valued feedback"
                ) &&
                msg.reply_to_message.from?.id === ctx.botInfo.id
            ) {
                const feedbackText = "text" in msg ? msg.text : null;

                if (!feedbackText) {
                    await ctx.reply("Please send your feedback as a text message.");
                    return;
                }

                try {
                    await prisma.feedback.create({
                        data: {
                            feedback: feedbackText,
                            reviewed: false,
                            createdAt: BigInt(Date.now()),
                        },
                    });

                    await ctx.reply(
                        "Thank you for sharing your feedback. It has been recorded and will be reviewed by the developer."
                    );
                } catch (error) {
                    logger.error("Failed to save feedback", error);
                    await ctx.reply("Sorry, something went wrong. Please try again later.");
                }

                return;
            }

            return next();
        } catch (error) {
            logger.error("Failed to process feedback", error);
            await ctx.reply("Sorry, something went wrong. Please try again later.");
        }
    });
};

export { registerFeedback };
