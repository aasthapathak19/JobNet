import mongoose from "mongoose";

const applicationStatuses = [
    "Applied",
    "Under Review",
    "Shortlisted",
    "Interview",
    "Selected",
    "Rejected",
    "Withdrawn",
    "pending",
    "accepted",
    "rejected",
];

const statusHistorySchema = new mongoose.Schema({
    status: { type: String, enum: applicationStatuses, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    changedAt: { type: Date, default: Date.now },
    note: { type: String, maxlength: 2000 },
}, { _id: false });

const applicationSchema = new mongoose.Schema({
    job:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Job',
        required:true
    },
    applicant:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    status:{
        type:String,
        enum: applicationStatuses,
        default:'Applied'
    },
    resumeSnapshot: { type: String, default: "" },
    coverLetter: { type: String, default: "", maxlength: 5000 },
    recruiterNotes: { type: String, default: "", maxlength: 5000, select: false },
    statusHistory: { type: [statusHistorySchema], default: [] },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
},{timestamps:true});

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ applicant: 1, createdAt: -1 });
applicationSchema.index({ job: 1, status: 1, createdAt: -1 });

export const Application  = mongoose.model("Application", applicationSchema);
export default Application;
