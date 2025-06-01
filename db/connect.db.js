import mongoose from "mongoose";
import logger from "../utils/logger.utils.js";
import config from "../config.js";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.MONGODB_URL);
        logger.info({ message: `MongoDB Database: ${conn.connection.name}` });

    } catch (error) {
        logger.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

export default connectDB;
