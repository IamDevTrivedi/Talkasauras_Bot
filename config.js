// Environment variables for the application

import dotenv from 'dotenv';
dotenv.config();

const config = {
    GOOGLE_GEMINI_API_KEY: process.env.GOOGLE_GEMINI_API_KEY,
    ENVIRONMENT: process.env.ENVIRONMENT || 'development',
    PORT_PROD: process.env.PORT_PROD,
    PORT_DEV: process.env.PORT_DEV,
    PORT: process.env.ENVIRONMENT === 'production' ? process.env.PORT_PROD : process.env.PORT_DEV,
    MONGODB_URL: process.env.MONGODB_URL,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    WEBHOOK_URL: process.env.WEBHOOK_URL,
    LOGGING_ENABLED: process.env.LOGGING_ENABLED === 'true',
    ADMIN_USERNAME: process.env.ADMIN_USERNAME
};


export default config;