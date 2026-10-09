import express from "express";
import { getCompany, getCompanyById, registerCompany, updateCompany } from "../controllers/company.controller.js";
import { requireAuth, requireRecruiter } from "../middlewares/isAuthenticated.js";
import { companyLogoUpload } from "../middlewares/mutler.js";
import { requireCompanyOwnership } from "../middlewares/ownership.js";
import { validate } from "../middlewares/validate.js";
import { createCompanySchema, idParamSchema, updateCompanySchema } from "../validators/schemas.js";

const router = express.Router();

router.post("/register", requireAuth, requireRecruiter, validate(createCompanySchema), registerCompany);
router.get("/get", requireAuth, requireRecruiter, getCompany);
router.get("/get/:id", requireAuth, requireRecruiter, validate(idParamSchema), requireCompanyOwnership(), getCompanyById);
router.put("/update/:id", requireAuth, requireRecruiter, ...companyLogoUpload, validate(updateCompanySchema), requireCompanyOwnership(), updateCompany);

export default router;
