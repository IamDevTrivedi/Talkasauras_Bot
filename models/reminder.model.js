import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
    {
        telegramId: {
            type: String,
            required: true,
        },
        reminderMessage: {
            type: String,
            required: true,
        },
        reminderTime: {
            type: Date,
            required: true,
        },
        sent: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    { timestamps: true }
);

const Reminder = mongoose.model("Reminder", reminderSchema);

export default Reminder;
