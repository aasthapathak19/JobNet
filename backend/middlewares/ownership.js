import Application from "../models/application.model.js";
import Company from "../models/company.model.js";
import Job from "../models/job.model.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const resourceId = (req, source, key) => req[source]?.[key];

export const requireCompanyOwnership = ({ source = "params", key = "id" } = {}) => asyncHandler(async (req, _res, next) => {
    const company = await Company.findById(resourceId(req, source, key));
    if (!company) throw new AppError("Company not found", 404, "COMPANY_NOT_FOUND");
    if (company.userId.toString() !== req.id) {
        throw new AppError("You can only manage your own companies", 403, "COMPANY_OWNERSHIP_REQUIRED");
    }
    req.company = company;
    next();
});

export const requireJobOwnership = ({ source = "params", key = "id" } = {}) => asyncHandler(async (req, _res, next) => {
    const job = await Job.findById(resourceId(req, source, key));
    if (!job) throw new AppError("Job not found", 404, "JOB_NOT_FOUND");
    if (job.created_by.toString() !== req.id) {
        throw new AppError("You can only manage your own jobs", 403, "JOB_OWNERSHIP_REQUIRED");
    }
    req.job = job;
    next();
});

export const requireApplicationJobOwnership = ({ source = "params", key = "id" } = {}) => asyncHandler(async (req, _res, next) => {
    const application = await Application.findById(resourceId(req, source, key)).populate({ path: "job", select: "created_by" });
    if (!application) throw new AppError("Application not found", 404, "APPLICATION_NOT_FOUND");
    if (!application.job || application.job.created_by.toString() !== req.id) {
        throw new AppError("You can only manage applicants for your own jobs", 403, "JOB_OWNERSHIP_REQUIRED");
    }
    req.application = application;
    next();
});
