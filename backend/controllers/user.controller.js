import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { storeUploadedFile } from "../utils/fileStorage.js";

const publicUser = (user) => {
    const value = user.toObject ? user.toObject() : { ...user };
    delete value.password;
    return value;
};

const cookieOptions = {
    httpOnly: true,
    secure: env.COOKIE_SECURE || env.NODE_ENV === "production",
    sameSite: env.COOKIE_SAME_SITE,
    maxAge: env.COOKIE_MAX_AGE_MS,
    path: "/",
};

export const register = asyncHandler(async (req, res) => {
    const { fullname, email, phoneNumber, password, role } = req.body;
    const existingUser = await User.exists({ email });
    if (existingUser) throw new AppError("An account with this email already exists", 409, "EMAIL_IN_USE");

    const user = await User.create({
        fullname,
        email,
        phoneNumber,
        password: await bcrypt.hash(password, 12),
        role,
        profile: { profilePhoto: await storeUploadedFile(req.file, "profile-images") || "" },
    });

    res.status(201).json({ message: "Account created successfully", success: true, user: publicUser(user) });
});

export const login = asyncHandler(async (req, res) => {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password)) || (role && role !== user.role)) {
        throw new AppError("Email, password, or role is incorrect", 401, "INVALID_CREDENTIALS");
    }

    const token = jwt.sign({ userId: user._id.toString() }, env.jwtSecret, { expiresIn: env.JWT_EXPIRES_IN });
    res.cookie(env.COOKIE_NAME, token, cookieOptions).json({
        message: `Welcome back ${user.fullname}`,
        user: publicUser(user),
        success: true,
    });
});

export const logout = asyncHandler(async (_req, res) => {
    res.clearCookie(env.COOKIE_NAME, { ...cookieOptions, maxAge: undefined }).json({
        message: "Logged out successfully",
        success: true,
    });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.id);
    if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
    res.json({ success: true, user: publicUser(user) });
});

export const updateProfile = asyncHandler(async (req, res) => {
    const { fullname, email, phoneNumber, bio, skills } = req.body;
    const user = await User.findById(req.id);
    if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");

    if (email && email !== user.email) {
        const emailOwner = await User.exists({ email, _id: { $ne: user._id } });
        if (emailOwner) throw new AppError("An account with this email already exists", 409, "EMAIL_IN_USE");
    }

    if (fullname !== undefined) user.fullname = fullname;
    if (email !== undefined) user.email = email;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (bio !== undefined) user.profile.bio = bio;
    if (skills !== undefined) user.profile.skills = skills;
    if (req.file) {
        user.profile.resume = await storeUploadedFile(req.file, "resumes");
        user.profile.resumeOriginalName = req.file.originalname;
    }

    await user.save();
    res.json({ message: "Profile updated successfully", user: publicUser(user), success: true });
});

export const deleteResume = asyncHandler(async (req, res) => {
    const user = await User.findById(req.id);
    if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
    user.profile.resume = "";
    user.profile.resumeOriginalName = "";
    await user.save();
    res.json({ message: "Resume removed", user: publicUser(user), success: true });
});

export const updateProfilePhoto = asyncHandler(async (req, res) => {
    if (!req.file) throw new AppError("Choose a profile image to upload", 400, "FILE_REQUIRED");
    const user = await User.findById(req.id);
    if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
    user.profile.profilePhoto = await storeUploadedFile(req.file, "profile-images");
    await user.save();
    res.json({ message: "Profile photo updated", user: publicUser(user), success: true });
});
