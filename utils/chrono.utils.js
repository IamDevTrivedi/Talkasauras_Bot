import * as chrono from "chrono-node";
import Reminder from "../models/reminder.model.js";

async function handleReminder(ctx) {
    const input = ctx.message.text;
    const results = chrono.parse(input);

    if (results.length > 0) {
        const result = results[0];

        const time = result.start.date();
        const roundedTime = roundToNearestMinute(time);

        const matchedText = result.text;
        const rawMessage = input.replace(matchedText, "").trim();

        const replyMessage = basicReplyFormatter(rawMessage);

        const prefixPattern = /okay[, ]*i (?:will|shall)? ?remind you to /i;
        const reminderMessage =
            "Reminder to " +
            replyMessage
                .replace(prefixPattern, "")
                .trim()
                .replace(/^./, (s) => s.toLowerCase());

        await ctx.reply(
            `⏰ Reminder Set!\n\n` +
                `🕒 Scheduled Time: ${roundedTime}\n\n` +
                `📩 Reminder Message:\n${reminderMessage}`
        );

        const newReminder = await new Reminder({
            telegramId: ctx.from.id,
            reminderMessage: reminderMessage,
            reminderTime: new Date(roundedTime),
        });

        await newReminder.save();
    } else {
        await ctx.reply("No time or Date found in this message.", {
            reply_to_message_id: ctx.message.message_id,
        });
    }
}

function basicReplyFormatter(rawMessage) {
    let cleaned = rawMessage
        .replace(/^can you remind me to /i, "")
        .replace(/^please remind me to /i, "")
        .replace(/^can you remind me /i, "")
        .replace(/^please remind me /i, "")
        .replace(/^remind me to /i, "")
        .replace(/^remind me /i, "")
        .trim();

    cleaned = cleaned
        .split(" ")
        .filter((part) => part.length !== 0)
        .join(" ");

    return `Okay, I will remind you to ${cleaned}`;
}

function roundToNearestMinute(date) {
    const d = new Date(date);
    d.setSeconds(0);
    d.setMilliseconds(0);
    return d;
}

export { handleReminder };
