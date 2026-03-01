import { Worker } from "bullmq";
import { redisConfig } from "./redisConfig.js";
import { QueueNames } from "./queues.js";
import { updateLastActivity } from "./processors/updateLastActivity.js";
import { sendReminder } from "./processors/sendReminder.js";
import { sendBroadcast } from "./processors/sendBroadcast.js";
import { dailyMsgCreator } from "./processors/dailyMsgCreator.js";
import { dailyMsgSender } from "./processors/dailyMsgSender.js";

export const lastActivityWorker = new Worker(QueueNames.UPDATE_LAST_ACTIVITY, updateLastActivity, {
    connection: redisConfig,
    concurrency: 10,
});

export const reminderWorker = new Worker(QueueNames.SEND_REMINDER, sendReminder, {
    connection: redisConfig,
    concurrency: 5,
});

export const broadcastWorker = new Worker(QueueNames.SEND_BROADCAST, sendBroadcast, {
    connection: redisConfig,
    concurrency: 10,
});

export const dailyMsgCreatorWorker = new Worker(QueueNames.DAILY_MSG_CREATOR, dailyMsgCreator, {
    connection: redisConfig,
    concurrency: 1,
});

export const dailyMsgSenderWorker = new Worker(QueueNames.DAILY_MSG_SENDER, dailyMsgSender, {
    connection: redisConfig,
    concurrency: 10,
});
