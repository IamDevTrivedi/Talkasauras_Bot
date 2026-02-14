import { Ollama } from "ollama";
import { env } from "./env.js";
import { logger } from "@/utils/logger.js";

export let ollama: Ollama | null = null;

export const connectOllama = () => {
    if (ollama) return;

    switch (env.OLLAMA.PROVIDER) {
        case "LOCAL":
            ollama = new Ollama();
            break;

        case "CLOUD":
            ollama = new Ollama({
                host: env.OLLAMA.HOSTS.CLOUD,
                headers: { Authorization: "Bearer " + env.OLLAMA.API_KEY },
            });
            break;

        case "HF":
            ollama = new Ollama({
                host: env.OLLAMA.HOSTS.HF,
                headers: { Authorization: "Bearer " + env.OLLAMA.API_KEY },
            });
            break;
        case "MOCK":
            ollama = new Ollama({
                host: env.OLLAMA.HOSTS.MOCK,
            });
            break;
    }

    logger.info(`Connected to Ollama provider: ${env.OLLAMA.PROVIDER}`);
};
