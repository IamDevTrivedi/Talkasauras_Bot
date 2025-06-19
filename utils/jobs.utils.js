import cron from "node-cron";
import Reminder from "../models/reminder.model.js";
import Chat from "../models/chat.model.js";
import logger from "./logger.utils.js";

async function initJobs({ bot }) {
    cron.schedule("* * * * *", async () => {
        const now = new Date();
        const previousMinute = new Date(now.getTime() - 60 * 1000);
        const nextMinute = new Date(now.getTime() + 60 * 1000);

        try {
            const reminders = await Reminder.find({
                sent: false,
                reminderTime: {
                    $lte: now,
                    $gte: previousMinute,
                },
            });

            for (const reminder of reminders) {
                await bot.telegram.sendMessage(reminder.telegramId, reminder.reminderMessage);
                reminder.sent = true;
                await reminder.save();
            }
        } catch (err) {
            logger.error({ message: "Reminder job failed", error: err });
        }
    });

    cron.schedule("* * * * *", async () => {
        const now = new Date();

        let chats;

        try {
            chats = await Chat.find({
                isTemporary: true,
                lastMessageAt: { $lt: new Date(now.getTime() - 5 * 60 * 1000) },
            });
        } catch (error) {
            logger.error({
                message: `Error fetching chats for cleanup: ${error.message}`,
                error,
            });
            return;
        }

        for (let chat of chats) {
            try {
                chat.isTemporary = false;
                chat.temporaryChatHistory = [];

                await chat.save();
            } catch (error) {
                logger.error({
                    message: `Error saving temporary chat cleanup: ${error.message}`,
                    error,
                });
            }
        }
    });
}

export { initJobs };
