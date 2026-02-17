import { Queue } from "bullmq";
import { UpdateLastActivityJobData } from "./processors/updateLastActivity.js";
import { SendReminderJobData } from "./processors/sendReminder.js";
import { redisConfig } from "./redisConfig.js";

export enum QueueNames {
    UPDATE_LAST_ACTIVITY = "lastActivityQueue",
    SEND_REMINDER = "reminderQueue",
}

export const lastActivityQueue = new Queue<UpdateLastActivityJobData>(
    QueueNames.UPDATE_LAST_ACTIVITY,
    {
        connection: redisConfig,
        defaultJobOptions: {
            attempts: 1,
            removeOnComplete: true,
            removeOnFail: true,
        },
    }
);

export const reminderQueue = new Queue<SendReminderJobData>(QueueNames.SEND_REMINDER, {
    connection: redisConfig,
    defaultJobOptions: {
        attempts: 3,
        removeOnComplete: true,
        removeOnFail: false,
    },
});
