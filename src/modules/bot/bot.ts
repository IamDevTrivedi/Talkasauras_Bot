import { bot } from "./botInstance.js";
import { logger } from "@/utils/logger.js";
import { DAILY_MSG_CRON } from "@/constants/app.js";
import { dailyMsgCreatorQueue, QueueNames } from "../queue/index.js";
import {
    registerErrorHandler,
    registerIdentifyUser,
    registerCreateUser,
    registerRateLimiter,
} from "./middleware/index.js";
import {
    registerStart,
    registerInfo,
    registerFeedback,
    registerClear,
    registerTemporary,
    registerInstructions,
    registerRemindMe,
    registerWritingStyle,
    registerPhoto,
    registerText,
} from "./handlers/index.js";

export const services = {
    prepare: async () => {
        try {
            registerErrorHandler();
            registerIdentifyUser();
            registerCreateUser();
            registerStart();
            registerInfo();
            registerFeedback();
            registerClear();
            registerTemporary();
            registerInstructions();
            registerRemindMe();
            registerWritingStyle();
            registerRateLimiter();
            registerPhoto();
            registerText();
        } catch (error) {
            logger.error("Failed to prepare bot", error);
            process.exit(1);
        }
    },

    launch: async () => {
        try {
            bot.launch();

            await dailyMsgCreatorQueue.upsertJobScheduler(
                "daily-msg-creator",
                {
                    pattern: DAILY_MSG_CRON,
                    tz: "Asia/Kolkata",
                },
                {
                    name: QueueNames.DAILY_MSG_CREATOR,
                    data: {},
                }
            );

            logger.info("Daily message cron job scheduled.");
        } catch (error) {
            logger.error("Failed to launch bot", error);
            process.exit(1);
        }
    },
};
