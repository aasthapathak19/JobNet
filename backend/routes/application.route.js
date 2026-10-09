import express from "express";
import { applyJob, getApplicants, getAppliedJobs, updateStatus } from "../controllers/application.controller.js";
import { requireAuth, requireRecruiter, requireStudent } from "../middlewares/isAuthenticated.js";
import { requireApplicationJobOwnership, requireJobOwnership } from "../middlewares/ownership.js";
import { validate } from "../middlewares/validate.js";
import { idParamSchema, updateApplicationStatusSchema } from "../validators/schemas.js";

const router = express.Router();

router.post("/apply/:id", requireAuth, requireStudent, validate(idParamSchema), applyJob);
router.get("/get", requireAuth, requireStudent, getAppliedJobs);
router.get("/:id/applicants", requireAuth, requireRecruiter, validate(idParamSchema), requireJobOwnership(), getApplicants);
router.patch("/status/:id", requireAuth, requireRecruiter, validate(updateApplicationStatusSchema), requireApplicationJobOwnership(), updateStatus);
router.post("/status/:id/update", requireAuth, requireRecruiter, validate(updateApplicationStatusSchema), requireApplicationJobOwnership(), updateStatus);

export default router;
