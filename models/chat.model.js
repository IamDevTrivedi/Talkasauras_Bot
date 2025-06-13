import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["user", "model"],
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

const chatSchema = new mongoose.Schema({
    firstName: {
        type: String,
        trim: true,
    },
    userName: {
        type: String,
        trim: true,
    },
    telegramId: {
        type: Number,
        required: true,
        index: true,
        unique: true,
    },
    chatHistory: {
        type: [messageSchema],
        default: [],
    },

    lastMessageAt: {
        type: Date,
        default: Date.now,
    },

    isTemporary: {
        type: Boolean,
        default: false,
    },

    temporaryChatHistory: {
        type: [messageSchema],
        default: [],
    },
});

chatSchema.pre("save", function (next) {
    if (this.isModified("chatHistory") || this.isModified("temporaryChatHistory")) {
        this.lastMessageAt = Date.now();
    }
    next();
});

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
