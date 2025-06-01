import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({

    telegramId: {
        type: String,
        required: true,
    },

    feedback: {
        type: String,
        required: true,
    },

    checked: {
        type: Boolean,
        require: true,
        default: false
    }

}, { timestamps: true });

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;