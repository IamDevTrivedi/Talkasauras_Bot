import { adminBot } from "../botInstance.js";
import { logger } from "@/utils/logger.js";
import { env } from "@/config/env.js";
import { APP_START_TIME } from "../constants.js";
import { formatDuration } from "../utils.js";
import { fetchAnalytics } from "../services/analytics.js";

const registerAnalytics = () => {
    adminBot.command("analytics", async (ctx) => {
        try {
            const data = await fetchAnalytics();

            const now = Date.now();
            const appUptime = formatDuration(now - APP_START_TIME);
            const processUptime = formatDuration(process.uptime() * 1000);
            const subscribedPercentage =
                data.totalUsers > 0
                    ? ((data.subscribedUsers / data.totalUsers) * 100).toFixed(1)
                    : "0.0";

            await ctx.reply(
                `Bot Analytics\n` +
                    `========================\n\n` +
                    `Users\n` +
                    `  Total users: ${data.totalUsers}\n` +
                    `  Subscribed users: ${data.subscribedUsers} (${subscribedPercentage}%)\n` +
                    `  New users (24h): ${data.newUsers24h}\n` +
                    `  New users (7d): ${data.newUsers7d}\n` +
                    `  Active (last 3 hours): ${data.activeUsers3h}\n` +
                    `  Active (last 24 hours): ${data.activeUsers24h}\n` +
                    `  Temporary mode enabled: ${data.temporaryModeUsers}\n` +
                    `  Custom instructions set: ${data.usersWithCustomInstructions}\n\n` +
                    `Content\n` +
                    `  Total messages stored: ${data.totalMessages}\n` +
                    `  Total feedback received: ${data.totalFeedback}\n` +
                    `  Unreviewed feedback: ${data.unreviewedFeedback}\n\n` +
                    `Reminders\n` +
                    `  Pending reminders: ${data.pendingReminders}\n` +
                    `  Overdue reminders: ${data.dueReminders}\n\n` +
                    `Broadcast Queue\n` +
                    `  Waiting: ${data.broadcastCounts.waiting ?? 0}\n` +
                    `  Active: ${data.broadcastCounts.active ?? 0}\n` +
                    `  Delayed: ${data.broadcastCounts.delayed ?? 0}\n` +
                    `  Failed: ${data.broadcastCounts.failed ?? 0}\n\n` +
                    `Runtime\n` +
                    `  App uptime: ${appUptime}\n` +
                    `  Process uptime: ${processUptime}\n` +
                    `  Environment: ${env.NODE_ENV}\n` +
                    `  Ollama host: ${env.OLLAMA.HOST}`
            );
        } catch (error) {
            logger.error("Failed to fetch analytics", error);
            await ctx.reply(
                "Sorry, something went wrong while fetching analytics. Please try again."
            );
        }
    });
};

export { registerAnalytics };
