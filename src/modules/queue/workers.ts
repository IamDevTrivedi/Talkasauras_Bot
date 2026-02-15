import { Worker } from "bullmq";
import { redisConfig } from "./redisConfig.js";
import { QueueNames } from "./queues.js";
import { updateLastActivity } from "./processors/updateLastActivity.js";

export const lastActivityWorker = new Worker(QueueNames.UPDATE_LAST_ACTIVITY, updateLastActivity, {
    connection: redisConfig,
    concurrency: 10,
});
