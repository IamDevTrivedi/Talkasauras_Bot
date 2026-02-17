import { bot } from "@/config/bot.js";
import { env } from "@/config/env.js";
import { prisma } from "@/db/prisma.js";
import { decrypt, generateKey } from "@/utils/crypto.js";
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

        const encryptionKey = generateKey({
            secretKey: env.KEYS.SECRET_KEY_2[reminder.keyVersion],
            masterKey: "reminder",
        });

        const telegramId = decrypt({
            data: reminder.telegramId,
            nonce: reminder.telegramIdNonce,
            key: encryptionKey,
        });

        const message = decrypt({
            data: reminder.message,
            nonce: reminder.messageNonce,
            key: encryptionKey,
        });

        await bot.telegram.sendMessage(telegramId, `⏰ Reminder:\n\n${message}`);

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
