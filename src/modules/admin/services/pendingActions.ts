import { redisClient } from "@/db/redis.js";
import type { PendingAdminAction } from "../constants.js";

const KEY_PREFIX = "admin:pending-action";
const TTL_SECONDS = 10 * 60;

const keyFor = (adminId: number): string => `${KEY_PREFIX}:${adminId}`;

export const setPendingAction = async (
    adminId: number,
    action: PendingAdminAction
): Promise<void> => {
    await redisClient.set(keyFor(adminId), JSON.stringify(action), { EX: TTL_SECONDS });
};

export const getPendingAction = async (
    adminId: number
): Promise<PendingAdminAction | undefined> => {
    const raw = await redisClient.get(keyFor(adminId));

    if (raw === null) {
        return undefined;
    }

    try {
        return JSON.parse(raw) as PendingAdminAction;
    } catch {
        // Corrupt/legacy value: treat as absent and clean up.
        await redisClient.del(keyFor(adminId));
        return undefined;
    }
};

export const deletePendingAction = async (adminId: number): Promise<boolean> => {
    return (await redisClient.del(keyFor(adminId))) > 0;
};
