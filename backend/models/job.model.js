import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
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
    }
}, { timestamps: true });

// Text index for full-text search
jobSchema.index({ title: "text", description: "text", category: "text", skills: "text" });

export const Job = mongoose.model("Job", jobSchema);