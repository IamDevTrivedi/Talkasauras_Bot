import { bot } from "../botInstance.js";

const registerInfo = () => {
    bot.command("about", (ctx) => {
        ctx.reply(
            `About Talkasauras Bot\n` +
                `========================\n\n` +
                `Talkasauras Bot is an AI-powered Telegram chatbot designed to hold natural, ` +
                `meaningful conversations. It supports multiple writing styles, custom instructions, ` +
                `temporary chat modes, and scheduled reminders.\n\n` +
                `Built with care by Dev Trivedi.`
        );
    });

    bot.command("help", (ctx) => {
        ctx.reply(
            `Available Commands\n\n` +
                `/start - Start the bot and receive a welcome message\n` +
                `/about - Learn more about Talkasauras Bot\n` +
                `/help - Display this list of commands\n` +
                `/contact - View the developer's contact details\n` +
                `/feedback - Share your valued feedback\n` +
                `/remindme - Schedule a reminder for a future date and time\n` +
                `/clear - Clear your entire conversation history\n` +
                `/current_mode - Check your current chat mode\n` +
                `/temporary_on - Enable temporary chat mode\n` +
                `/temporary_off - Disable temporary mode and delete temp messages\n` +
                `/custom_instructions - Set personalized instructions for the bot\n` +
                `/clear_instructions - Clear your custom instructions\n` +
                `/writing_style - Choose your preferred writing style\n\n` +
                `/subscribe - Re-enable daily messages if you've unsubscribed\n\n` +
                `You can also simply send me any message and I will respond right away.`
        );
    });

    bot.command("contact", (ctx) => {
        ctx.reply(
            `Developer Contact Information\n\n` +
                `Name: Dev Trivedi\n` +
                `GitHub: https://github.com/IamDevTrivedi/\n` +
                `LinkedIn: https://www.linkedin.com/in/contact-devtrivedi/\n` +
                `Portfolio: https://www.trivedi.dev/`
        );
    });
};

export { registerInfo };
