import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const requireAuth = asyncHandler(async (req, _res, next) => {
    const token = req.cookies?.[env.COOKIE_NAME];
    if (!token) throw new AppError("Authentication is required", 401, "AUTH_REQUIRED");

    let decoded;
    try {
        decoded = jwt.verify(token, env.jwtSecret);
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new AppError("Your session has expired. Please sign in again", 401, "TOKEN_EXPIRED");
        }
        throw new AppError("Your session is invalid. Please sign in again", 401, "INVALID_TOKEN");
    }

    const user = await User.findById(decoded.userId).select("fullname email role profile").lean();
    if (!user) throw new AppError("The account for this session no longer exists", 401, "ACCOUNT_NOT_FOUND");

    req.user = user;
    req.id = user._id.toString();
    next();
});

export const requireRole = (...roles) => (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return next(new AppError("You do not have permission to perform this action", 403, "FORBIDDEN"));
    }
    next();
};

export const requireStudent = requireRole("student");
export const requireRecruiter = requireRole("recruiter");

export default requireAuth;
