import Application from "../models/application.model.js";
import Job from "../models/job.model.js";
import SavedJob from "../models/savedJob.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const activeJobFilter = { $or: [{ status: "active" }, { status: { $exists: false } }] };

const profileCompletion = (user) => {
    const fields = [
        user.fullname,
        user.email,
        user.profile?.bio,
        user.profile?.profilePhoto,
        user.profile?.resume,
        user.profile?.skills?.length,
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
};

const matchJob = (job, candidateSkills) => {
    const normalized = new Set(candidateSkills.map((skill) => skill.toLowerCase()));
    const required = (job.skills || []).map((skill) => skill.toLowerCase());
    const matchedSkills = (job.skills || []).filter((skill) => normalized.has(skill.toLowerCase()));
    const missingSkills = (job.skills || []).filter((skill) => !normalized.has(skill.toLowerCase()));
    const score = required.length ? Math.round((matchedSkills.length / required.length) * 100) : 0;
    const reasons = [`${matchedSkills.length}/${required.length} listed skills match`];
    if (job.experienceLevel === 0) reasons.push("Open to freshers");
    return { score, matchedSkills, missingSkills, reasons };
};

export const candidateDashboard = asyncHandler(async (req, res) => {
    const [applications, applicationSummary, savedJobs, recentJobs] = await Promise.all([
        Application.find({ applicant: req.id }).sort({ updatedAt: -1 }).limit(5).populate({ path: "job", populate: { path: "company" } }).lean(),
        Application.find({ applicant: req.id }).select("job status").lean(),
        SavedJob.countDocuments({ user: req.id }),
        Job.find(activeJobFilter).sort({ createdAt: -1 }).limit(30).populate("company").lean(),
    ]);

    const appliedJobIds = new Set(applicationSummary.map((application) => application.job?.toString()).filter(Boolean));
    const candidateSkills = req.user.profile?.skills || [];
    const recommendations = recentJobs
        .filter((job) => !appliedJobIds.has(job._id.toString()))
        .map((job) => ({ ...job, match: matchJob(job, candidateSkills) }))
        .sort((left, right) => right.match.score - left.match.score || new Date(right.createdAt) - new Date(left.createdAt))
        .slice(0, 6);

    const statusCounts = applicationSummary.reduce((counts, application) => {
        counts[application.status] = (counts[application.status] || 0) + 1;
        return counts;
    }, {});

    res.json({
        success: true,
        metrics: {
            profileCompletion: profileCompletion(req.user),
            appliedJobs: applicationSummary.length,
            savedJobs,
            statusCounts,
        },
        recentApplications: applications,
        recentJobs: recentJobs.slice(0, 6),
        recommendations,
    });
});

export const recruiterDashboard = asyncHandler(async (req, res) => {
    const jobs = await Job.find({ created_by: req.id, status: { $ne: "archived" } }).select("status").lean();
    const jobIds = jobs.map((job) => job._id);
    const applicationStatuses = jobIds.length
        ? await Application.aggregate([
            { $match: { job: { $in: jobIds } } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ])
        : [];
    const statusCounts = Object.fromEntries(applicationStatuses.map((item) => [item._id, item.count]));
    const totalApplicants = applicationStatuses.reduce((total, item) => total + item.count, 0);

    res.json({
        success: true,
        metrics: {
            totalJobs: jobs.length,
            activeJobs: jobs.filter((job) => !job.status || job.status === "active").length,
            closedJobs: jobs.filter((job) => ["closed", "expired"].includes(job.status)).length,
            totalApplicants,
            pendingApplications: (statusCounts.Applied || 0) + (statusCounts.pending || 0) + (statusCounts["Under Review"] || 0),
            shortlistedCandidates: statusCounts.Shortlisted || 0,
            selectedCandidates: (statusCounts.Selected || 0) + (statusCounts.accepted || 0),
        },
        statusCounts,
    });
});
