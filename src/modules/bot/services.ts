import { bot } from "@/config/bot.js";
import { env } from "@/config/env.js";
import { prisma } from "@/db/prisma.js";
import { redisClient } from "@/db/redis.js";
import { decrypt, encrypt, HMAC } from "@/utils/crypto.js";
import { logger } from "@/utils/logger.js";
import { lastActivityQueue, reminderQueue, QueueNames } from "../queue/index.js";
import { Markup } from "telegraf";
import { WritingStyle } from "@prisma/client";
import { TEMPORARY_MSG_TIMEOUT, RATE_LIMIT_WINDOW, RATE_LIMIT_MAX } from "@/constants/app.js";
import { ollama } from "@/config/ollama.js";
import { buildSystemPrompt } from "@/utils/genPrompt.js";
import * as chrono from "chrono-node";

export const services = {
    prepare: async () => {
        try {
            // Global error handler to prevent crashes
            bot.catch((err, ctx) => {
                logger.error(`Bot error for update ${ctx.updateType}`, err);
                try {
                    ctx.reply("An unexpected error occurred. Please try again later.");
                } catch {
                    // If even the error reply fails, just log it
                    logger.error("Failed to send error message to user");
                }
            });

            // Middleware to identify user and set telegramIdHash in context state
            bot.use(async (ctx, next) => {
                try {
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

                    const telegramIdEnc = encrypt({
                        data: id.toString(),
                        key: env.KEYS.SECRET_KEY_2,
                    });

                    ctx.state.telegramIdHash = telegramIdHash;
                    ctx.state.telegramIdEnc = telegramIdEnc;
                    ctx.sendChatAction("typing");
                    await next();
                } catch (error) {
                    logger.error("Failed to identify user", error);
                    await ctx.reply("Sorry, something went wrong. Please try again later.");
                }
            });

            // Middleware to create user in the DB
            bot.use(async (ctx, next) => {
                try {
                    const telegramIdHash = ctx.state.telegramIdHash as string;
                    const telegramIdEnc = ctx.state.telegramIdEnc as string;

                    const exists = await redisClient.exists(`user:${telegramIdHash}`);

                    if (!exists) {
                        const existingUser = await prisma.user.findUnique({
                            where: { telegramIdHash },
                        });

                        if (!existingUser) {
                            await prisma.user.create({
                                data: {
                                    telegramIdHash,
                                    telegramIdEnc,
                                    createdAt: BigInt(Date.now()),
                                    lastActive: BigInt(Date.now()),
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
                } catch (error) {
                    logger.error("Failed to create/verify user", error);
                    await ctx.reply("Sorry, something went wrong. Please try again later.");
                }
            });

            // /start:
            bot.start((ctx) => {
                const name = ctx.from?.first_name || "there";
                ctx.reply(
                    `Welcome, ${name}!\n\n` +
                    `I am Talkasauras Bot, your AI-powered chat companion on Telegram. ` +
                    `I can carry on natural conversations, remember context, and adapt to your preferred style.\n\n` +
                    `Feel free to type anything to begin chatting, or send /help to explore all available commands.`
                );
            });

            // /about:
            bot.command("about", (ctx) => {
                ctx.reply(
                    `About Talkasauras Bot\n` +
                    `========================\n\n` +
                    `Talkasauras Bot is an AI-powered Telegram chatbot designed to hold natural, ` +
                    `meaningful conversations. It supports multiple writing styles, custom instructions, ` +
                    `temporary chat modes, and scheduled reminders.\n\n` +
                    `Built with care by Dev Trivedi.`
                );
            });

            // /help:
            bot.command("help", (ctx) => {
                ctx.reply(
                    `Available Commands\n\n` +
                    `/start - Start the bot and receive a welcome message\n` +
                    `/about - Learn more about Talkasauras Bot\n` +
                    `/help - Display this list of commands\n` +
                    `/contact - View the developer's contact details\n` +
                    `/feedback - Share your valued feedback\n` +
                    `/remindme - Schedule a reminder for a future date and time\n` +
                    `/clear - Clear your entire conversation history\n` +
                    `/current_mode - Check your current chat mode\n` +
                    `/temporary_on - Enable temporary chat mode\n` +
                    `/temporary_off - Disable temporary mode and delete temp messages\n` +
                    `/custom_instructions - Set personalized instructions for the bot\n` +
                    `/clear_instructions - Clear your custom instructions\n` +
                    `/writing_style - Choose your preferred writing style\n\n` +
                    `You can also simply send me any message and I will respond right away.`
                );
            });

            // /contact:
            bot.command("contact", (ctx) => {
                ctx.reply(
                    `Developer Contact Information\n\n` +
                    `Name: Dev Trivedi\n` +
                    `GitHub: https://github.com/IamDevTrivedi/\n` +
                    `LinkedIn: https://www.linkedin.com/in/contact-devtrivedi/\n` +
                    `Portfolio: https://www.dev-trivedi.me/`
                );
            });

            // /feedback:
            bot.command("feedback", (ctx) => {
                ctx.reply(
                    "Your feedback matters to us and helps improve the bot.\n\n" +
                    "Please reply to this message with your valued feedback.",
                    { reply_markup: { force_reply: true } }
                );
            });

            // /clear:
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

            // /current_mode:
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
                    await ctx.reply(
                        "Sorry, I couldn't fetch your current mode. Please try again later."
                    );
                    return;
                }
            });

            // /temporary_on:
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
                    await ctx.reply(
                        "Sorry, I couldn't enable Temporary Mode. Please try again later."
                    );
                }
            });

            // /temporary_off:
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
                    await ctx.reply(
                        "Sorry, I couldn't disable Temporary Mode. Please try again later."
                    );
                }
            });

            // /remindme:
            bot.command("remindme", async (ctx) => {
                ctx.reply(
                    "Let's set up a reminder for you.\n\n" +
                    "Please reply to this message with the date and time for your reminder.\n\n" +
                    "Examples of accepted formats:\n" +
                    "  - tomorrow at 3pm\n" +
                    "  - March 5 at 10:00\n" +
                    "  - in 2 hours\n" +
                    "  - next Friday at noon",
                    { reply_markup: { force_reply: true } }
                );
            });

            // /clear_instructions:
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

            // /custom_instructions:
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

            // /writing_style:
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

            // Callback handler for writing style selection
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
                    await ctx.editMessageText(
                        `Writing style updated to: ${writingStyleLabels[style]}`
                    );
                } catch (error) {
                    logger.error("Failed to update writing style", error);
                    await ctx.answerCbQuery("Something went wrong. Please try again.");
                }
            });

            // Parsing replies for reminder setup: Part 1
            bot.on("message", async (ctx, next) => {
                try {
                    const msg = ctx.message;
                    if (
                        "reply_to_message" in msg &&
                        msg.reply_to_message &&
                        "text" in msg.reply_to_message &&
                        msg.reply_to_message.text?.includes(
                            "Please reply to this message with the date and time for your reminder"
                        ) &&
                        msg.reply_to_message.from?.id === ctx.botInfo.id
                    ) {
                        const dateText = "text" in msg ? msg.text : null;
                        if (!dateText) {
                            await ctx.reply("Please send the date and time as a text message.");
                            return;
                        }

                        const parsedDate = chrono.parseDate(dateText, new Date(), {
                            forwardDate: true,
                        });

                        if (!parsedDate) {
                            await ctx.reply(
                                "I couldn't understand that date/time. Please try again with something like " +
                                '"tomorrow at 3pm" or "March 5 at 10:00".'
                            );
                            return;
                        }

                        if (parsedDate.getTime() <= Date.now()) {
                            await ctx.reply(
                                "That time has already passed. Please provide a future date and time."
                            );
                            return;
                        }

                        const formattedPreview = parsedDate.toLocaleString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        });

                        await ctx.reply(
                            `Date and time accepted: ${formattedPreview}\n\n` +
                            "Now, please reply to this message with the note for your reminder.\n\n" +
                            `Scheduled for: ${parsedDate.toISOString()}`,
                            { reply_markup: { force_reply: true } }
                        );
                        return;
                    }
                    return next();
                } catch (error) {
                    logger.error("Failed to process reminder date", error);
                    await ctx.reply("Sorry, something went wrong. Please try again later.");
                }
            });

            // Parsing replies for reminder setup: Part 2
            bot.on("message", async (ctx, next) => {
                try {
                    const msg = ctx.message;
                    if (
                        "reply_to_message" in msg &&
                        msg.reply_to_message &&
                        "text" in msg.reply_to_message &&
                        msg.reply_to_message.text?.includes(
                            "Now, please reply to this message with the note for your reminder."
                        ) &&
                        msg.reply_to_message.from?.id === ctx.botInfo.id
                    ) {
                        const noteText = "text" in msg ? msg.text : null;
                        if (!noteText) {
                            await ctx.reply("Please send your reminder note as a text message.");
                            return;
                        }

                        const replyText = msg.reply_to_message.text!;
                        const isoMatch = replyText.match(/Scheduled for: (.+)$/);
                        if (!isoMatch) {
                            await ctx.reply(
                                "Something went wrong. Please start over with /remindme."
                            );
                            return;
                        }

                        const scheduledDate = new Date(isoMatch[1]);
                        if (isNaN(scheduledDate.getTime())) {
                            await ctx.reply(
                                "Something went wrong. Please start over with /remindme."
                            );
                            return;
                        }

                        const delay = scheduledDate.getTime() - Date.now();
                        if (delay <= 0) {
                            await ctx.reply(
                                "That time has already passed. Please start over with /remindme."
                            );
                            return;
                        }

                        const { id } = ctx.from!;
                        const telegramIdHash = ctx.state.telegramIdHash as string;

                        const user = await prisma.user.findUnique({
                            where: { telegramIdHash },
                        });

                        if (!user) {
                            await ctx.reply("Sorry, something went wrong. Please try again later.");
                            return;
                        }

                        const telegramIdEnc = encrypt({
                            key: env.KEYS.SECRET_KEY_2,
                            data: id.toString(),
                        });

                        const encryptedMessage = encrypt({
                            key: env.KEYS.SECRET_KEY_2,
                            data: noteText,
                        });

                        try {
                            const reminder = await prisma.reminder.create({
                                data: {
                                    telegramIdEnc: telegramIdEnc,
                                    message: encryptedMessage,
                                    remindAt: BigInt(scheduledDate.getTime()),
                                    createdAt: BigInt(Date.now()),
                                },
                            });

                            await reminderQueue.add(
                                QueueNames.SEND_REMINDER,
                                { reminderId: reminder.id },
                                { delay }
                            );

                            const formattedDate = scheduledDate.toLocaleString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            });

                            await ctx.reply(
                                `Reminder Confirmed\n\n` +
                                `Scheduled: ${formattedDate}\n` +
                                `Note: ${noteText}\n\n` +
                                `I will send you a message at the scheduled time with your note.`
                            );
                        } catch (error) {
                            logger.error("Failed to create reminder", error);
                            await ctx.reply(
                                "Sorry, something went wrong while setting your reminder. Please try again later."
                            );
                        }
                        return;
                    }
                    return next();
                } catch (error) {
                    logger.error("Failed to process reminder note", error);
                    await ctx.reply("Sorry, something went wrong. Please try again later.");
                }
            });

            // Parsing replies for feedback:
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

            // Parsing replies for custom instructions:
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
                            await ctx.reply(
                                "Please send your custom instructions as a text message."
                            );
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

            // Rate limiting middleware for AI responses only
            bot.use(async (ctx, next) => {
                try {
                    const telegramIdHash = ctx.state.telegramIdHash as string;
                    const rateLimitKey = `ratelimit:${telegramIdHash}`;

                    const current = await redisClient.incr(rateLimitKey);
                    if (current === 1) {
                        await redisClient.expire(rateLimitKey, RATE_LIMIT_WINDOW);
                    }

                    if (current > RATE_LIMIT_MAX) {
                        await ctx.reply(
                            "You're sending messages too quickly. Please wait a moment before trying again."
                        );
                        return;
                    }

                    return next();
                } catch (error) {
                    logger.error("Rate limiting error", error);
                    return next();
                }
            });

            // Image handler for chatting with the bot using photos
            bot.on("photo", async (ctx) => {
                try {
                    const telegramIdHash = ctx.state.telegramIdHash as string;

                    const caption = ctx.message.caption || "Asked with image";

                    const photo = ctx.message.photo;
                    const fileId = photo[photo.length - 1].file_id;

                    const fileLink = await ctx.telegram.getFileLink(fileId);
                    const imageResponse = await fetch(fileLink.href);
                    const arrayBuffer = await imageResponse.arrayBuffer();
                    const base64Image = Buffer.from(arrayBuffer).toString("base64");

                    const user = await prisma.user.findUnique({
                        where: { telegramIdHash },
                    });

                    if (!user) {
                        await ctx.reply("Sorry, something went wrong. Please try again later.");
                        return;
                    }

                    let isActualTemporary = false;
                    if (user.temporaryOn) {
                        if (Date.now() - Number(user.lastActive) <= TEMPORARY_MSG_TIMEOUT) {
                            isActualTemporary = true;
                        }
                    }

                    const prevMsgs = await prisma.message.findMany({
                        where: {
                            telegramIdHash,
                            isTemporary: isActualTemporary,
                        },
                        select: {
                            role: true,
                            content: true,
                        },
                    });

                    const preMsgsDecrypted = prevMsgs.map((msg) => {
                        return {
                            role: msg.role,
                            content: decrypt({
                                data: msg.content,
                                key: env.KEYS.SECRET_KEY_2,
                            }),
                        };
                    });

                    const promptContent = caption || "Describe this image";

                    const systemPrompt = buildSystemPrompt(
                        user.writingStyle,
                        user.customInstructions
                            ? decrypt({
                                data: user.customInstructions,
                                key: env.KEYS.SECRET_KEY_2,
                            })
                            : undefined
                    );

                    const ollamaResponse = await ollama!.chat({
                        model: env.OLLAMA.MODEL_NAME,
                        messages: [
                            { role: "system", content: systemPrompt },
                            ...preMsgsDecrypted,
                            {
                                role: "user",
                                content: promptContent,
                                images: [base64Image],
                            },
                        ],
                    });

                    const AIReply = ollamaResponse.message.content;

                    console.log(AIReply);

                    await prisma.message.create({
                        data: {
                            telegramIdHash,
                            content: encrypt({
                                data: caption,
                                key: env.KEYS.SECRET_KEY_2,
                            }),
                            role: "user",
                            createdAt: BigInt(Date.now()),
                            isTemporary: isActualTemporary,
                        },
                    });

                    await prisma.message.create({
                        data: {
                            telegramIdHash,
                            content: encrypt({
                                data: AIReply,
                                key: env.KEYS.SECRET_KEY_2,
                            }),
                            role: "assistant",
                            createdAt: BigInt(Date.now()),
                            isTemporary: isActualTemporary,
                        },
                    });

                    await ctx.reply(AIReply, {
                        reply_parameters: { message_id: ctx.message.message_id },
                    });
                } catch (error) {
                    logger.error("Failed to process photo message", error);
                    await ctx.reply(
                        "Sorry, something went wrong while processing your image. Please try again later."
                    );
                }
            });

            // Main message handler for chatting with the bot
            bot.on("text", async (ctx) => {
                try {
                    const telegramIdHash = ctx.state.telegramIdHash as string;

                    const { text: newMsg } = ctx.message;

                    const user = await prisma.user.findUnique({
                        where: {
                            telegramIdHash,
                        },
                    });

                    if (!user) {
                        await ctx.reply("Sorry, something went wrong. Please try again later.");
                        return;
                    }

                    let isActualTemporary = false;
                    if (user.temporaryOn) {
                        if (Date.now() - Number(user.lastActive) <= TEMPORARY_MSG_TIMEOUT) {
                            isActualTemporary = true;
                        }
                    }

                    const prevMsgs = await prisma.message.findMany({
                        where: {
                            telegramIdHash,
                            isTemporary: isActualTemporary,
                        },
                        select: {
                            role: true,
                            content: true,
                        },
                    });

                    const preMsgsDecrypted = prevMsgs.map((msg) => {
                        return {
                            role: msg.role,
                            content: decrypt({
                                data: msg.content,
                                key: env.KEYS.SECRET_KEY_2,
                            }),
                        };
                    });

                    preMsgsDecrypted.push({
                        role: "user",
                        content: newMsg,
                    });

                    const systemPrompt = buildSystemPrompt(
                        user.writingStyle,
                        user.customInstructions
                            ? decrypt({
                                data: user.customInstructions,
                                key: env.KEYS.SECRET_KEY_2,
                            })
                            : undefined
                    );

                    const response = await ollama!.chat({
                        model: env.OLLAMA.MODEL_NAME,
                        messages: [{ role: "system", content: systemPrompt }, ...preMsgsDecrypted],
                    });

                    const AIReply = response.message.content;

                    type Part = {
                        role: "user" | "assistant";
                        content: string;
                    };

                    const userPart: Part = {
                        role: "user",
                        content: encrypt({
                            data: newMsg,
                            key: env.KEYS.SECRET_KEY_2,
                        }),
                    };

                    const AIPart: Part = {
                        role: "assistant",
                        content: encrypt({
                            data: AIReply,
                            key: env.KEYS.SECRET_KEY_2,
                        }),
                    };

                    await prisma.message.create({
                        data: {
                            telegramIdHash,
                            content: userPart.content,
                            role: userPart.role,
                            createdAt: BigInt(Date.now()),
                            isTemporary: isActualTemporary,
                        },
                    });

                    await prisma.message.create({
                        data: {
                            content: AIPart.content,
                            createdAt: BigInt(Date.now()),
                            role: AIPart.role,
                            telegramIdHash,
                            isTemporary: isActualTemporary,
                        },
                    });

                    await ctx.reply(AIReply, {
                        reply_parameters: { message_id: ctx.message.message_id },
                    });
                } catch (error) {
                    logger.error("Failed to process text message", error);
                    await ctx.reply(
                        "Sorry, something went wrong while processing your message. Please try again later."
                    );
                }
            });
        } catch (error) {
            logger.error("Failed to prepare bot", error);
            process.exit(1);
        }
    },

    launch: () => {
        try {
            bot.launch();
        } catch (error) {
            logger.error("Failed to launch bot", error);
            process.exit(1);
        }
    },
};
