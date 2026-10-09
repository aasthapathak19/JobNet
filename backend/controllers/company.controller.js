import Company from "../models/company.model.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { storeUploadedFile } from "../utils/fileStorage.js";

export const registerCompany = asyncHandler(async (req, res) => {
    const name = req.body.name || req.body.companyName;
    const existing = await Company.exists({ name });
    if (existing) throw new AppError("A company with this name already exists", 409, "COMPANY_EXISTS");

    const company = await Company.create({ name, userId: req.id });
    res.status(201).json({ message: "Company registered successfully", company, success: true });
});

export const getCompany = asyncHandler(async (req, res) => {
    const companies = await Company.find({ userId: req.id }).sort({ createdAt: -1 }).lean();
    res.json({ companies, success: true });
});

export const getCompanyById = asyncHandler(async (req, res) => {
    res.json({ company: req.company, success: true });
});

export const updateCompany = asyncHandler(async (req, res) => {
    const { name, companyName, description, website, location } = req.body;
    const nextName = name || companyName;

    if (nextName && nextName !== req.company.name) {
        const duplicate = await Company.exists({ name: nextName, _id: { $ne: req.company._id } });
        if (duplicate) throw new AppError("A company with this name already exists", 409, "COMPANY_EXISTS");
        req.company.name = nextName;
    }

    if (description !== undefined) req.company.description = description;
    if (website !== undefined) req.company.website = website;
    if (location !== undefined) req.company.location = location;
    if (req.file) req.company.logo = await storeUploadedFile(req.file, "company-logos");

    await req.company.save();
    res.json({ message: "Company information updated", company: req.company, success: true });
});
