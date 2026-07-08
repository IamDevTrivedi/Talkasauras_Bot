import { bot } from "../botInstance.js";

const registerStart = () => {
    bot.start((ctx) => {
        const name = ctx.from?.first_name || "there";
        ctx.reply(
            `Welcome, ${name}! 👋\n\n` +
                `I'm Talkasauras — your AI-powered chat companion, right here on Telegram. ` +
                `I can hold natural conversations, remember what we've talked about, and adapt to whatever style suits you best.\n\n` +
                `Just type anything to start chatting, or send /help to see everything I can do.`
        );
    });
};

export { registerStart };
