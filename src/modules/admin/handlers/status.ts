import { adminBot } from "../botInstance.js";
import { logger } from "@/utils/logger.js";
import { formatDuration, formatBytes } from "../utils.js";
import { fetchStatus } from "../services/status.js";

const registerStatus = () => {
    adminBot.command("status", async (ctx) => {
        try {
            const data = await fetchStatus();

            await ctx.reply(
                `System Status\n` +
                    `========================\n\n` +
                    `Database Counters\n` +
                    `  Users: ${data.totalUsers}\n` +
                    `  Messages: ${data.totalMessages}\n` +
                    `  Feedback: ${data.totalFeedback}\n` +
                    `  Reminders: ${data.totalReminders}\n\n` +
                    `Queues\n` +
                    `  Reminder -> W:${data.reminderQueueCounts.waiting ?? 0} ` +
                    `A:${data.reminderQueueCounts.active ?? 0} ` +
                    `D:${data.reminderQueueCounts.delayed ?? 0} ` +
                    `F:${data.reminderQueueCounts.failed ?? 0}\n` +
                    `  Broadcast -> W:${data.broadcastQueueCounts.waiting ?? 0} ` +
                    `A:${data.broadcastQueueCounts.active ?? 0} ` +
                    `D:${data.broadcastQueueCounts.delayed ?? 0} ` +
                    `F:${data.broadcastQueueCounts.failed ?? 0}\n` +
                    `  Daily Creator -> W:${data.dailyCreatorQueueCounts.waiting ?? 0} ` +
                    `A:${data.dailyCreatorQueueCounts.active ?? 0} ` +
                    `D:${data.dailyCreatorQueueCounts.delayed ?? 0} ` +
                    `F:${data.dailyCreatorQueueCounts.failed ?? 0}\n` +
                    `  Daily Sender -> W:${data.dailySenderQueueCounts.waiting ?? 0} ` +
                    `A:${data.dailySenderQueueCounts.active ?? 0} ` +
                    `D:${data.dailySenderQueueCounts.delayed ?? 0} ` +
                    `F:${data.dailySenderQueueCounts.failed ?? 0}\n\n` +
                    `Process\n` +
                    `  Uptime: ${formatDuration(process.uptime() * 1000)}\n` +
                    `  RSS: ${formatBytes(data.memoryUsage.rss)}\n` +
                    `  Heap used: ${formatBytes(data.memoryUsage.heapUsed)} / ${formatBytes(data.memoryUsage.heapTotal)}\n` +
                    `  External: ${formatBytes(data.memoryUsage.external)}`
            );
        } catch (error) {
            logger.error("Failed to fetch status", error);
            await ctx.reply("Sorry, something went wrong while fetching status. Please try again.");
        }
    });
};

export { registerStatus };
