import { adminBot } from "../botInstance.js";
import { Markup } from "telegraf";
import { logger } from "@/utils/logger.js";
import { MAX_FEEDBACK_LIMIT } from "../constants.js";
import { getCommandArgs, truncateText, parseFeedbackLimit } from "../utils.js";
import {
    getFeedbackStats,
    getUnreviewedFeedback,
    markFeedbackAsReviewed,
} from "../services/feedback.js";

const registerFeedback = () => {
    adminBot.command("feedbacks", async (ctx) => {
        const commandText = "text" in ctx.message ? ctx.message.text : "";
        const [rawLimit] = getCommandArgs(commandText);
        const limit = parseFeedbackLimit(rawLimit);

        try {
            const { total, unreviewed } = await getFeedbackStats();
            const latestUnreviewed = await getUnreviewedFeedback(limit);

            await ctx.reply(
                `Feedback Overview\n` +
                    `========================\n\n` +
                    `Total feedback entries: ${total}\n` +
                    `Unreviewed feedback: ${unreviewed}\n` +
                    `Showing latest: ${latestUnreviewed.length}\n\n` +
                    `Use /feedbacks <limit> to adjust results (max ${MAX_FEEDBACK_LIMIT}).`
            );

            if (latestUnreviewed.length === 0) {
                return;
            }

            for (const feedback of latestUnreviewed) {
                const createdAtText = new Date(Number(feedback.createdAt)).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                });

                await ctx.reply(
                    `Feedback #${feedback.id}\n` +
                        `Created: ${createdAtText}\n\n` +
                        `${truncateText(feedback.feedback, 1000)}`,
                    Markup.inlineKeyboard([
                        [Markup.button.callback("Mark as Reviewed", `fb:review:${feedback.id}`)],
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
            const result = await markFeedbackAsReviewed(feedbackId);

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
};

export { registerFeedback };
