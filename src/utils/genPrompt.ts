import { SYSTEM_PROMPT, WRITING_STYLE_PROMPTS } from "@/constants/app.js";
import { WritingStyle } from "@prisma/client";

interface buildSystemPromptParams {
    writingStyle: WritingStyle;
    firstName: string;
    lastName?: string;
    customInstructions?: string;
}

export const buildSystemPrompt = (params: buildSystemPromptParams): string => {
    const { writingStyle, firstName, lastName, customInstructions } = params;

    let prompt = SYSTEM_PROMPT;
    let name = firstName;

    if (lastName && lastName.trim().length > 0) {
        name += " " + lastName.trim();
    }

    prompt += "\n\n" + "The user's name is: " + name;

    const styleAddition = WRITING_STYLE_PROMPTS[writingStyle];
    if (styleAddition) {
        prompt += "\n\n" + "Writing Style: " + styleAddition;
    }

    if (customInstructions && customInstructions.trim().length > 0) {
        prompt += "\n\n" + "Custom Instructions from the user: " + customInstructions.trim();
    }

    return prompt;
};
