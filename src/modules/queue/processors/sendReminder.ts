import { bot } from "@/config/bot.js";
import { env } from "@/config/env.js";
import { prisma } from "@/db/prisma.js";
import { decrypt } from "@/utils/crypto.js";
import { logger } from "@/utils/logger.js";
import { Job } from "bullmq";

export interface SendReminderJobData {
    reminderId: number;
}

export const sendReminder = async (job: Job<SendReminderJobData>) => {
    try {
        const reminder = await prisma.reminder.findUnique({
            where: { id: job.data.reminderId },
        });

        if (!reminder) {
            logger.warn(`Reminder ${job.data.reminderId} not found, skipping`);
            return;
        }

        if (reminder.executed) {
            logger.info(`Reminder ${job.data.reminderId} already executed, skipping`);
            return;
        }

        const telegramId = decrypt({
            data: reminder.telegramIdEnc,
            key: env.KEYS.SECRET_KEY_2[reminder.keyVersion],
        });

        const message = decrypt({
            data: reminder.message,
            key: env.KEYS.SECRET_KEY_2[reminder.keyVersion],
        });

        await bot.telegram.sendMessage(
            telegramId,
            `Reminder Notification\n` +
            `========================\n\n` +
            `${message}\n\n` +
            `This is an automated reminder you scheduled earlier via /remindme.`
        );

        await prisma.reminder.update({
            where: { id: reminder.id },
            data: { executed: true },
        });

        logger.info(`Reminder ${reminder.id} sent successfully to user`);
    } catch (error) {
        logger.error(`Error processing reminder ${job.data.reminderId}:`, error);
        throw error;
    }
};
