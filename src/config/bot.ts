// bot.ts
import https from "https";
import { Telegraf } from "telegraf";
import { env } from "./env.js";

const agent = new https.Agent({ family: 4, keepAlive: true });

export const bot: Telegraf = new Telegraf(env.TELEGRAM_BOT_TOKEN, {
    telegram: { agent },
});
