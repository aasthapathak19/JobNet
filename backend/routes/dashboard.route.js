import express from "express";
import { candidateDashboard, recruiterDashboard } from "../controllers/dashboard.controller.js";
import { requireAuth, requireRecruiter, requireStudent } from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.get("/candidate", requireAuth, requireStudent, candidateDashboard);
router.get("/recruiter", requireAuth, requireRecruiter, recruiterDashboard);

export default router;
