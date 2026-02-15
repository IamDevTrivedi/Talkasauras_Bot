import { Queue } from "bullmq";
import { UpdateLastActivityJobData } from "./processors/updateLastActivity.js";
import { redisConfig } from "./redisConfig.js";

export enum QueueNames {
    UPDATE_LAST_ACTIVITY = "lastActivityQueue",
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
