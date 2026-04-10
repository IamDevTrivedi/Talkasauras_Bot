import { adminBot } from "@/config/adminBot.js";
import { env } from "@/config/env.js";
import { prisma } from "@/db/prisma.js";
import { logger } from "@/utils/logger.js";
import {
    broadcastQueue,
    dailyMsgCreatorQueue,
    dailyMsgSenderQueue,
    QueueNames,
    reminderQueue,
} from "../queue/index.js";
import { Markup } from "telegraf";

const APP_START_TIME = Date.now();
const MAX_BROADCAST_LENGTH = 4096;
const BROADCAST_BATCH_SIZE = 400;
const DEFAULT_FEEDBACK_LIMIT = 5;
const MAX_FEEDBACK_LIMIT = 20;

type BroadcastAudience = "subscribed" | "all" | "active24h";

type PendingAdminAction = {
    type: "broadcast";
    audience: BroadcastAudience;
    message?: string;
};

const pendingActions = new Map<number, PendingAdminAction>();

const BROADCAST_AUDIENCE_LABELS: Record<BroadcastAudience, string> = {
    subscribed: "Subscribed users",
    all: "All users",
    active24h: "Active users in last 24h (subscribed only)",
};

const normalize = (value: string): string => value.trim().toLowerCase();

const isAuthorizedAdmin = (username?: string, userId?: number): boolean => {
    const normalizedUsername = username ? normalize(username) : null;
    const idAsText = typeof userId === "number" ? userId.toString() : null;

    return env.ADMINS.some((admin) => {
        const normalizedAdmin = normalize(admin);

        if (!normalizedAdmin) {
            return false;
        }

        if (normalizedUsername && normalizedAdmin === normalizedUsername) {
            return true;
        }

        if (idAsText && normalizedAdmin === idAsText) {
            return true;
        }

        return false;
    });
};

const parseBroadcastAudience = (raw?: string): BroadcastAudience | null => {
    if (!raw) {
        return "subscribed";
    }

    const normalized = raw.toLowerCase();

    if (normalized === "subscribed" || normalized === "all" || normalized === "active24h") {
        return normalized;
    }

    return null;
};

const getCommandArgs = (text?: string): string[] => {
    if (!text) {
        return [];
    }

    return text.trim().split(/\s+/).slice(1);
};

const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) {
        return text;
    }

    return `${text.slice(0, maxLength)}...`;
};

const formatDuration = (durationMs: number): string => {
    const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    return `${days}d ${hours}h ${minutes}m`;
};

const formatBytes = (bytes: number): string => {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    const units = ["KB", "MB", "GB", "TB"];
    let value = bytes / 1024;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
    }

    return `${value.toFixed(1)} ${units[unitIndex]}`;
};

const parseFeedbackLimit = (rawLimit?: string): number => {
    if (!rawLimit) {
        return DEFAULT_FEEDBACK_LIMIT;
    }

    const parsed = Number(rawLimit);

    if (!Number.isFinite(parsed) || parsed < 1) {
        return DEFAULT_FEEDBACK_LIMIT;
    }

    return Math.min(Math.floor(parsed), MAX_FEEDBACK_LIMIT);
};

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

