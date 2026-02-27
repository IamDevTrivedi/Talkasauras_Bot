import { prisma } from "@/db/prisma.js";
import { logger } from "@/utils/logger.js";
import { Job } from "bullmq";

export interface UpdateLastActivityJobData {
    telegramIdHash: string;
    lastActive: number;
}

export const updateLastActivity = async (job: Job<UpdateLastActivityJobData>) => {
    try {
        await prisma.user.updateMany({
            where: {
                telegramIdHash: job.data.telegramIdHash,
            },
            data: {
                lastActive: BigInt(job.data.lastActive),
            },
        });
    } catch (error) {
        logger.error("Error updating last activity:", error);
    }
};
