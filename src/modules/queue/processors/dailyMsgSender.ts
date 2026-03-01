import { bot } from "@/config/bot.js";
import { env } from "@/config/env.js";
import { decrypt } from "@/utils/crypto.js";
import { logger } from "@/utils/logger.js";
import { Job } from "bullmq";
import { Markup } from "telegraf";

export interface DailyMsgSenderJobData {
    telegramIdEnc: string;
    message: string;
}

export const dailyMsgSender = async (job: Job<DailyMsgSenderJobData>) => {
    try {
        const telegramId = decrypt({
            data: job.data.telegramIdEnc,
            key: env.KEYS.SECRET_KEY_2,
        });

        await bot.telegram.sendMessage(
            telegramId,
            `${job.data.message}\n`,
            Markup.inlineKeyboard([[Markup.button.callback("Unsubscribe 😓", "daily:unsubscribe")]])
        );
    } catch (error: unknown) {
        logger.error(`Error sending daily message:`, error);
        throw error;
    }
};
