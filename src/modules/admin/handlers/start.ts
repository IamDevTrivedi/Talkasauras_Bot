import { adminBot } from "../botInstance.js";

const registerStart = () => {
    adminBot.start((ctx) => {
        const name = ctx.from?.first_name || "Admin";

        ctx.reply(
            `Welcome, ${name}!\n\n` +
                `This is the Talkasauras Admin Panel Bot.\n\n` +
                `Available commands:\n` +
                `  /broadcast [subscribed|all|active24h] - Start targeted broadcast flow\n` +
                `  /feedbacks [limit]                    - Review latest unreviewed feedback\n` +
                `  /analytics                            - View product analytics\n` +
                `  /status                               - View runtime and queue status\n` +
                `  /whoami                               - Show your Telegram identity details\n` +
                `  /cancel                               - Cancel pending admin flow\n` +
                `  /help                                 - Show command help`
        );
    });
};

export { registerStart };
