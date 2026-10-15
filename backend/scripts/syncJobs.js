import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";
import { syncJobsFromJSearch } from "../services/jobSync.service.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/jobnet";

async function runCliSync() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB:", MONGO_URI);

        let recruiter = await User.findOne({ role: "recruiter" });
        if (!recruiter) {
            console.error("No recruiter user found in database. Please register a recruiter first.");
            process.exit(1);
        }

        // Parse args e.g. --query="React in Bengaluru" --key=xyz
        const args = process.argv.slice(2);
        let query = "Software Developer in Bengaluru, India";
        let apiKey = process.env.RAPIDAPI_KEY || "";

        for (const arg of args) {
            if (arg.startsWith("--query=")) query = arg.replace("--query=", "");
            if (arg.startsWith("--key=")) apiKey = arg.replace("--key=", "");
        }

        console.log(`Starting job sync for query: "${query}"...`);
        const result = await syncJobsFromJSearch({
            apiKey,
            query,
            userId: recruiter._id,
            numPages: 1,
            country: "in",
        });

        console.log("\nSync Result:", result);
    } catch (error) {
        console.error("Sync failed:", error.message || error);
    } finally {
        await mongoose.disconnect();
        console.log("Database connection closed");
    }
}

runCliSync();
