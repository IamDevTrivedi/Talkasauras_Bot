import cron from "node-cron";
import Reminder from "../models/reminder.model.js";

async function initJobs(bot) {
    let count = 1;

    cron.schedule("* * * * *", async () => {
        const now = new Date();
        const previousMinute = new Date(now.getTime() - 60 * 1000);
        const nextMinute = new Date(now.getTime() + 60 * 1000);

        try {
            const reminders = await Reminder.find({
                sent: false,
                reminderTime: {
                    $lte: nextMinute,
                    $gte: previousMinute,
                },
            });

            console.log(reminders.length);

            for (const reminder of reminders) {
                await bot.telegram.sendMessage(reminder.telegramId, reminder.reminderMessage);
                reminder.sent = true;
                await reminder.save();
            }
        } catch (err) {
            console.error("Reminder job failed:", err);
        }

        console.log(count++);
    });
}

export { initJobs };
