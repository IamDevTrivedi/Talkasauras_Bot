import { adminBot } from "../botInstance.js";
import { deletePendingAction } from "../services/pendingActions.js";

const registerCancel = () => {
    adminBot.command("cancel", async (ctx) => {
        const adminId = ctx.from?.id;

        if (!adminId) {
            ctx.reply("Unable to resolve your Telegram identity.");
            return;
        }

        const hadPendingAction = await deletePendingAction(adminId);

        ctx.reply(
            hadPendingAction
                ? "Your pending admin action has been cancelled."
                : "No pending admin action found."
        );
    });
};

export { registerCancel };
