import { Ollama } from "ollama";
import { env } from "./env.js";
import { logger } from "@/utils/logger.js";

export let ollama: Ollama | null = null;

export const connectOllama = () => {
    if (ollama) return;

    ollama = new Ollama({
        host: env.OLLAMA.HOST,
        headers: {
            Authorization: `Bearer ${env.OLLAMA.API_KEY}`,
        },
    });

    logger.info(`Connected to Ollama host: ${env.OLLAMA.HOST}`);
};
