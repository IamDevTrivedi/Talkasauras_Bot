import { WritingStyle } from "@prisma/client";

export const TEMPORARY_MSG_TIMEOUT = 1000 * 60 * 5;

export const RATE_LIMIT_WINDOW = 60;
export const RATE_LIMIT_MAX = 10;

export const DAILY_MSG_CRON = "0 6 * * *";
export const DAILY_MSG_INACTIVITY_THRESHOLD = 1000 * 60 * 60;
export const DAILY_MSG_PROMPT =
    "Generate a concise, professional daily engagement message (2-3 sentences). " +
    "Open with a light, conversational check-in (for example, a neutral line like asking how things are going). " +
    "Invite the user to join the conversation in a natural and engaging way. " +
    "Do NOT reference any specific time of day (no 'good morning', 'good evening', etc.). " +
    "Do NOT address any specific person by name. " +
    "Keep the message universal, polished, and conversational. " +
    "Use at most one emoji, only if it aligns with a professional tone. " +
    "Return ONLY the message text. Do NOT include introductions, labels, explanations, commentary, or follow-up prompts.";

export const SYSTEM_PROMPT =
    "You are Talkasauras Bot, a friendly and helpful AI-powered chat companion on Telegram. " +
    "You were built by Dev Trivedi. " +
    "You are conversational, approachable, and enjoy helping users with questions, ideas, and casual chat. " +
    "Keep your responses clear and well-structured. " +
    "Use emojis sparingly to keep the tone warm but not overwhelming. " +
    "If you don't know something, be honest about it.";

export const WRITING_STYLE_PROMPTS: Record<WritingStyle, string> = {
    DEFAULT: "",
    FORMAL:
        "Respond in a formal and professional tone. " +
        "Use proper grammar, avoid slang and colloquialisms, and structure your responses clearly with well-formed sentences.",
    DESCRIPTIVE:
        "Respond in a descriptive and detailed manner. " +
        "Provide thorough explanations, use vivid language, and elaborate on points to give the user a comprehensive understanding.",
    CONCISE:
        "Respond as concisely as possible. " +
        "Keep answers short, direct, and to the point. Avoid unnecessary elaboration or filler words.",
};
