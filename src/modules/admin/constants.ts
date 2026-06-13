const APP_START_TIME = Date.now();
const MAX_BROADCAST_LENGTH = 4096;
const BROADCAST_BATCH_SIZE = 400;
const DEFAULT_FEEDBACK_LIMIT = 5;
const MAX_FEEDBACK_LIMIT = 20;

type BroadcastAudience = "subscribed" | "all" | "active24h";

type PendingAdminAction = {
    type: "broadcast";
    audience: BroadcastAudience;
    message?: string;
};

const pendingActions = new Map<number, PendingAdminAction>();

const BROADCAST_AUDIENCE_LABELS: Record<BroadcastAudience, string> = {
    subscribed: "Subscribed users",
    all: "All users",
    active24h: "Active users in last 24h (subscribed only)",
};

export {
    APP_START_TIME,
    MAX_BROADCAST_LENGTH,
    BROADCAST_BATCH_SIZE,
    DEFAULT_FEEDBACK_LIMIT,
    MAX_FEEDBACK_LIMIT,
    BroadcastAudience,
    PendingAdminAction,
    pendingActions,
    BROADCAST_AUDIENCE_LABELS,
};
