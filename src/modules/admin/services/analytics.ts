import { prisma } from "@/db/prisma.js";
import { broadcastQueue } from "../../queue/index.js";

const fetchAnalytics = async () => {
    const now = Date.now();
    const threeHoursAgo = BigInt(now - 3 * 60 * 60 * 1000);
    const twentyFourHoursAgo = BigInt(now - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = BigInt(now - 7 * 24 * 60 * 60 * 1000);

    const [
        totalUsers,
        subscribedUsers,
        activeUsers3h,
        activeUsers24h,
        newUsers24h,
        newUsers7d,
        temporaryModeUsers,
        usersWithCustomInstructions,
        totalMessages,
        totalFeedback,
        unreviewedFeedback,
        pendingReminders,
        dueReminders,
        broadcastCounts,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { subscribed: true } }),
        prisma.user.count({ where: { lastActive: { gte: threeHoursAgo } } }),
        prisma.user.count({ where: { lastActive: { gte: twentyFourHoursAgo } } }),
        prisma.user.count({ where: { createdAt: { gte: twentyFourHoursAgo } } }),
        prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        prisma.user.count({ where: { temporaryOn: true } }),
        prisma.user.count({ where: { customInstructions: { not: null } } }),
        prisma.message.count(),
        prisma.feedback.count(),
        prisma.feedback.count({ where: { reviewed: false } }),
        prisma.reminder.count({ where: { executed: false } }),
        prisma.reminder.count({
            where: {
                executed: false,
                remindAt: { lte: BigInt(now) },
            },
        }),
        broadcastQueue.getJobCounts("waiting", "active", "delayed", "failed"),
    ]);

    return {
        totalUsers,
        subscribedUsers,
        activeUsers3h,
        activeUsers24h,
        newUsers24h,
        newUsers7d,
        temporaryModeUsers,
        usersWithCustomInstructions,
        totalMessages,
        totalFeedback,
        unreviewedFeedback,
        pendingReminders,
        dueReminders,
        broadcastCounts,
    };
};

export { fetchAnalytics };
