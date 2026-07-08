import { prisma } from "@/db/prisma.js";
import { broadcastQueue, QueueNames } from "../../queue/index.js";
import { BROADCAST_BATCH_SIZE } from "../constants.js";
import type { BroadcastAudience } from "../constants.js";

const getBroadcastRecipients = async (audience: BroadcastAudience) => {
    const now = Date.now();
    const twentyFourHoursAgo = BigInt(now - 24 * 60 * 60 * 1000);

    if (audience === "all") {
        return prisma.user.findMany({
            select: { telegramIdEnc: true },
        });
    }

    if (audience === "subscribed") {
        return prisma.user.findMany({
            where: { subscribed: true },
            select: { telegramIdEnc: true },
        });
    }

    return prisma.user.findMany({
        where: {
            subscribed: true,
            lastActive: { gte: twentyFourHoursAgo },
        },
        select: { telegramIdEnc: true },
    });
};

const queueBroadcastInBatches = async (
    telegramIdsEnc: string[],
    message: string
): Promise<void> => {
    for (let index = 0; index < telegramIdsEnc.length; index += BROADCAST_BATCH_SIZE) {
        const batch = telegramIdsEnc.slice(index, index + BROADCAST_BATCH_SIZE);

        await broadcastQueue.addBulk(
            batch.map((telegramIdEnc) => ({
                name: QueueNames.SEND_BROADCAST,
                data: {
                    telegramIdEnc,
                    message,
                },
            }))
        );
    }
};

export { getBroadcastRecipients, queueBroadcastInBatches };
