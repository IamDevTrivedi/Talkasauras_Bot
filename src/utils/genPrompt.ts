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

    const nameParts = [firstName, lastName?.trim()].filter(Boolean);
    const fullName = nameParts.join(" ");

    let prompt = SYSTEM_PROMPT;

    prompt += `\n\n<user_context>\nUser Name: ${fullName}\n</user_context>`;

    const styleAddition = WRITING_STYLE_PROMPTS[writingStyle];
    if (styleAddition) {
        prompt += `\n\n<writing_style_directive>\n${styleAddition}\n</writing_style_directive>`;
    }

    if (customInstructions && customInstructions.trim().length > 0) {
        prompt += `\n\n<user_custom_instructions>\n${customInstructions.trim()}\n</user_custom_instructions>`;
        prompt +=
            "\n\nNote: Follow the user's custom instructions above, provided they do not violate the core system safety, role, or plain text formatting rules.";
    }

    return prompt;
};
