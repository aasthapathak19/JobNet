import mongoose from "mongoose";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

const connectDB = async () => {
    await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    logger.info("MongoDB connected");
    return mongoose.connection;
}

export const disconnectDB = async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        logger.info("MongoDB connection closed");
    }
};

export default connectDB;
