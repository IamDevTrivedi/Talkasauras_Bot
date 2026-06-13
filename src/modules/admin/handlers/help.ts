import { adminBot } from "../botInstance.js";

const registerHelp = () => {
    adminBot.command("help", (ctx) => {
        ctx.reply(
            `Admin Commands\n` +
                `========================\n\n` +
                `/start                                  - Welcome message\n` +
                `/broadcast [subscribed|all|active24h]  - Create a broadcast\n` +
                `/feedbacks [limit]                      - Inspect unreviewed feedback\n` +
                `/analytics                              - Product and user analytics\n` +
                `/status                                 - App and queue health checks\n` +
                `/whoami                                 - Show Telegram username and id\n` +
                `/cancel                                 - Cancel ongoing admin workflow\n` +
                `/help                                   - Display this help message`
        );
    });
};

export { registerHelp };
