import { bot } from "../botInstance.js";
import { env } from "@/config/env.js";
import { prisma } from "@/db/prisma.js";
import { encrypt } from "@/utils/crypto.js";
import { logger } from "@/utils/logger.js";
import { createReminder } from "../services/reminder.js";
import * as chrono from "chrono-node";

const registerRemindMe = () => {
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
                    await ctx.reply("Something went wrong. Please start over with /remindme.");
                    return;
                }

                const scheduledDate = new Date(isoMatch[1]);

                if (isNaN(scheduledDate.getTime())) {
                    await ctx.reply("Something went wrong. Please start over with /remindme.");
                    return;
                }

                const delay = scheduledDate.getTime() - Date.now();

                if (delay <= 0) {
                    await ctx.reply(
                        "That time has already passed. Please start over with /remindme."
                    );
                    return;
                }

                const telegramIdHash = ctx.state.telegramIdHash as string;

                const user = await prisma.user.findUnique({
                    where: { telegramIdHash },
                });

                if (!user) {
                    await ctx.reply("Sorry, something went wrong. Please try again later.");
                    return;
                }

                const { id } = ctx.from!;

                const telegramIdEnc = encrypt({
                    key: env.KEYS.SECRET_KEY_2,
                    data: id.toString(),
                });

                try {
                    await createReminder(telegramIdHash, telegramIdEnc, noteText, scheduledDate);

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
};

export { registerRemindMe };
