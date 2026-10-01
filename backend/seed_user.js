import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/jobnet");
        console.log("Connected to MongoDB");

        const hashedPassword = await bcrypt.hash("password123", 10);

        const student = await User.create({
            fullname: "Test Student",
            email: "student@test.com",
            phoneNumber: 1234567890,
            password: hashedPassword,
            role: "student",
            profile: {
                bio: "I am a test student",
                skills: ["React", "Nodejs"]
            }
        });
        console.log("Created student:", student.email);

        const recruiter = await User.create({
            fullname: "Test Recruiter",
            email: "recruiter@test.com",
            phoneNumber: 9876543210,
            password: hashedPassword,
            role: "recruiter",
            profile: {
                bio: "I am a test recruiter"
            }
        });
        console.log("Created recruiter:", recruiter.email);

        mongoose.connection.close();
    } catch (error) {
        console.error("Error seeding users:", error);
        mongoose.connection.close();
    }
};

seedUsers();
