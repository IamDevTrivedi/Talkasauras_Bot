import config from "../config.js";
const isLoggingEnabled = config.LOGGING_ENABLED ?? true;

const formatHeader = (type) => {
    const timestamp = new Date().toISOString();
    console.group(`[${type}] ➤ ${timestamp}`);
};

const formatFooter = () => {
    console.groupEnd();
    console.log("=".repeat(50) + "\n");
};

const logger = {
    info({ message }) {
        if (!isLoggingEnabled) return;

        formatHeader("INFO");
        console.log("MESSAGE:", message);
        formatFooter();
    },

    error({ message, error }) {
        if (!isLoggingEnabled) return;

        formatHeader("ERROR");
        console.log("MESSAGE:", message);
        if (error) {
            console.log("ERROR DETAILS:", error.message || "No message");
            console.log("STACK TRACE:", error.stack || "No stack trace");
        }
        formatFooter();
    },

    warn({ message }) {
        if (!isLoggingEnabled) return;

        formatHeader("WARN");
        console.log("MESSAGE:", message);
        formatFooter();
    },

    get({ message, req }) {
        if (!isLoggingEnabled) return;

        const endpoint = req?.originalUrl || req?.url || "Unknown";
        const { params = {}, body = {} } = req || {};

        formatHeader("GET");
        console.log("MESSAGE:", message);
        console.log("ENDPOINT:", endpoint);
        if (Object.keys(body).length) {
            console.log("REQUEST BODY:", body);
        }
        if (Object.keys(params).length) {
            console.log("QUERY PARAMETERS:", params);
        }
        formatFooter();
    },

    post({ message, req }) {
        if (!isLoggingEnabled) return;

        const endpoint = req?.originalUrl || req?.url || "Unknown";
        const { body = {} } = req || {};

        formatHeader("POST");
        console.log("MESSAGE:", message);
        console.log("ENDPOINT:", endpoint);
        if (Object.keys(body).length) {
            console.log("REQUEST BODY:", body);
        }
        formatFooter();
    },

    ping({ message = "Ping", endpoint }) {
        if (!isLoggingEnabled) return;

        formatHeader("PING");
        console.log("MESSAGE:", message);
        console.log("ENDPOINT:", endpoint || "Not specified");
        formatFooter();
    },
};

export default logger;