export const services = {
    prepare: async () => {
        try {
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
                    const userId = ctx.from?.id;

                    if (!isAuthorizedAdmin(username, userId)) {
                        if (ctx.updateType === "callback_query") {
                            await ctx.answerCbQuery("Unauthorized");
                        }

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
                        `  /broadcast [subscribed|all|active24h] - Start targeted broadcast flow\n` +
                        `  /feedbacks [limit]                    - Review latest unreviewed feedback\n` +
                        `  /analytics                            - View product analytics\n` +
                        `  /status                               - View runtime and queue status\n` +
                        `  /whoami                               - Show your Telegram identity details\n` +
                        `  /cancel                               - Cancel pending admin flow\n` +
                        `  /help                                 - Show command help`
                );
            });

            adminBot.command("help", (ctx) => {
                ctx.reply(
                    `Admin Commands\n` +
                        `========================\n\n` +
                        `/start                                  - Welcome message\n` +
                        `/broadcast [subscribed|all|active24h]  - Create a broadcast\n` +
                        `/feedbacks [limit]                      - Inspect unreviewed feedback\n` +
                        `/analytics                              - Product and user analytics\n` +
                        `/status                                 - App and queue health checks\n` +
                        `/whoami                                 - Show Telegram username and id\n` +
                        `/cancel                                 - Cancel ongoing admin workflow\n` +
                        `/help                                   - Display this help message`
                );
            });

            adminBot.command("whoami", (ctx) => {
                const username = ctx.from?.username ? `@${ctx.from.username}` : "(not set)";
                const userId = ctx.from?.id ?? "unknown";
                const isAllowed = isAuthorizedAdmin(ctx.from?.username, ctx.from?.id);

                ctx.reply(
                    `Admin Identity\n` +
                        `========================\n\n` +
                        `Username: ${username}\n` +
                        `User ID: ${userId}\n` +
                        `Authorized: ${isAllowed ? "Yes" : "No"}\n\n` +
                        `Tip: You can add either username or numeric ID to ADMINS in environment config.`
                );
            });

            adminBot.command("cancel", (ctx) => {
                const adminId = ctx.from?.id;

                if (!adminId) {
                    ctx.reply("Unable to resolve your Telegram identity.");
                    return;
                }

                const hadPendingAction = pendingActions.delete(adminId);

                ctx.reply(
                    hadPendingAction
                        ? "Your pending admin action has been cancelled."
                        : "No pending admin action found."
                );
            });

            adminBot.command("broadcast", async (ctx) => {
                const adminId = ctx.from?.id;

                if (!adminId) {
                    await ctx.reply("Unable to resolve your Telegram identity.");
                    return;
                }

                const commandText = "text" in ctx.message ? ctx.message.text : "";
                const [audienceRaw] = getCommandArgs(commandText);
                const audience = parseBroadcastAudience(audienceRaw);

                if (!audience) {
                    await ctx.reply(
                        "Invalid audience.\n\n" +
                            "Use one of the following:\n" +
                            "  /broadcast subscribed\n" +
                            "  /broadcast all\n" +
                            "  /broadcast active24h"
                    );
                    return;
                }

                pendingActions.set(adminId, {
                    type: "broadcast",
                    audience,
                });

                await ctx.reply(
                    `Broadcast flow started.\n\n` +
                        `Audience: ${BROADCAST_AUDIENCE_LABELS[audience]}\n` +
                        `Next step: send the broadcast text as your next message.\n\n` +
                        `Use /cancel to abort.`,
                    { reply_markup: { force_reply: true } }
                );
            });

            adminBot.action("admin:broadcast:cancel", async (ctx) => {
                const adminId = ctx.from?.id;

                if (!adminId) {
                    await ctx.answerCbQuery("Unable to resolve your Telegram identity.");
                    return;
                }

                pendingActions.delete(adminId);
                await ctx.answerCbQuery("Broadcast cancelled.");
                await ctx.editMessageText("Broadcast flow cancelled.");
            });

            adminBot.action("admin:broadcast:confirm", async (ctx) => {
                const adminId = ctx.from?.id;

                if (!adminId) {
                    await ctx.answerCbQuery("Unable to resolve your Telegram identity.");
                    return;
                }

                const pendingAction = pendingActions.get(adminId);

                if (
                    !pendingAction ||
                    pendingAction.type !== "broadcast" ||
                    !pendingAction.message
                ) {
                    await ctx.answerCbQuery("No pending broadcast to confirm.");
                    return;
                }

                await ctx.answerCbQuery("Queueing broadcast...");

                try {
                    const users = await getBroadcastRecipients(pendingAction.audience);

                    if (users.length === 0) {
                        pendingActions.delete(adminId);
                        await ctx.editMessageText(
                            `No users matched audience: ${BROADCAST_AUDIENCE_LABELS[pendingAction.audience]}.\n` +
                                "Broadcast cancelled."
                        );
                        return;
                    }

                    await queueBroadcastInBatches(
                        users.map((user: { telegramIdEnc: string }) => user.telegramIdEnc),
                        pendingAction.message
                    );

                    pendingActions.delete(adminId);

                    await ctx.editMessageText(
                        `Broadcast Queued\n` +
                            `========================\n\n` +
                            `Audience: ${BROADCAST_AUDIENCE_LABELS[pendingAction.audience]}\n` +
                            `Recipients: ${users.length}\n` +
                            `Message length: ${pendingAction.message.length} characters`
                    );

                    logger.info(
                        `Broadcast queued by admin @${ctx.from?.username ?? adminId} ` +
                            `for ${users.length} users (audience=${pendingAction.audience})`
                    );
                } catch (error) {
                    logger.error("Failed to queue broadcast", error);
                    await ctx.reply(
                        "Sorry, something went wrong while queuing the broadcast. Please try again."
                    );
                }
            });

            adminBot.command("feedbacks", async (ctx) => {
                const commandText = "text" in ctx.message ? ctx.message.text : "";
                const [rawLimit] = getCommandArgs(commandText);
                const limit = parseFeedbackLimit(rawLimit);

                try {
                    const [totalFeedback, unreviewedFeedback, latestUnreviewed] = await Promise.all(
                        [
                            prisma.feedback.count(),
                            prisma.feedback.count({ where: { reviewed: false } }),
                            prisma.feedback.findMany({
                                where: { reviewed: false },
                                orderBy: { createdAt: "desc" },
                                take: limit,
                                select: {
                                    id: true,
                                    feedback: true,
                                    createdAt: true,
                                },
                            }),
                        ]
                    );

                    await ctx.reply(
                        `Feedback Overview\n` +
                            `========================\n\n` +
                            `Total feedback entries: ${totalFeedback}\n` +
                            `Unreviewed feedback: ${unreviewedFeedback}\n` +
                            `Showing latest: ${latestUnreviewed.length}\n\n` +
                            `Use /feedbacks <limit> to adjust results (max ${MAX_FEEDBACK_LIMIT}).`
                    );

                    if (latestUnreviewed.length === 0) {
                        return;
                    }

                    for (const feedback of latestUnreviewed) {
                        const createdAtText = new Date(Number(feedback.createdAt)).toLocaleString(
                            "en-US",
                            {
                                year: "numeric",
                                month: "short",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                            }
                        );

                        await ctx.reply(
                            `Feedback #${feedback.id}\n` +
                                `Created: ${createdAtText}\n\n` +
                                `${truncateText(feedback.feedback, 1000)}`,
                            Markup.inlineKeyboard([
                                [
                                    Markup.button.callback(
                                        "Mark as Reviewed",
                                        `fb:review:${feedback.id}`
                                    ),
                                ],
                            ])
                        );
                    }
                } catch (error) {
                    logger.error("Failed to fetch feedback items", error);
                    await ctx.reply(
                        "Sorry, something went wrong while fetching feedback. Please try again."
                    );
                }
            });

            adminBot.action(/^fb:review:(\d+)$/, async (ctx) => {
                const feedbackId = Number(ctx.match[1]);

                if (!Number.isInteger(feedbackId) || feedbackId <= 0) {
                    await ctx.answerCbQuery("Invalid feedback id.");
                    return;
                }

                try {
                    const result = await prisma.feedback.updateMany({
                        where: {
                            id: feedbackId,
                            reviewed: false,
                        },
                        data: {
                            reviewed: true,
                        },
                    });

                    if (result.count === 0) {
                        await ctx.answerCbQuery("Already reviewed or does not exist.");
                        return;
                    }

                    await ctx.answerCbQuery(`Feedback #${feedbackId} marked as reviewed.`);

                    const currentText =
                        "message" in ctx.callbackQuery &&
                        ctx.callbackQuery.message &&
                        "text" in ctx.callbackQuery.message
                            ? ctx.callbackQuery.message.text
                            : null;

                    if (currentText) {
                        await ctx.editMessageText(`${currentText}\n\nStatus: Reviewed`);
                    }
                } catch (error) {
                    logger.error("Failed to mark feedback as reviewed", error);
                    await ctx.answerCbQuery("Failed to update feedback.");
                }
            });

            adminBot.on("message", async (ctx, next) => {
                const adminId = ctx.from?.id;

                if (!adminId) {
                    return next();
                }

                const pendingAction = pendingActions.get(adminId);

                if (!pendingAction) {
                    return next();
                }

                if ("text" in ctx.message && ctx.message.text.startsWith("/")) {
                    return next();
                }

                if (pendingAction.type === "broadcast") {
                    const broadcastText = "text" in ctx.message ? ctx.message.text.trim() : "";

                    if (!broadcastText) {
                        await ctx.reply("Please send the broadcast as a text message.");
                        return;
                    }

                    if (broadcastText.length > MAX_BROADCAST_LENGTH) {
                        await ctx.reply(
                            `Broadcast text is too long. Max length is ${MAX_BROADCAST_LENGTH} characters.`
                        );
                        return;
                    }

                    pendingActions.set(adminId, {
                        ...pendingAction,
                        message: broadcastText,
                    });

                    const preview = truncateText(broadcastText, 700);

                    await ctx.reply(
                        `Broadcast Preview\n` +
                            `========================\n\n` +
                            `Audience: ${BROADCAST_AUDIENCE_LABELS[pendingAction.audience]}\n` +
                            `Preview:\n${preview}\n\n` +
                            `Confirm to queue this broadcast.`,
                        Markup.inlineKeyboard([
                            [Markup.button.callback("Confirm & Queue", "admin:broadcast:confirm")],
                            [Markup.button.callback("Cancel", "admin:broadcast:cancel")],
                        ])
                    );

                    return;
                }

                return next();
            });

            adminBot.command("analytics", async (ctx) => {
                try {
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
                        prisma.user.count({
                            where: { lastActive: { gte: threeHoursAgo } },
                        }),
                        prisma.user.count({
                            where: { lastActive: { gte: twentyFourHoursAgo } },
                        }),
                        prisma.user.count({
                            where: { createdAt: { gte: twentyFourHoursAgo } },
                        }),
                        prisma.user.count({
                            where: { createdAt: { gte: sevenDaysAgo } },
                        }),
                        prisma.user.count({
                            where: { temporaryOn: true },
                        }),
                        prisma.user.count({
                            where: { customInstructions: { not: null } },
                        }),
                        prisma.message.count(),
                        prisma.feedback.count(),
                        prisma.feedback.count({ where: { reviewed: false } }),
                        prisma.reminder.count({
                            where: { executed: false },
                        }),
                        prisma.reminder.count({
                            where: {
                                executed: false,
                                remindAt: { lte: BigInt(now) },
                            },
                        }),
                        broadcastQueue.getJobCounts("waiting", "active", "delayed", "failed"),
                    ]);

                    const appUptime = formatDuration(now - APP_START_TIME);
                    const processUptime = formatDuration(process.uptime() * 1000);
                    const subscribedPercentage =
                        totalUsers > 0 ? ((subscribedUsers / totalUsers) * 100).toFixed(1) : "0.0";

                    await ctx.reply(
                        `Bot Analytics\n` +
                            `========================\n\n` +
                            `Users\n` +
                            `  Total users: ${totalUsers}\n` +
                            `  Subscribed users: ${subscribedUsers} (${subscribedPercentage}%)\n` +
                            `  New users (24h): ${newUsers24h}\n` +
                            `  New users (7d): ${newUsers7d}\n` +
                            `  Active (last 3 hours): ${activeUsers3h}\n` +
                            `  Active (last 24 hours): ${activeUsers24h}\n` +
                            `  Temporary mode enabled: ${temporaryModeUsers}\n` +
                            `  Custom instructions set: ${usersWithCustomInstructions}\n\n` +
                            `Content\n` +
                            `  Total messages stored: ${totalMessages}\n` +
                            `  Total feedback received: ${totalFeedback}\n` +
                            `  Unreviewed feedback: ${unreviewedFeedback}\n\n` +
                            `Reminders\n` +
                            `  Pending reminders: ${pendingReminders}\n` +
                            `  Overdue reminders: ${dueReminders}\n\n` +
                            `Broadcast Queue\n` +
                            `  Waiting: ${broadcastCounts.waiting ?? 0}\n` +
                            `  Active: ${broadcastCounts.active ?? 0}\n` +
                            `  Delayed: ${broadcastCounts.delayed ?? 0}\n` +
                            `  Failed: ${broadcastCounts.failed ?? 0}\n\n` +
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

            adminBot.command("status", async (ctx) => {
                try {
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

                    await ctx.reply(
                        `System Status\n` +
                            `========================\n\n` +
                            `Database Counters\n` +
                            `  Users: ${totalUsers}\n` +
                            `  Messages: ${totalMessages}\n` +
                            `  Feedback: ${totalFeedback}\n` +
                            `  Reminders: ${totalReminders}\n\n` +
                            `Queues\n` +
                            `  Reminder -> W:${reminderQueueCounts.waiting ?? 0} ` +
                            `A:${reminderQueueCounts.active ?? 0} ` +
                            `D:${reminderQueueCounts.delayed ?? 0} ` +
                            `F:${reminderQueueCounts.failed ?? 0}\n` +
                            `  Broadcast -> W:${broadcastQueueCounts.waiting ?? 0} ` +
                            `A:${broadcastQueueCounts.active ?? 0} ` +
                            `D:${broadcastQueueCounts.delayed ?? 0} ` +
                            `F:${broadcastQueueCounts.failed ?? 0}\n` +
                            `  Daily Creator -> W:${dailyCreatorQueueCounts.waiting ?? 0} ` +
                            `A:${dailyCreatorQueueCounts.active ?? 0} ` +
                            `D:${dailyCreatorQueueCounts.delayed ?? 0} ` +
                            `F:${dailyCreatorQueueCounts.failed ?? 0}\n` +
                            `  Daily Sender -> W:${dailySenderQueueCounts.waiting ?? 0} ` +
                            `A:${dailySenderQueueCounts.active ?? 0} ` +
                            `D:${dailySenderQueueCounts.delayed ?? 0} ` +
                            `F:${dailySenderQueueCounts.failed ?? 0}\n\n` +
                            `Process\n` +
                            `  Uptime: ${formatDuration(process.uptime() * 1000)}\n` +
                            `  RSS: ${formatBytes(memoryUsage.rss)}\n` +
                            `  Heap used: ${formatBytes(memoryUsage.heapUsed)} / ${formatBytes(memoryUsage.heapTotal)}\n` +
                            `  External: ${formatBytes(memoryUsage.external)}`
                    );
                } catch (error) {
                    logger.error("Failed to fetch status", error);
                    await ctx.reply(
                        "Sorry, something went wrong while fetching status. Please try again."
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
