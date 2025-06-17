import config from "../config.js";
import logger from "./logger.utils.js";
import Chat from "../models/chat.model.js";
import RemoveMarkdown from "remove-markdown";
import { createUser } from "./telegram.utils.js";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

async function geminiTextResponse(payload) {
    const { telegramId, firstName, userName, message, ctx } = payload;

    try {
        await createUser(ctx);
    } catch (err) {
        logger.error({
            message: "Failed to create or update user in Telegram context",
            error: err,
            telegramId,
        });
        return "Sorry, something went wrong while setting up your profile.";
    }

    let User;
    try {
        User = await Chat.findOne({ telegramId });
        if (!User) {
            throw new Error("User not found in database");
        }
    } catch (err) {
        logger.error({
            message: "Failed to fetch user from database",
            error: err,
            telegramId,
        });
        return "Sorry, we couldn't find your chat history. Please try again later.";
    }

    const now = Date.now();
    const sinceLast = now - User.lastMessageAt;
    const isTemporary = User.isTemporary && sinceLast < 1000 * 60 * 5;

    const historySource = isTemporary ? User.temporaryChatHistory : User.chatHistory;

    const google = createGoogleGenerativeAI({
        apiKey: config.GOOGLE_GEMINI_API_KEY,
    });

    let messages = historySource.map((msg) => ({
        role: msg.role === "model" ? "assistant" : "user",
        content: [{ type: "text", text: msg.content }],
    }));

    messages.push({
        role: "user",
        content: [{ type: "text", text: message }],
    });

    let result;
    try {
        result = await generateText({
            model: google("gemini-2.0-flash", {
                useSearchGrounding: true,
            }),
            providerOptions: {
                google: { responseModalities: ["TEXT"] },
            },
            system: [
                "You are Talkasauras, a friendly and knowledgeable AI assistant powered by Google's Gemini AI technology.",
                "This project was developed by Dev Trivedi. Users can explore more about his work and connect with him using the following links: LinkedIn - https://in.linkedin.com/in/contact-devtrivedi, GitHub - https://github.com/IamDevTrivedi., Portfolio - https://www.dev-trivedi.me.",
                "Adopt a warm, conversational tone. Be personable, engaging, and easy to talk to.",
                "Avoid using Markdown or any special formatting—respond in plain text only.",
                `Whenever it feels natural, address the user by their first name (“${firstName}”) to build rapport and a personalized experience.`,
                "Provide responses that are accurate, detailed, and informative. Always go the extra mile to explain concepts clearly.",
                "Encourage further interaction by ending each message with a relevant follow-up question based on the user's last input.",
            ].join(" "),
            messages: messages,
        });
    } catch (err) {
        logger.error({
            message: "Failed to generate response using Gemini AI",
            error: err,
            telegramId,
            messageContent: message,
        });
        return "I'm having trouble responding right now. Please try again shortly.";
    }

    const response = result.text;

    const userPart = {
        role: "user",
        content: message,
    };

    const modelPart = {
        role: "model",
        content: response,
    };

    if (isTemporary) {
        User.temporaryChatHistory.push(userPart, modelPart);
    } else {
        User.chatHistory.push(userPart, modelPart);
    }

    try {
        await User.save();
    } catch (error) {
        logger.error({
            message: "Failed to save updated chat history",
            error,
            telegramId,
        });
    }

    return RemoveMarkdown(response);
}

async function geminiImageResponse(payload) {
    const { telegramId, firstName, userName, message, ctx } = payload;

    try {
        await createUser(ctx);
    } catch (error) {
        logger.error({
            message: "Failed to create or update user in Telegram context",
            error,
        });
        return await ctx.reply("Sorry, something went wrong while setting up your profile.");
    }

    let User;

    try {
        User = await Chat.findOne({ telegramId });
    } catch (error) {
        logger.error({
            message: "Failed to fetch user from database",
            error,
            telegramId,
        });
        return await ctx.reply("Couldn't find your chat history. Please try again later.");
    }

    const now = Date.now();
    const sinceLast = now - User.lastMessageAt;
    const isTemporary = User.isTemporary && sinceLast < 1000 * 60 * 5;

    const historySource = isTemporary ? User.temporaryChatHistory : User.chatHistory;

    const google = createGoogleGenerativeAI({
        apiKey: config.GOOGLE_GEMINI_API_KEY,
    });

    const messages = historySource.map((msg) => ({
        role: msg.role === "model" ? "assistant" : "user",
        content: [{ type: "text", text: msg.content }],
    }));

    const userPart = {
        role: "user",
        content: message,
    };

    messages.push(userPart);

    let result;

    try {
        result = await generateText({
            model: google("gemini-2.0-flash-exp"),
            providerOptions: {
                google: { responseModalities: ["TEXT", "IMAGE"] },
            },
            prompt: message,
        });
    } catch (err) {
        logger.error({
            message: "Failed to generate response using Gemini AI",
            error: err,
            telegramId,
            messageContent: message,
        });
        return await ctx.reply(
            "I'm having trouble responding right now. Please try again shortly."
        );
    }

    const modelPart = {
        role: "model",
        content: result.text || `Image generated for the prompt : "${message}"`,
    };

    if (isTemporary) {
        User.temporaryChatHistory.push(userPart, modelPart);
    } else {
        User.chatHistory.push(userPart, modelPart);
    }

    await User.save();

    const imageFiles = result.files?.filter((file) => file.mimeType.startsWith("image/")) || [];

    for (const file of imageFiles) {
        const buffer = Buffer.from(file.base64Data, "base64");

        try {
            await ctx.replyWithPhoto({ source: buffer });
        } catch (err) {
            logger.error({
                message: "Failed to send image to Telegram user",
                error: err,
                telegramId,
            });
        }
    }

    if (result.text) {
        await ctx.reply(`📝 ${result.text}`);
    } else if (imageFiles.length === 0) {
        await ctx.reply("I couldn't generate anything this time. Try again?");
    }
}

export { geminiTextResponse, geminiImageResponse };
