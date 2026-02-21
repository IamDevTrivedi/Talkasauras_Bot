import { bot } from "@/config/bot.js";
import { env } from "@/config/env.js";
import { decrypt } from "@/utils/crypto.js";
import { logger } from "@/utils/logger.js";
import { Job } from "bullmq";

export interface SendBroadcastJobData {
    telegramIdEnc: string;
    message: string;
}

export const sendBroadcast = async (job: Job<SendBroadcastJobData>) => {
    try {
        const telegramId = decrypt({
            data: job.data.telegramIdEnc,
            key: env.KEYS.SECRET_KEY_2,
        });

        await bot.telegram.sendMessage(telegramId, `${job.data.message}`);
    } catch (error: unknown) {
        logger.error(`Error sending broadcast message:`, error);
        throw error;
    }
};
