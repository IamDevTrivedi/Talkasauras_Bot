import { bot } from "@/config/bot.js";
import { prisma } from "@/db/prisma.js";
import { logger } from "@/utils/logger.js";

export const services = {
    prepare: async () => {
        try {

            // /start: Welcome message handler
            bot.start((ctx) => {
                const name = ctx.from?.first_name || "there";
                ctx.reply(
                    `Hey ${name}!\n\nI'm Talkasauras Bot — your AI-powered chat companion on Telegram.\n\nType anything to start a conversation, or use /help to see what I can do!`
                );
            });

            // /about: Bot information handler
            bot.command("about", (ctx) => {
                ctx.reply(
                    `Talkasauras Bot\n\nAn AI-powered Telegram bot that lets you have natural conversations. Built with love by Dev Trivedi.`
                );
            });

            // /help: List of available commands handler
            bot.command("help", (ctx) => {
                ctx.reply(
                    `Available Commands\n\n/start — Start the bot & get a welcome message\n/about — Learn more about Talkasauras Bot\n/help — Show this list of commands\n/contact — Developer's contact details\n/feedback — Share your feedback with us\n\nOr just send me any message and I'll chat with you!`
                );
            });

            // /contact: Developer contact information handler
            bot.command("contact", (ctx) => {
                ctx.reply(
                    `Developer: Dev Trivedi\n\nGitHub: https://github.com/IamDevTrivedi/\nLinkedIn: https://www.linkedin.com/in/contact-devtrivedi/\nPortfolio: https://www.dev-trivedi.me/`
                );
            });

            // /feedback: Collect user feedback handler
            bot.command("feedback", (ctx) => {
                ctx.reply("Please reply to this message with your valued feedback", {
                    reply_markup: { force_reply: true },
                });
            });

            // Message handler to capture feedback replies
            bot.on("message", async (ctx, next) => {
                const msg = ctx.message;
                if (
                    "reply_to_message" in msg &&
                    msg.reply_to_message &&
                    "text" in msg.reply_to_message &&
                    msg.reply_to_message.text ===
                    "Please reply to this message with your valued feedback" &&
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
                        await ctx.reply("Thank you for your feedback! 🦕");
                    } catch (error) {
                        logger.error("Failed to save feedback", error);
                        await ctx.reply("Sorry, something went wrong. Please try again later.");
                    }
                    return;
                }
                return next();
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
