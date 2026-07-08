import { adminBot } from "../botInstance.js";
import { isAuthorizedAdmin } from "../middleware/auth.js";

const registerWhoami = () => {
    adminBot.command("whoami", (ctx) => {
        const username = ctx.from?.username ? `@${ctx.from.username}` : "(not set)";
        const userId = ctx.from?.id ?? "unknown";
        const isAllowed = isAuthorizedAdmin(ctx.from?.username, ctx.from?.id);

        ctx.reply(
            `Admin Identity\n` +
                `========================\n\n` +
                `Username: ${username}\n` +
                `User ID: ${userId}\n` +
                `Authorized: ${isAllowed ? "Yes" : "No"}\n\n` +
                `Tip: You can add either username or numeric ID to ADMINS in environment config.`
        );
    });
};

export { registerWhoami };
