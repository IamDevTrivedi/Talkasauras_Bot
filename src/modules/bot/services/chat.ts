import { ollama } from "@/config/ollama.js";
import { env } from "@/config/env.js";
import { buildSystemPrompt } from "@/utils/genPrompt.js";
import { WritingStyle } from "@prisma/client";

type ChatMessage = {
    role: "user" | "assistant" | "system";
    content: string;
    images?: string[];
};

const sendToLLM = async (
    messages: ChatMessage[],
    options?: {
        firstName?: string;
        lastName?: string;
        writingStyle?: WritingStyle;
        customInstructions?: string;
    }
) => {
    const systemPrompt = options
        ? buildSystemPrompt({
              firstName: options.firstName ?? "User",
              lastName: options.lastName,
              writingStyle: options.writingStyle ?? WritingStyle.DEFAULT,
              customInstructions: options.customInstructions,
          })
        : undefined;

    const fullMessages: ChatMessage[] = [];

    if (systemPrompt) {
        fullMessages.push({ role: "system", content: systemPrompt });
    }

    fullMessages.push(...messages);

    const response = await ollama!.chat({
        model: env.OLLAMA.MODEL_NAME,
        messages: fullMessages,
    });

    return response.message.content;
};

export { sendToLLM };
