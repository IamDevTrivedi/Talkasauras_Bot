// index.js : Main entry point for the application

import express from "express";
import config from "./config.js";
import connectDB from "./db/connect.db.js";
import logger from "./utils/logger.utils.js";

await connectDB();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    logger.get({
        message: `Home Page`,
        req,
    });

    res.send("Talkasauras Server is running!");
});

import healthRouter from "./routes/health.route.js";
app.use("/health", healthRouter);

import { Telegraf } from "telegraf";
import { initBot } from "./utils/telegram.utils.js";
import { initJobs } from "./utils/jobs.utils.js";

const bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);
initBot(bot);
initJobs({ bot });

bot.launch()
    .then(() => {
        logger.info({
            message: `Telegram bot is running`,
        });
    })
    .catch((error) => {
        logger.error({
            message: `Error starting Telegram bot: ${error.message}`,
        });
    });

app.listen(config.PORT || 8080, () => {
    logger.info({
        message: `Server is running on port ${config.PORT || 8080}`,
    });
    logger.info({
        message: `Application started successfully`,
    });
});
