import https from "https";
import { Telegraf } from "telegraf";
import { env } from "@/config/env.js";

const agent = new https.Agent({ family: 4, keepAlive: true });

export const adminBot: Telegraf = new Telegraf(env.TELEGRAM_BOT_TOKEN_INTERNAL, {
    telegram: { agent },
});
