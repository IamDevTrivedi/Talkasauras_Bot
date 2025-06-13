import { GoogleGenAI } from "@google/genai";
import config from "../config.js";
import logger from "./logger.utils.js";
import Chat from "../models/chat.model.js";
import RemoveMarkdown from "remove-markdown";
import { createUser } from "./telegram.utils.js";

export async function geminiResponse(payload) {
  const { telegramId, firstName, userName, message } = payload;
  await createUser(payload.ctx);

  let User = await Chat.findOne({ telegramId });

  const now = Date.now();
  const sinceLast = now - User.lastMessageAt;

  const isTemporary = User.isTemporary && sinceLast < 1000 * 60 * 5;

  const historySource = isTemporary
    ? User.temporaryChatHistory
    : User.chatHistory;

  if (!isTemporary) {
    User.temporaryChatHistory = [];
    User.isTemporary = false;
  }

  const history = historySource.map((msg) => ({
    role: msg.role,
    parts: [
      {
        text: msg.content,
      },
    ],
  }));

  const ai = new GoogleGenAI({ apiKey: config.GOOGLE_GEMINI_API_KEY });

  const chat = ai.chats.create({
    model: "gemini-2.0-flash",
    history,
    config: {
      systemInstruction: [
        "You are Talkasauras, a friendly and knowledgeable AI assistant powered by Google's Gemini AI technology.",
        "This project was developed by Dev Trivedi. Users can explore more about his work and connect with him using the following links: LinkedIn - https://in.linkedin.com/in/contact-devtrivedi, GitHub - https://github.com/IamDevTrivedi., Portfolio - https://www.devtrivedi.me.",
        "Adopt a warm, conversational tone. Be personable, engaging, and easy to talk to.",
        "Avoid using Markdown or any special formatting—respond in plain text only.",
        `Whenever it feels natural, address the user by their first name (“${firstName}”) to build rapport and a personalized experience.`,
        "Provide responses that are accurate, detailed, and informative. Always go the extra mile to explain concepts clearly.",
        "Encourage further interaction by ending each message with a relevant follow-up question based on the user's last input.",
      ].join(" "),
    },
  });

  const response = await chat.sendMessage({ message });

  const userPart = {
    role: "user",
    content: message,
  };

  const modelPart = {
    role: "model",
    content: response.text,
  };

  if (isTemporary) {
    User.temporaryChatHistory.push(userPart);
    User.temporaryChatHistory.push(modelPart);
  } else {
    User.chatHistory.push(userPart);
    User.chatHistory.push(modelPart);
  }

  try {
    await User.save();
  } catch (error) {
    logger.error({ message: "Failed to save history", error });
  }

  return RemoveMarkdown(response.text);
}
