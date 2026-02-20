import { Worker } from "bullmq";
import { redisConfig } from "./redisConfig.js";
import { QueueNames } from "./queues.js";
import { updateLastActivity } from "./processors/updateLastActivity.js";
import { sendReminder } from "./processors/sendReminder.js";
import { sendBroadcast } from "./processors/sendBroadcast.js";

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
