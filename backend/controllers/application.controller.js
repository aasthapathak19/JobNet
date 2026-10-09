import Application from "../models/application.model.js";
import Job from "../models/job.model.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const normalizeStatus = (status) => ({ pending: "Applied", accepted: "Selected", Accepted: "Selected", rejected: "Rejected" }[status] || status);

export const applyJob = asyncHandler(async (req, res) => {
    const job = await Job.findOne({ _id: req.params.id, $or: [{ status: "active" }, { status: { $exists: false } }] });
    if (!job) throw new AppError("This job is not available for applications", 404, "JOB_NOT_AVAILABLE");

    const application = await Application.create({
        job: job._id,
        applicant: req.id,
        status: "Applied",
        resumeSnapshot: req.user.profile?.resume || "",
        statusHistory: [{ status: "Applied", changedBy: req.id }],
        lastUpdatedBy: req.id,
    });

    await Job.updateOne({ _id: job._id }, { $addToSet: { applications: application._id } });
    res.status(201).json({ message: "Application submitted successfully", application, success: true });
});

export const getAppliedJobs = asyncHandler(async (req, res) => {
    const application = await Application.find({ applicant: req.id })
        .sort({ createdAt: -1 })
        .populate({ path: "job", populate: { path: "company" } })
        .lean();
    res.json({ application, success: true });
});

export const getApplicants = asyncHandler(async (req, res) => {
    const applications = await Application.find({ job: req.job._id })
        .sort({ createdAt: -1 })
        .populate({ path: "applicant", select: "fullname email phoneNumber profile" })
        .lean();
    const job = req.job.toObject();
    job.applications = applications;
    res.json({ job, success: true });
});

export const updateStatus = asyncHandler(async (req, res) => {
    const status = normalizeStatus(req.body.status);
    req.application.status = status;
    req.application.lastUpdatedBy = req.id;
    req.application.statusHistory.push({ status, changedBy: req.id, note: req.body.note });
    await req.application.save();
    res.json({ message: "Application status updated", application: req.application, success: true });
});
