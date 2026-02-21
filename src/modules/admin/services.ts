import { adminBot } from "@/config/adminBot.js";
import { env } from "@/config/env.js";
import { prisma } from "@/db/prisma.js";
import { logger } from "@/utils/logger.js";
import { broadcastQueue, QueueNames } from "../queue/index.js";

const APP_START_TIME = Date.now();

export const services = {
    prepare: async () => {
        try {
            // Global error handler to prevent crashes
            adminBot.catch((err, ctx) => {
                logger.error(`Admin bot error for update ${ctx.updateType}`, err);
                try {
                    ctx.reply("An unexpected error occurred. Please try again later.");
                } catch {
                    logger.error("Failed to send error message to admin");
                }
            });

            adminBot.use(async (ctx, next) => {
                try {
                    const username = ctx.from?.username;

                    if (!username || !env.ADMINS.includes(username)) {
                        await ctx.reply(
                            "This bot is for authorized administrators only.\n\n" +
                                "If you believe this is an error, please contact the developer."
                        );
                        return;
                    }

                    await next();
                } catch (error) {
                    logger.error("Admin auth middleware error", error);
                    await ctx.reply("Sorry, something went wrong. Please try again later.");
                }
            });

            adminBot.start((ctx) => {
                const name = ctx.from?.first_name || "Admin";
                ctx.reply(
                    `Welcome, ${name}!\n\n` +
                        `This is the Talkasauras Admin Panel Bot.\n\n` +
                        `Available commands:\n` +
                        `  /broadcast   -  Send a message to all users\n` +
                        `  /analytics   -  View bot and app analytics\n` +
                        `  /help        -  Show this help message`
                );
            });

            adminBot.command("help", (ctx) => {
                ctx.reply(
                    `Admin Commands\n` +
                        `========================\n\n` +
                        `/start       -  Welcome message\n` +
                        `/broadcast   -  Broadcast a message to all bot users\n` +
                        `/analytics   -  View bot and app analytics\n` +
                        `/help        -  Display this help message`
                );
            });

            adminBot.command("broadcast", (ctx) => {
                ctx.reply(
                    "Broadcast Message\n" +
                        "========================\n\n" +
                        "Please reply to this message with the text you want to broadcast to all users.",
                    { reply_markup: { force_reply: true } }
                );
            });

            adminBot.on("message", async (ctx, next) => {
                const msg = ctx.message;
                if (
                    "reply_to_message" in msg &&
                    msg.reply_to_message &&
                    "text" in msg.reply_to_message &&
                    msg.reply_to_message.text?.includes(
                        "Please reply to this message with the text you want to broadcast to all users."
                    ) &&
                    msg.reply_to_message.from?.id === ctx.botInfo.id
                ) {
                    const broadcastText = "text" in msg ? msg.text : null;
                    if (!broadcastText) {
                        await ctx.reply("Please send the broadcast message as text.");
                        return;
                    }

                    try {
                        const users = await prisma.user.findMany({
                            select: {
                                telegramIdEnc: true,
                            },
                        });

                        if (users.length === 0) {
                            await ctx.reply("No users found to broadcast to.");
                            return;
                        }

                        for (const user of users) {
                            await broadcastQueue.add(QueueNames.SEND_BROADCAST, {
                                telegramIdEnc: user.telegramIdEnc!,
                                message: broadcastText,
                            });
                        }

                        await ctx.reply(
                            `Broadcast Queued\n` +
                                `========================\n\n` +
                                `Message: ${broadcastText}\n\n` +
                                `${users.length} user(s) will be notified.`
                        );

                        logger.info(
                            `Broadcast queued by admin @${ctx.from?.username} for ${users.length} users`
                        );
                    } catch (error) {
                        logger.error("Failed to queue broadcast", error);
                        await ctx.reply(
                            "Sorry, something went wrong while queuing the broadcast. Please try again."
                        );
                    }
                    return;
                }

                return next();
            });

            adminBot.command("analytics", async (ctx) => {
                try {
                    const now = Date.now();
                    const threeHoursAgo = BigInt(now - 3 * 60 * 60 * 1000);
                    const twentyFourHoursAgo = BigInt(now - 24 * 60 * 60 * 1000);

                    const [
                        totalUsers,
                        activeUsers3h,
                        activeUsers24h,
                        totalMessages,
                        totalFeedback,
                        pendingReminders,
                    ] = await Promise.all([
                        prisma.user.count(),
                        prisma.user.count({
                            where: { lastActive: { gte: threeHoursAgo } },
                        }),
                        prisma.user.count({
                            where: { lastActive: { gte: twentyFourHoursAgo } },
                        }),
                        prisma.message.count(),
                        prisma.feedback.count(),
                        prisma.reminder.count({
                            where: { executed: false },
                        }),
                    ]);

                    const uptimeMs = now - APP_START_TIME;
                    const uptimeDays = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
                    const uptimeHours = Math.floor(
                        (uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                    );
                    const uptimeMinutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));

                    const processUptimeSec = process.uptime();
                    const procDays = Math.floor(processUptimeSec / 86400);
                    const procHours = Math.floor((processUptimeSec % 86400) / 3600);
                    const procMinutes = Math.floor((processUptimeSec % 3600) / 60);

                    await ctx.reply(
                        `Bot Analytics\n` +
                            `========================\n\n` +
                            `Users\n` +
                            `  Total users: ${totalUsers}\n` +
                            `  Active (last 3 hours): ${activeUsers3h}\n` +
                            `  Active (last 24 hours): ${activeUsers24h}\n\n` +
                            `Activity\n` +
                            `  Total messages stored: ${totalMessages}\n` +
                            `  Total feedback received: ${totalFeedback}\n` +
                            `  Pending reminders: ${pendingReminders}\n\n` +
                            `App\n` +
                            `  App uptime: ${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m\n` +
                            `  Process uptime: ${procDays}d ${procHours}h ${procMinutes}m\n` +
                            `  Environment: ${env.NODE_ENV}\n` +
                            `  Ollama provider: ${env.OLLAMA.PROVIDER}`
                    );
                } catch (error) {
                    logger.error("Failed to fetch analytics", error);
                    await ctx.reply(
                        "Sorry, something went wrong while fetching analytics. Please try again."
                    );
                }
            });
        } catch (error) {
            logger.error("Failed to prepare admin bot", error);
            process.exit(1);
        }
    },

    launch: () => {
        try {
            adminBot.launch();
        } catch (error) {
            logger.error("Failed to launch admin bot", error);
            process.exit(1);
        }
    },
};
