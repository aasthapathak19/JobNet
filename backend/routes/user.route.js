import express from "express";
import { rateLimit } from "express-rate-limit";
import { env } from "../config/env.js";
import { deleteResume, getCurrentUser, login, logout, register, updateProfile, updateProfilePhoto } from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/isAuthenticated.js";
import { profileImageUpload, resumeUpload } from "../middlewares/mutler.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema, registerSchema, updateProfileSchema } from "../validators/schemas.js";

const router = express.Router();
const authLimiter = rateLimit({ windowMs: env.RATE_LIMIT_WINDOW_MS, limit: env.AUTH_RATE_LIMIT_MAX, standardHeaders: "draft-8", legacyHeaders: false });

router.post("/register", authLimiter, ...profileImageUpload, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, getCurrentUser);
router.post("/profile/update", requireAuth, ...resumeUpload, validate(updateProfileSchema), updateProfile);
router.post("/profile/photo", requireAuth, ...profileImageUpload, updateProfilePhoto);
router.delete("/profile/resume", requireAuth, deleteResume);

export default router;
