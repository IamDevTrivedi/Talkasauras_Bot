import { prisma } from "@/db/prisma.js";
import {
    reminderQueue,
    broadcastQueue,
    dailyMsgCreatorQueue,
    dailyMsgSenderQueue,
} from "../../queue/index.js";

const fetchStatus = async () => {
    const [
        totalUsers,
        totalMessages,
        totalFeedback,
        totalReminders,
        reminderQueueCounts,
        broadcastQueueCounts,
        dailyCreatorQueueCounts,
        dailySenderQueueCounts,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.message.count(),
        prisma.feedback.count(),
        prisma.reminder.count(),
        reminderQueue.getJobCounts("waiting", "active", "delayed", "failed"),
        broadcastQueue.getJobCounts("waiting", "active", "delayed", "failed"),
        dailyMsgCreatorQueue.getJobCounts("waiting", "active", "delayed", "failed"),
        dailyMsgSenderQueue.getJobCounts("waiting", "active", "delayed", "failed"),
    ]);

    const memoryUsage = process.memoryUsage();

    return {
        totalUsers,
        totalMessages,
        totalFeedback,
        totalReminders,
        reminderQueueCounts,
        broadcastQueueCounts,
        dailyCreatorQueueCounts,
        dailySenderQueueCounts,
        memoryUsage,
    };
};

export { fetchStatus };
