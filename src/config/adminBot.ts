import { Telegraf } from "telegraf";
import { env } from "./env.js";

export const adminBot: Telegraf = new Telegraf(env.TELEGRAM_BOT_TOKEN_INTERNAL);
