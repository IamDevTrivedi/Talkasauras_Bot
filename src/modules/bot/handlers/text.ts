import { bot } from "../botInstance.js";
import { logger } from "@/utils/logger.js";
import { TEMPORARY_MSG_TIMEOUT } from "@/constants/app.js";
import { getUser, decryptCustomInstructions } from "../services/user.js";
import { getHistory, saveMessage } from "../services/message.js";
import { sendToLLM } from "../services/chat.js";

const registerText = () => {
    bot.on("text", async (ctx) => {
        try {
            const telegramIdHash = ctx.state.telegramIdHash as string;
            const { text: newMsg } = ctx.message;

            const user = await getUser(telegramIdHash);

            if (!user) {
                logger.error(`User not found for telegramIdHash: ${telegramIdHash}`);
                await ctx.reply("Sorry, something went wrong. Please try again later.");
                return;
            }

            let isActualTemporary = false;

            if (user.temporaryOn) {
                if (Date.now() - Number(user.lastActive) <= TEMPORARY_MSG_TIMEOUT) {
                    isActualTemporary = true;
                }
            }

            const preMsgsDecrypted = await getHistory(telegramIdHash, isActualTemporary);

            preMsgsDecrypted.push({
                role: "user",
                content: newMsg,
            });

            const customInstructions = decryptCustomInstructions(user.customInstructions);

            const AIReply = await sendToLLM(preMsgsDecrypted, {
                firstName: ctx.from.first_name,
                lastName: ctx.from.last_name,
                writingStyle: user.writingStyle,
                customInstructions,
            });

            await saveMessage(telegramIdHash, newMsg, "user", isActualTemporary);
            await saveMessage(telegramIdHash, AIReply, "assistant", isActualTemporary);

            await ctx.reply(AIReply, {
                reply_parameters: { message_id: ctx.message.message_id },
            });
        } catch (error) {
            logger.error("Failed to process text message", error);
            await ctx.reply(
                "Sorry, something went wrong while processing your message. Please try again later."
            );
        }
    });
};

export { registerText };
