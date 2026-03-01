import { env } from "@/config/env.js";
import { ollama } from "@/config/ollama.js";
import { prisma } from "@/db/prisma.js";
import { DAILY_MSG_INACTIVITY_THRESHOLD, DAILY_MSG_PROMPT } from "@/constants/app.js";
import { logger } from "@/utils/logger.js";
import { Job } from "bullmq";
import { dailyMsgSenderQueue, QueueNames } from "../queues.js";

export type DailyMsgCreatorJobData = Record<string, never>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const dailyMsgCreator = async (_job: Job<DailyMsgCreatorJobData>): Promise<void> => {
    try {
        const ollamaResponse = await ollama!.chat({
            model: env.OLLAMA.MODEL_NAME,
            messages: [
                {
                    role: "system",
                    content: DAILY_MSG_PROMPT,
                },
                {
                    role: "user",
                    content: "Generate today's daily engagement message.",
                },
            ],
        });

        const dailyMessage = ollamaResponse.message.content;

        if (!dailyMessage || dailyMessage.trim().length === 0) {
            logger.error("Daily message generation returned empty content");
            return;
        }

        const inactivityThreshold = BigInt(Date.now() - DAILY_MSG_INACTIVITY_THRESHOLD);

        const targetUsers = await prisma.user.findMany({
            where: {
                subscribed: true,
                lastActive: {
                    lt: inactivityThreshold,
                },
            },
            select: {
                telegramIdEnc: true,
            },
        });

        logger.info(
            `Daily message created. Targeting ${targetUsers.length} inactive subscribed users.`
        );
        logger.info(`Daily message content: ${dailyMessage}`);

        for (const user of targetUsers) {
            await dailyMsgSenderQueue.add(QueueNames.DAILY_MSG_SENDER, {
                telegramIdEnc: user.telegramIdEnc,
                message: dailyMessage,
            });
        }

        logger.info(`Enqueued ${targetUsers.length} daily message send jobs.`);
    } catch (error) {
        logger.error("Error in daily message creator:", error);
        throw error;
    }
};
