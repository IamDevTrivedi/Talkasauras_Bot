import { adminBot } from "./botInstance.js";
import { logger } from "@/utils/logger.js";
import { authMiddleware, registerErrorHandler } from "./middleware/index.js";
import {
    registerStart,
    registerHelp,
    registerWhoami,
    registerCancel,
    registerBroadcast,
    registerFeedback,
    registerAnalytics,
    registerStatus,
} from "./handlers/index.js";

export const services = {
    prepare: async () => {
        try {
            registerErrorHandler();
            adminBot.use(authMiddleware);

            registerStart();
            registerHelp();
            registerWhoami();
            registerCancel();
            registerBroadcast();
            registerFeedback();
            registerAnalytics();
            registerStatus();
        } catch (error) {
            logger.error("Failed to prepare admin bot", error);
            process.exit(1);
        }
    },

    launch: () => {
        try {
            adminBot.launch();
        } catch (error) {
            logger.error("Failed to launch admin bot", error);
            process.exit(1);
        }
    },
};
