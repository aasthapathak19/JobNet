import Job from "../models/job.model.js";
import SavedJob from "../models/savedJob.model.js";
import Application from "../models/application.model.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const LOCATION_ALIASES = { bangalore: "bengaluru", bengaluru: "bengaluru", gurgaon: "gurugram", gurugram: "gurugram", "delhi ncr": "delhi", delhi: "delhi" };
const normalizeLocation = (value = "") => LOCATION_ALIASES[value.trim().toLowerCase()] || value.trim().toLowerCase();
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const searchFilter = ({ keyword, location, category, salaryMin, salaryMax, experience, remoteType, jobType, skills }) => {
    const conditions = [{ $or: [{ status: "active" }, { status: { $exists: false } }] }];

    if (keyword) {
        const regex = new RegExp(escapeRegex(keyword), "i");
        conditions.push({ $or: [{ title: regex }, { category: regex }, { skills: regex }, { requirements: regex }, { description: regex }] });
    }
    if (location) conditions.push({ locationNormalized: new RegExp(escapeRegex(normalizeLocation(location)), "i") });
    if (category) conditions.push({ category: new RegExp(`^${escapeRegex(category)}$`, "i") });
    if (remoteType) conditions.push({ remoteType });
    if (jobType) conditions.push({ jobType: new RegExp(`^${escapeRegex(jobType)}$`, "i") });
    if (experience !== undefined) conditions.push({ experienceLevel: { $lte: experience } });
    if (skills?.length) conditions.push({ skills: { $in: skills.map((skill) => new RegExp(`^${escapeRegex(skill)}$`, "i")) } });
    if (salaryMin !== undefined) conditions.push({ $expr: { $gte: [{ $ifNull: ["$salaryMax", "$salary"] }, salaryMin] } });
    if (salaryMax !== undefined) conditions.push({ $expr: { $lte: [{ $ifNull: ["$salaryMin", "$salary"] }, salaryMax] } });

    return conditions.length === 1 ? conditions[0] : { $and: conditions };
};

const sortFor = (sort) => ({
    oldest: { createdAt: 1 },
    "salary-high": { salaryMax: -1, salary: -1, createdAt: -1 },
    "salary-low": { salaryMin: 1, salary: 1, createdAt: -1 },
}[sort] || { createdAt: -1 });

export const postJob = asyncHandler(async (req, res) => {
    const data = req.body;
    const salaryMin = data.salaryMin ?? data.salary;
    const salaryMax = data.salaryMax ?? data.salary;
    const job = await Job.create({
        title: data.title,
        slug: slugify(data.title),
        description: data.description,
        requirements: data.requirements,
        skills: data.skills,
        salary: data.salary ?? salaryMin,
        salaryMin,
        salaryMax,
        location: data.location,
        locationNormalized: normalizeLocation(data.location),
        jobType: data.jobType,
        remoteType: data.remoteType,
        experienceLevel: data.experienceLevel ?? data.experience,
        position: data.position,
        company: data.companyId,
        created_by: req.id,
        category: data.category,
        status: data.status || "active",
        applicationDeadline: data.applicationDeadline,
        featured: data.featured ?? false,
    });
    res.status(201).json({ message: "Job created successfully", job, success: true });
});

export const getAllJobs = asyncHandler(async (req, res) => {
    const { page, limit, sort, keyword } = req.query;
    const filter = searchFilter(req.query);
    const skip = (page - 1) * limit;
    let jobs;

    if (keyword && (sort === "relevance" || sort === "recent")) {
        const escaped = escapeRegex(keyword.toLowerCase());
        jobs = await Job.aggregate([
            { $match: filter },
            { $addFields: {
                relevanceScore: { $add: [
                    { $cond: [{ $eq: [{ $toLower: "$title" }, keyword.toLowerCase()] }, 100, 0] },
                    { $cond: [{ $regexMatch: { input: { $toLower: "$title" }, regex: `^${escaped}` } }, 80, 0] },
                    { $cond: [{ $regexMatch: { input: { $toLower: "$title" }, regex: escaped } }, 60, 0] },
                    { $cond: [{ $eq: [{ $toLower: "$category" }, keyword.toLowerCase()] }, 50, 0] },
                ] },
            } },
            { $sort: { relevanceScore: -1, createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            { $lookup: { from: "companies", localField: "company", foreignField: "_id", as: "company" } },
            { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
        ]);
    } else {
        jobs = await Job.find(filter).populate("company").sort(sortFor(sort)).skip(skip).limit(limit).lean();
    }

    const total = await Job.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    res.json({
        jobs,
        success: true,
        pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
    });
});

export const getJobById = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id).populate("company").lean();
    if (!job) throw new AppError("Job not found", 404, "JOB_NOT_FOUND");
    job.applicationCount = await Application.countDocuments({ job: job._id });
    res.json({ job, success: true });
});

export const getAdminJobs = asyncHandler(async (req, res) => {
    const jobs = await Job.find({ created_by: req.id, status: { $ne: "archived" } }).populate("company").sort({ createdAt: -1 }).lean();
    res.json({ jobs, success: true });
});

export const updateJob = asyncHandler(async (req, res) => {
    const data = req.body;
    const mapping = { companyId: "company", experience: "experienceLevel" };
    Object.entries(data).forEach(([key, value]) => {
        if (key !== "companyId") req.job[mapping[key] || key] = value;
    });
    if (data.title) req.job.slug = slugify(data.title);
    if (data.location) req.job.locationNormalized = normalizeLocation(data.location);
    await req.job.save();
    res.json({ message: "Job updated successfully", job: req.job, success: true });
});

export const deleteJob = asyncHandler(async (req, res) => {
    req.job.status = "archived";
    await req.job.save();
    res.json({ message: "Job archived successfully", success: true });
});

export const saveJob = asyncHandler(async (req, res) => {
    const job = await Job.exists({ _id: req.params.id, $or: [{ status: "active" }, { status: { $exists: false } }] });
    if (!job) throw new AppError("Job not found", 404, "JOB_NOT_FOUND");
    await SavedJob.updateOne({ user: req.id, job: req.params.id }, { $setOnInsert: { user: req.id, job: req.params.id } }, { upsert: true });
    res.status(201).json({ message: "Job saved", success: true, jobId: req.params.id });
});

export const unsaveJob = asyncHandler(async (req, res) => {
    await SavedJob.deleteOne({ user: req.id, job: req.params.id });
    res.json({ message: "Job removed from saved jobs", success: true, jobId: req.params.id });
});

export const getSavedJobs = asyncHandler(async (req, res) => {
    const saved = await SavedJob.find({ user: req.id }).sort({ createdAt: -1 }).populate({ path: "job", populate: { path: "company" } }).lean();
    res.json({ success: true, jobs: saved.map((item) => item.job).filter(Boolean) });
});
