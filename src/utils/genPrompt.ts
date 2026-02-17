import { SYSTEM_PROMPT, WRITING_STYLE_PROMPTS } from "@/constants/app.js";
import { WritingStyle } from "@prisma/client";

export const buildSystemPrompt = (
    writingStyle: WritingStyle,
    customInstructions?: string
): string => {
    let prompt = SYSTEM_PROMPT;

    const styleAddition = WRITING_STYLE_PROMPTS[writingStyle];
    if (styleAddition) {
        prompt += "\n\n" + "Writing Style: " + styleAddition;
    }

    if (customInstructions && customInstructions.trim().length > 0) {
        prompt += "\n\n" + "Custom Instructions from the user: " + customInstructions.trim();
    }

    return prompt;
};
