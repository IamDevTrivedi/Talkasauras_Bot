import { geminiTextResponse } from "./gemini2.utils.js";
import Feedback from "../models/feedback.model.js";
import Chat from "../models/chat.model.js";
import logger from "./logger.utils.js";
import config from "../config.js";
import { handleReminder } from "./chrono.utils.js";

const createUser = async (ctx) => {
    let chat = await Chat.findOne({ telegramId: ctx.from.id });

    if (!chat) {
        chat = new Chat({
            firstName: ctx.from.first_name,
            userName: ctx.from.username,
            telegramId: ctx.from.id,
        });
    }

    // NOTE : redis can be implemented here to store the user data temporarily
    await chat.save();
};

async function initBot(bot) {
    {
        try {
            await bot.telegram.setMyCommands([
                {
                    command: "start",
                    description: "Initialize and start interacting with the bot",
                },
                { command: "help", description: "Display the help documentation" },
                {
                    command: "temporary_start",
                    description: "Initiate a temporary chat session",
                },
                {
                    command: "temporary_end",
                    description: "Terminate the temporary chat session",
                },
                {
                    command: "remindme",
                    description: "Set a reminder for a specific time",
                },
                {
                    command: "current_mode",
                    description: "Display the current operational mode of the bot",
                },
                { command: "clear", description: "Erase your chat history" },
                {
                    command: "feedback",
                    description: "Submit feedback to the developer",
                },
                { command: "contact", description: "Get in touch with the developer" },
                { command: "about", description: "View information about this bot" },
            ]);
        } catch (error) {
            logger.error({
                message: "An error occurred while configuring bot commands.",
                error: error.message,
            });
        }
    }

    bot.command("about", async (ctx) => {
        try {
            await createUser(ctx);
            const aboutText =
                "Welcome to Talkasauras — a smart and intuitive AI assistant powered by Google's Gemini AI. " +
                "This platform is designed to offer intelligent support, personalized guidance, and engaging conversational experiences tailored to each user.\n\n" +
                "The project was developed by Dev Trivedi. To learn more about his work and view his portfolio, please refer to the links below.";

            await ctx.reply(aboutText, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "🔗 LinkedIn",
                                url: "https://in.linkedin.com/in/contact-devtrivedi",
                            },
                            { text: "💻 GitHub", url: "https://github.com/IamDevTrivedi" },
                        ],
                        [{ text: "🌐 PortFolio", url: "https://dev-trivedi.me" }],
                    ],
                },
            });
        } catch (error) {
            logger.error({
                message: "An error occurred while processing the About command.",
                error: error.message,
            });

            await ctx.reply(
                "Apologies for the inconvenience. We are currently unable to process your request. Please try again shortly."
            );
        }
    });

    const unsupportedTypes = [
        "sticker",
        "photo",
        "video",
        "audio",
        "document",
        "voice",
        "location",
        "contact",
        "poll",
        "venue",
    ];

    unsupportedTypes.forEach((type) => {
        bot.on(type, async (ctx) => {
            try {
                await createUser(ctx);
                await ctx.reply(
                    `Unfortunately, messages in the ${
                        type[0].toUpperCase() + type.slice(1)
                    } format are not supported at the moment. Please feel free to send a text-based query — we're happy to help!`
                );
            } catch (error) {
                logger.error({
                    message: `An error occurred while processing a message of type: ${type}`,
                    error: error.message,
                });
                await ctx.reply(
                    "We apologize for the inconvenience. The system is temporarily unable to process your request. Please try again shortly."
                );
            }
        });
    });

    bot.start(async (ctx) => {
        try {
            await createUser(ctx);
            const name = ctx.from.first_name || "Valued User";
            const welcomeText =
                `Greetings, ${name}! Welcome to Talkasauras — a powerful AI assistant powered by Google's Gemini AI. ` +
                `This platform is here to help you with a wide range of tasks and questions.\n\n` +
                `To discover all available features, simply use the /help command.`;

            await ctx.reply(welcomeText);
        } catch (error) {
            logger.error({
                message: "An error occurred while handling the start command.",
                error: error.message,
            });

            await ctx.reply(
                "We’re sorry for the inconvenience. The system is currently unable to process your request. Please try again shortly."
            );
        }
    });

    bot.command("help", async (ctx) => {
        try {
            await createUser(ctx);
            const helpText =
                "Below is a list of available commands to assist you in navigating the system:\n\n" +
                [
                    "🟢 /start — Initiate a conversation with Talkasauras.",
                    "❓ /help — View this comprehensive help guide.",
                    "🧹 /clear — Clear your current interaction history.",
                    "🕒 /temporary_start — Begin a temporary chat session in which messages are not stored.",
                    "⏹️ /temporary_end — End the temporary session without saving any conversation data.",
                    "🔄 /current_mode — Display the system's current operational mode.",
                    "📢 /about — Learn more about this platform and its developer.",
                    "📨 /contact — Reach out directly to the development team.",
                    "📝 /feedback — Share your feedback or suggestions to help improve the system.",
                    "⏰ /remindme — Send only /remindme, then reply to the newly sent message — Done, you're set.",
                    "If you require assistance at any time, please enter /help to revisit this guide. The system is here to support you.",
                ].join("\n\n");

            await ctx.reply(helpText);
        } catch (error) {
            logger.error({
                message: "An error occurred while processing the help command.",
                error: error.message,
            });

            await ctx.reply(
                "We apologize for the inconvenience. The system is temporarily unable to fulfill your request. Please try again shortly."
            );
        }
    });

    bot.command("contact", async (ctx) => {
        try {
            await createUser(ctx);
            const contactText =
                "Thank you for your interest in connecting with the development team.\n" +
                "You can reach out to Dev Trivedi through the following platforms:";

            await ctx.reply(contactText, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "🔗 LinkedIn",
                                url: "https://in.linkedin.com/in/contact-devtrivedi",
                            },
                            { text: "💻 GitHub", url: "https://github.com/IamDevTrivedi" },
                        ],
                        [{ text: "🌐 PortFolio", url: "https://dev-trivedi.me" }],
                    ],
                },
            });
        } catch (error) {
            logger.error({
                message: "An error occurred while processing the contact command.",
                error: error.message,
            });

            await ctx.reply(
                "We’re sorry for the inconvenience. The system is currently unable to process your request. Please try again shortly."
            );
        }
    });

    bot.command("feedback", async (ctx) => {
        try {
            await createUser(ctx);
            await ctx.reply(
                "We greatly appreciate your feedback on Talkasauras. Kindly share your thoughts to help us continuously improve the quality of our services.",
                {
                    reply_markup: {
                        force_reply: true,
                        selective: true,
                    },
                }
            );
        } catch (error) {
            logger.error({
                message: "An error occurred while processing the feedback command.",
                error: error.message,
            });

            await ctx.reply(
                "We’re sorry for the inconvenience. The system is currently unable to process your request. Please try again shortly."
            );
        }
    });

    bot.command("temporary_start", async (ctx) => {
        try {
            await createUser(ctx);
            let user = await Chat.findOne({ telegramId: ctx.from.id });

            user.isTemporary = true;
            user.temporaryChatHistory = [];

            await user.save();

            await ctx.reply(
                "A temporary chat session has been successfully initiated.\n\n" +
                    "Please note that messages exchanged during this session will not be stored permanently in our database. " +
                    "The session will automatically expire after 5 minutes of inactivity.\n\n" +
                    "You may now proceed with your queries."
            );
        } catch (error) {
            logger.error({
                message: "An error occurred while initiating a temporary session.",
                error: error.message,
            });

            await ctx.reply(
                "We apologize for the inconvenience. The system is currently unable to initiate a temporary session. Please try again shortly."
            );
        }
    });

    bot.command("temporary_end", async (ctx) => {
        try {
            await createUser(ctx);
            let user = await Chat.findOne({ telegramId: ctx.from.id });

            user.isTemporary = false;
            user.temporaryChatHistory = [];

            await user.save();

            await ctx.reply(
                "Your temporary chat session has ended successfully.\n\n" +
                    "All communications from this session have been permanently discarded. " +
                    "You can start a new temporary session anytime using the /temporary_start command."
            );
        } catch (error) {
            logger.error({
                message: "An error occurred while concluding the temporary session.",
                error: error.message,
            });

            await ctx.reply(
                "We apologize for the inconvenience. The system is currently unable to terminate your temporary session. Please try again shortly."
            );
        }
    });

    bot.command("current_mode", async (ctx) => {
        try {
            await createUser(ctx);
            let user = await Chat.findOne({ telegramId: ctx.from.id });

            let reply;

            const now = Date.now();
            const timeSinceLastMessage = now - user.lastMessageAt;
            const isTemporary = user.isTemporary && timeSinceLastMessage < 1000 * 60 * 5;

            if (isTemporary) {
                reply =
                    "You are currently in a temporary chat session. Messages exchanged during this session will not be stored permanently in our database.\n\n" +
                    "To end this session, please use the /temporary_end command.";
            } else {
                user.isTemporary = false;
                user.temporaryChatHistory = [];
                reply =
                    "You are currently in a standard chat session. Your messages are securely stored to ensure continuity across interactions.\n\n" +
                    "To switch to a temporary session, please use the /temporary_start command.";
            }

            await user.save();
            await ctx.reply(reply);
        } catch (error) {
            logger.error({
                message: "An error occurred while retrieving session information.",
                error: error.message,
            });

            await ctx.reply(
                "We apologize for the inconvenience. The system is currently unable to retrieve your session details. Please try again shortly."
            );
        }
    });

    bot.command("clear", async (ctx) => {
        try {
            await createUser(ctx);
            let user = await Chat.findOne({ telegramId: ctx.from.id });

            user.chatHistory = [];
            user.isTemporary = false;
            user.temporaryChatHistory = [];

            await user.save();
            await ctx.reply(
                "All data has been cleared. You are now in standard chat mode.\n\n" +
                    "To switch to temporary chat mode, use the /temporary_start command.\n\n" +
                    "Your conversation history has been removed, and you can start a new interaction."
            );
        } catch (error) {
            logger.error({
                message: "An error occurred while clearing the conversation history.",
                error: error.message,
            });

            await ctx.reply(
                "We apologize for the inconvenience. The system is currently unable to clear your conversation history. Please try again shortly."
            );
        }
    });

    bot.command("remindme", async (ctx) => {
        try {
            await createUser(ctx);

            await ctx.reply("Please type the reminder message 👇", {
                reply_markup: {
                    force_reply: true,
                    selective: true,
                },
            });
        } catch (error) {
            console.error("Error in /remindme command:", error);
            await ctx.reply("❌ Something went wrong while setting your reminder.");
        }
    });

    bot.command("sendUpdateToAllUsers", async (ctx) => {
        try {
            await createUser(ctx);
            if (config.ADMIN_ARRAY.find((admin) => admin === ctx.from.username) === undefined) {
                logger.warn({
                    message: `Unauthorized access attempt by user ${ctx.from.username} to send updates.`,
                    userId: ctx.from.id,
                });
                await ctx.reply(
                    "You don't have permission to use this command. This feature is restricted to administrators only."
                );
                return;
            }

            await ctx.reply(
                "UPDATES: Please reply to this message with the update you want to send to all users.",
                {
                    reply_markup: {
                        force_reply: true,
                        selective: true,
                    },
                }
            );
        } catch (error) {
            logger.error({
                message: "An error occurred while processing the sendUpdateToAllUsers command.",
                error: error.message,
            });
            await ctx.reply(
                "We’re sorry for the inconvenience. The system is currently unable to process your request. Please try again shortly."
            );
        }
    });

    function isAdminUpdateCommand(ctx) {
        return (
            ctx.message.reply_to_message &&
            ctx.message.reply_to_message.text.includes(
                "UPDATES: Please reply to this message with the update you want to send to all users."
            ) &&
            config.ADMIN_ARRAY.includes(ctx.from.username)
        );
    }

    function isFeedbackReply(ctx) {
        return (
            ctx.message.reply_to_message &&
            ctx.message.reply_to_message.text.includes(
                "We greatly appreciate your feedback on Talkasauras"
            )
        );
    }

    function isReminderReply(ctx) {
        return (
            ctx.message.reply_to_message &&
            ctx.message.reply_to_message.text.includes("Please type the reminder message 👇")
        );
    }

    async function handleAdminUpdate(ctx) {
        try {
            const updateMessage = ctx.message.text;
            const users = await Chat.find({});

            if (!users.length) {
                await ctx.reply("No users found in the database to send updates to.");
                return;
            }

            await ctx.reply(`Sending updates to ${users.length} users. This may take some time...`);

            const formattedMessage = `🔔 IMPORTANT UPDATE FROM TALKASAURAS TEAM:\n\n${updateMessage}\n\n- Dev Trivedi, Talkasauras Team`;
            let successCount = 0;

            for (const user of users) {
                try {
                    await bot.telegram.sendMessage(user.telegramId, formattedMessage);
                    successCount++;
                    await new Promise((resolve) => setTimeout(resolve, 100));
                } catch (err) {
                    logger.error({
                        message: `Failed to send update to user ${user.telegramId}`,
                        error: err,
                    });
                }
            }

            await ctx.reply(
                `Update broadcast complete! Message successfully sent to ${successCount} of ${users.length} users.`
            );
        } catch (updateError) {
            logger.error({
                message: "Error sending mass update",
                error: updateError.message,
            });
            await ctx.reply(
                "An error occurred while attempting to broadcast your update. Please try again later."
            );
        }
    }

    async function handleFeedback(ctx) {
        try {
            const newFeedback = new Feedback({
                telegramId: ctx.from.id,
                feedback: ctx.message.text,
            });

            await newFeedback.save();
            await ctx.reply(
                "We sincerely appreciate your valuable feedback. Your input plays a key role in our continuous efforts to enhance Talkasauras."
            );
        } catch (err) {
            logger.error({
                message: "Error saving feedback",
                error: err,
            });
            await ctx.reply(
                "Thank you for your feedback. While we encountered a technical issue processing your submission, we value your input and will address this matter promptly."
            );
        }
    }

    async function handleDefaultResponse(ctx) {
        const payload = {
            telegramId: ctx.from.id,
            firstName: ctx.from.first_name,
            userName: ctx.from.username,
            message: ctx.message.text,
            ctx: ctx,
        };

        let response;
        try {
            response = await geminiTextResponse(payload);
        } catch (responseError) {
            logger.error({
                message: "Error getting Gemini response",
                error: responseError.message,
            });
            response =
                "We apologize for the inconvenience. Our system is currently experiencing technical difficulties. Please try your inquiry again shortly.";
        }

        if (!response) {
            response =
                "We apologize for the inconvenience. Our system is currently experiencing technical difficulties. Please try your inquiry again shortly.";
        }

        await ctx.reply(response, {
            reply_to_message_id: ctx.message.message_id,
        });
    }

    bot.on("text", async (ctx) => {
        try {
            if (isAdminUpdateCommand(ctx)) {
                await handleAdminUpdate(ctx);
                return;
            }

            if (isFeedbackReply(ctx)) {
                await handleFeedback(ctx);
                return;
            }

            if (isReminderReply(ctx)) {
                await handleReminder(ctx);
                return;
            }

            await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
            await handleDefaultResponse(ctx);
        } catch (error) {
            await ctx.reply(
                "We apologize for the inconvenience. Our system is currently experiencing technical difficulties. Please attempt your inquiry again shortly."
            );
            logger.error({
                message: "Error processing text message",
                error: error.message,
            });
        }
    });

    bot.catch((error, ctx) => {
        logger.error({ message: "Global bot error", error: error.message });

        if (ctx && ctx.reply) {
            ctx.reply(
                "We apologize for the inconvenience. Our system has encountered an unexpected issue. Our technical team has been notified and is working diligently to resolve it. Please try again shortly."
            ).catch((e) => {
                logger.error({
                    message: "Critical error: Failed to send global error message",
                    error: e.message,
                });
            });
        }
    });
}

export { initBot, createUser };
