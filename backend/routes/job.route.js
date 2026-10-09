import express from "express";
import { deleteJob, getAdminJobs, getAllJobs, getJobById, getSavedJobs, postJob, saveJob, unsaveJob, updateJob } from "../controllers/job.controller.js";
import { requireAuth, requireRecruiter, requireStudent } from "../middlewares/isAuthenticated.js";
import { requireCompanyOwnership, requireJobOwnership } from "../middlewares/ownership.js";
import { validate } from "../middlewares/validate.js";
import { createJobSchema, idParamSchema, jobSearchSchema, updateJobSchema } from "../validators/schemas.js";

const router = express.Router();

router.post("/post", requireAuth, requireRecruiter, validate(createJobSchema), requireCompanyOwnership({ source: "body", key: "companyId" }), postJob);
router.get("/get", validate(jobSearchSchema), getAllJobs);
router.get("/getadminjobs", requireAuth, requireRecruiter, getAdminJobs);
router.get("/saved", requireAuth, requireStudent, getSavedJobs);
router.post("/:id/save", requireAuth, requireStudent, validate(idParamSchema), saveJob);
router.delete("/:id/save", requireAuth, requireStudent, validate(idParamSchema), unsaveJob);
router.put("/:id", requireAuth, requireRecruiter, validate(updateJobSchema), requireJobOwnership(), updateJob);
router.delete("/:id", requireAuth, requireRecruiter, validate(idParamSchema), requireJobOwnership(), deleteJob);
router.get("/get/:id", validate(idParamSchema), getJobById);

export default router;
