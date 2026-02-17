import { bot } from "@/config/bot.js";
import { env } from "@/config/env.js";
import { prisma } from "@/db/prisma.js";
import { redisClient } from "@/db/redis.js";
import { generateBytes, generateKey, HMAC } from '@/utils/crypto.js';
import { logger } from "@/utils/logger.js";
import { lastActivityQueue, QueueNames } from "../queue/index.js";
import { Markup } from "telegraf";
import { WritingStyle } from "@prisma/client";

export const services = {
    prepare: async () => {
        try {

            bot.use(async (ctx, next) => {
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

                const nonce = generateBytes({
                    length: 16,
                });

                const encryptionKey = generateKey({
                    masterKey: String(id),
                    secretKey: env.KEYS.SECRET_KEY_2,
                })

                ctx.state.telegramIdHash = telegramIdHash;
                ctx.state.nonce = nonce;
                ctx.state.encryptionKey = encryptionKey;

                await next();
            });


            bot.use(async (ctx, next) => {
                const telegramIdHash = ctx.state.telegramIdHash as string;

                const exists = await redisClient.exists(`user:${telegramIdHash}`);

                if (!exists) {
                    const existingUser = await prisma.user.findUnique({
                        where: { telegramIdHash },
                    });

                    if (!existingUser) {
                        await prisma.user.create({
                            data: {
                                telegramIdHash,
                                createdAt: BigInt(Date.now()),
                                lastActive: BigInt(Date.now()),
                                keyVersion: env.KEYS.VERSION,
                            },
                        });
                    }
                }

                await redisClient.set(`user:${telegramIdHash}`, "1", {
                    EX: 60 * 60 * 3,
                });

                lastActivityQueue.add(QueueNames.UPDATE_LAST_ACTIVITY, {
                    lastActive: Date.now(),
                    telegramIdHash,
                });

                await next();
            });


            bot.use(async (ctx, next) => {
                try {

                    const c = await prisma.user.count({
                        where: {
                            telegramIdHash: ctx.state.telegramIdHash,
                        }
                    });

                    console.log(c);
                    return await next();

                } catch (error) {
                    logger.error("Error in message handling", error);
                    await ctx.reply(
                        "Sorry, something went wrong while processing your message. Please try again later."
                    );
                }
            });


            bot.start((ctx) => {
                const name = ctx.from?.first_name || "there";
                ctx.reply(
                    `Hey ${name}!\n\nI'm Talkasauras Bot — your AI-powered chat companion on Telegram.\n\nType anything to start a conversation, or use /help to see what I can do!`
                );
            });


            bot.command("about", (ctx) => {
                ctx.reply(
                    `Talkasauras Bot\n\nAn AI-powered Telegram bot that lets you have natural conversations. Built with love by Dev Trivedi.`
                );
            });


            bot.command("help", (ctx) => {
                ctx.reply(
                    `Available Commands\n\n/start — Start the bot & get a welcome message\n/about — Learn more about Talkasauras Bot\n/help — Show this list of commands\n/contact — Developer's contact details\n/feedback — Share your feedback with us\n\nOr just send me any message and I'll chat with you!`
                );
            });


            bot.command("contact", (ctx) => {
                ctx.reply(
                    `Developer: Dev Trivedi\n\nGitHub: https://github.com/IamDevTrivedi/\nLinkedIn: https://www.linkedin.com/in/contact-devtrivedi/\nPortfolio: https://www.dev-trivedi.me/`
                );
            });


            bot.command("feedback", (ctx) => {
                ctx.reply("Please reply to this message with your valued feedback", {
                    reply_markup: { force_reply: true },
                });
            });


            bot.command("clear", async (ctx) => {
                const telegramIdHash = ctx.state.telegramIdHash as string;

                try {
                    await prisma.message.deleteMany({
                        where: { telegramIdHash },
                    });
                    await ctx.reply("Your conversation history has been cleared.");
                } catch (error) {
                    logger.error("Failed to clear conversation history", error);
                    await ctx.reply(
                        "Sorry, I couldn't clear your conversation history. Please try again later."
                    );
                }
            });


            bot.command("current_mode", async (ctx) => {
                const telegramIdHash = ctx.state.telegramIdHash as string;

                try {
                    const user = await prisma.user.findUnique({
                        where: { telegramIdHash },
                    });

                    await ctx.reply(
                        `Your current bot is set to: ${user!.temporaryOn ? "Temporary Mode" : "Default Mode"}\n\n` +
                        `To change the current mode:\n` +
                        `/temporary_off - Switch back to Default Mode\n` +
                        `/temporary_on - Switch to Temporary Mode (resets after 10 minutes of inactivity)`
                    );
                } catch (error) {
                    logger.error("Failed to fetch user for current_mode command", error);
                    await ctx.reply(
                        "Sorry, I couldn't fetch your current mode. Please try again later."
                    );
                    return;
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
                        "Temporary Mode is now ON.\n\n" +
                        "New messages will be marked as temporary and automatically deleted when you switch back to Default Mode or 10 minutes of inactivity.\n\n" +
                        "Use /temporary_off to switch back."
                    );
                } catch (error) {
                    logger.error("Failed to enable temporary mode", error);
                    await ctx.reply(
                        "Sorry, I couldn't enable Temporary Mode. Please try again later."
                    );
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
                        "Temporary Mode is now OFF.\n\n" +
                        "All temporary messages have been deleted. You are now back to Default Mode.\n\n" +
                        "Use /temporary_on to switch to Temporary Mode again."
                    );
                } catch (error) {
                    logger.error("Failed to disable temporary mode", error);
                    await ctx.reply(
                        "Sorry, I couldn't disable Temporary Mode. Please try again later."
                    );
                }
            });


            bot.command("custom_instructions", async (ctx) => {
                ctx.reply(
                    "Please reply to this message with your custom instructions for the bot.\n\n" +
                    "These instructions will personalize how I respond to you. " +
                    'For example: "Always respond in bullet points" or "Explain things like I\'m a beginner."',
                    { reply_markup: { force_reply: true } }
                );
            });


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


            const writingStyleLabels: Record<WritingStyle, string> = {
                DEFAULT: "Default",
                FORMAL: "Formal",
                DESCRIPTIVE: "Descriptive",
                CONCISE: "Concise",
            };


            bot.action(/^ws:(.+)$/, async (ctx) => {
                const style = ctx.match[1] as WritingStyle;

                if (!Object.values(WritingStyle).includes(style)) {
                    await ctx.answerCbQuery("Invalid writing style.");
                    return;
                }

                const { id } = ctx.from!;
                const telegramIdHash = HMAC({
                    data: id.toString(),
                    key: env.KEYS.SECRET_KEY_1,
                });

                try {
                    await prisma.user.update({
                        where: { telegramIdHash },
                        data: { writingStyle: style },
                    });

                    await ctx.answerCbQuery(`Writing style set to ${writingStyleLabels[style]}!`);
                    await ctx.editMessageText(
                        `Writing style updated to: ${writingStyleLabels[style]}`
                    );
                } catch (error) {
                    logger.error("Failed to update writing style", error);
                    await ctx.answerCbQuery("Something went wrong. Please try again.");
                }
            });


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


            bot.on("message", async (ctx) => {
                const msg = ctx.message;
                if (
                    "reply_to_message" in msg &&
                    msg.reply_to_message &&
                    "text" in msg.reply_to_message &&
                    msg.reply_to_message.text?.startsWith(
                        "Please reply to this message with your custom instructions"
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
                            data: { customInstructions: instructionText },
                        });
                        await ctx.reply("Your custom instructions have been saved! 🦕");
                    } catch (error) {
                        logger.error("Failed to save custom instructions", error);
                        await ctx.reply("Sorry, something went wrong. Please try again later.");
                    }
                    return;
                }
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
