import { bot } from "../botInstance.js";
import { logger } from "@/utils/logger.js";
import { TEMPORARY_MSG_TIMEOUT } from "@/constants/app.js";
import { getUser, decryptCustomInstructions } from "../services/user.js";
import { getHistory, saveMessage } from "../services/message.js";
import { sendToLLM } from "../services/chat.js";

const registerPhoto = () => {
    bot.on("photo", async (ctx) => {
        try {
            const telegramIdHash = ctx.state.telegramIdHash as string;
            const caption = ctx.message.caption || "Asked with image";

            const photo = ctx.message.photo;
            const fileId = photo[photo.length - 1].file_id;

            const fileLink = await ctx.telegram.getFileLink(fileId);
            const imageResponse = await fetch(fileLink.href);
            const arrayBuffer = await imageResponse.arrayBuffer();
            const base64Image = Buffer.from(arrayBuffer).toString("base64");

            const user = await getUser(telegramIdHash);

            if (!user) {
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

            const promptContent = caption || "Describe this image";

            const customInstructions = decryptCustomInstructions(user.customInstructions);

            const AIReply = await sendToLLM(
                [
                    ...preMsgsDecrypted,
                    {
                        role: "user",
                        content: promptContent,
                        images: [base64Image],
                    },
                ],
                {
                    firstName: ctx.from.first_name,
                    lastName: ctx.from.last_name,
                    writingStyle: user.writingStyle,
                    customInstructions,
                }
            );

            await saveMessage(telegramIdHash, caption, "user", isActualTemporary);
            await saveMessage(telegramIdHash, AIReply, "assistant", isActualTemporary);

            await ctx.reply(AIReply, {
                reply_parameters: { message_id: ctx.message.message_id },
            });
        } catch (error) {
            logger.error("Failed to process photo message", error);
            await ctx.reply(
                "Sorry, something went wrong while processing your image. Please try again later."
            );
        }
    });
};

export { registerPhoto };
