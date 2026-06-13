import { DEFAULT_FEEDBACK_LIMIT, MAX_FEEDBACK_LIMIT } from "./constants.js";

const normalize = (value: string): string => value.trim().toLowerCase();

const getCommandArgs = (text?: string): string[] => {
    if (!text) {
        return [];
    }

    return text.trim().split(/\s+/).slice(1);
};

const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) {
        return text;
    }

    return `${text.slice(0, maxLength)}...`;
};

const formatDuration = (durationMs: number): string => {
    const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    return `${days}d ${hours}h ${minutes}m`;
};

const formatBytes = (bytes: number): string => {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    const units = ["KB", "MB", "GB", "TB"];
    let value = bytes / 1024;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
    }

    return `${value.toFixed(1)} ${units[unitIndex]}`;
};

const parseFeedbackLimit = (rawLimit?: string): number => {
    if (!rawLimit) {
        return DEFAULT_FEEDBACK_LIMIT;
    }

    const parsed = Number(rawLimit);

    if (!Number.isFinite(parsed) || parsed < 1) {
        return DEFAULT_FEEDBACK_LIMIT;
    }

    return Math.min(Math.floor(parsed), MAX_FEEDBACK_LIMIT);
};

export { normalize, getCommandArgs, truncateText, formatDuration, formatBytes, parseFeedbackLimit };
