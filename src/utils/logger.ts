import pino from "pino";
import path from "path";
import { env } from "@config/env";

const logDir = path.join(process.cwd(), "logs");
const isProd = env.isProduction;

const pinoInstance = pino(
    {
        level: isProd ? "info" : "debug",
        timestamp: pino.stdTimeFunctions.isoTime,
    },
    pino.transport({
        targets: [
            {
                target: "pino-pretty",
                level: "debug",
                options: {
                    colorize: true,
                    translateTime: "SYS:standard",
                    ignore: "pid,hostname",
                },
            },

            {
                target: "pino/file",
                level: "info",
                options: {
                    destination: path.join(logDir, `app-${env.NODE_ENV}.log`),
                    mkdir: true,
                },
            },

            {
                target: "pino/file",
                level: "error",
                options: {
                    destination: path.join(logDir, `error-${env.NODE_ENV}.log`),
                    mkdir: true,
                },
            },
        ],
    })
);

function mergeMeta(...meta: unknown[]): Record<string, unknown> {
    return meta.reduce<Record<string, unknown>>((acc, item, index) => {
        if (item instanceof Error) {
            acc["error"] = { message: item.message, stack: item.stack, name: item.name };
        } else if (typeof item === "object" && item !== null) {
            Object.assign(acc, item);
        } else {
            acc[`meta_${index}`] = item;
        }
        return acc;
    }, {});
}

export const logger = {
    info: (msg: string, ...meta: unknown[]) => pinoInstance.info(mergeMeta(...meta), msg),
    error: (msg: string, ...meta: unknown[]) => pinoInstance.error(mergeMeta(...meta), msg),
    warn: (msg: string, ...meta: unknown[]) => pinoInstance.warn(mergeMeta(...meta), msg),
    debug: (msg: string, ...meta: unknown[]) => pinoInstance.debug(mergeMeta(...meta), msg),
    fatal: (msg: string, ...meta: unknown[]) => pinoInstance.fatal(mergeMeta(...meta), msg),
    trace: (msg: string, ...meta: unknown[]) => pinoInstance.trace(mergeMeta(...meta), msg),
};
