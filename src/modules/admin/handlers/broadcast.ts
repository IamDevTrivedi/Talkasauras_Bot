import { adminBot } from "../botInstance.js";
import { Markup } from "telegraf";
import { logger } from "@/utils/logger.js";
import { MAX_BROADCAST_LENGTH, BROADCAST_AUDIENCE_LABELS, pendingActions } from "../constants.js";
import type { BroadcastAudience } from "../constants.js";
import { getCommandArgs, truncateText } from "../utils.js";
import { getBroadcastRecipients, queueBroadcastInBatches } from "../services/broadcast.js";

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

const registerBroadcast = () => {
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

        if (!pendingAction || pendingAction.type !== "broadcast" || !pendingAction.message) {
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
};

export { registerBroadcast };
