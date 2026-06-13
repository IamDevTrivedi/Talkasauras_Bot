import { adminBot } from "../botInstance.js";
import { pendingActions } from "../constants.js";

const registerCancel = () => {
    adminBot.command("cancel", (ctx) => {
        const adminId = ctx.from?.id;

        if (!adminId) {
            ctx.reply("Unable to resolve your Telegram identity.");
            return;
        }

        const hadPendingAction = pendingActions.delete(adminId);

        ctx.reply(
            hadPendingAction
                ? "Your pending admin action has been cancelled."
                : "No pending admin action found."
        );
    });
};

export { registerCancel };
