import { Telegraf } from "telegraf";
import { env } from "./env.js";

export const bot: Telegraf = new Telegraf(env.TELEGRAM_BOT_TOKEN);
