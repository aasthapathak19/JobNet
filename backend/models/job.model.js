import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 160,
    },
    slug: { type: String, trim: true, index: true },
    description: {
        type: String,
        required: true
    },
    requirements: [{
        type: String
    }],
    // Normalized salary fields (in LPA, stored as number for range filtering)
    salary: {
        type: Number,
        required: true
    },
    salaryMin: {
        type: Number,
        default: null
    },
    salaryMax: {
        type: Number,
        default: null
    },
    // Industry category for structured filtering
    category: {
        type: String,
        default: ""
    },
    // Skills required for this job
    skills: [{
        type: String
    }],
    experienceLevel: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        required: true
    },
    // Normalized location for alias handling
    locationNormalized: {
        type: String,
        default: ""
    },
    jobType: {
        type: String,
        required: true
    },
    // Remote/Hybrid/On-site
    remoteType: {
        type: String,
        enum: ["Remote", "Hybrid", "On-site"],
        default: "On-site"
    },
    position: {
        type: Number,
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    applications: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application',
        }
    ],
    featured: {
        type: Boolean,
        default: false
    },
    applicationDeadline: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ["draft", "active", "closed", "expired", "archived"],
        default: "active",
    }
}, { timestamps: true });

jobSchema.index(
    { title: "text", category: "text", skills: "text", requirements: "text", description: "text" },
    { weights: { title: 10, category: 7, skills: 6, requirements: 3, description: 1 }, name: "job_search" },
);
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ created_by: 1, createdAt: -1 });
jobSchema.index({ company: 1, createdAt: -1 });

export const Job = mongoose.model("Job", jobSchema);
export default Job;
