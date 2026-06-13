import { bot } from "../botInstance.js";

const registerStart = () => {
    bot.start((ctx) => {
        const name = ctx.from?.first_name || "there";

        ctx.reply(
            `Welcome, ${name}!\n\n` +
                `I am Talkasauras Bot, your AI-powered chat companion on Telegram. ` +
                `I can carry on natural conversations, remember context, and adapt to your preferred style.\n\n` +
                `Feel free to type anything to begin chatting, or send /help to explore all available commands.`
        );
    });
};

export { registerStart };
