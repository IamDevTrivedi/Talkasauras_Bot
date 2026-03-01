import { Queue } from "bullmq";
import { UpdateLastActivityJobData } from "./processors/updateLastActivity.js";
import { SendReminderJobData } from "./processors/sendReminder.js";
import { SendBroadcastJobData } from "./processors/sendBroadcast.js";
import { DailyMsgCreatorJobData } from "./processors/dailyMsgCreator.js";
import { redisConfig } from "./redisConfig.js";
import { DailyMsgSenderJobData } from "./processors/dailyMsgSender.js";

export enum QueueNames {
    UPDATE_LAST_ACTIVITY = "lastActivityQueue",
    SEND_REMINDER = "reminderQueue",
    SEND_BROADCAST = "broadcastQueue",
    DAILY_MSG_CREATOR = "dailyMsgCreatorQueue",
    DAILY_MSG_SENDER = "dailyMsgSenderQueue",
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

export const broadcastQueue = new Queue<SendBroadcastJobData>(QueueNames.SEND_BROADCAST, {
    connection: redisConfig,
    defaultJobOptions: {
        attempts: 2,
        removeOnComplete: true,
        removeOnFail: true,
    },
});

export const dailyMsgCreatorQueue = new Queue<DailyMsgCreatorJobData>(
    QueueNames.DAILY_MSG_CREATOR,
    {
        connection: redisConfig,
        defaultJobOptions: {
            attempts: 1,
            removeOnComplete: true,
            removeOnFail: false,
        },
    }
);

export const dailyMsgSenderQueue = new Queue<DailyMsgSenderJobData>(QueueNames.DAILY_MSG_SENDER, {
    connection: redisConfig,
    defaultJobOptions: {
        attempts: 3,
        removeOnComplete: true,
        removeOnFail: false,
    },
});
