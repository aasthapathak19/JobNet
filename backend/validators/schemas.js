import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid identifier");
const emptyObject = z.object({}).passthrough();
const csvOrArray = z.union([z.string(), z.array(z.string())])
    .transform((value) => Array.isArray(value) ? value : value.split(","))
    .transform((values) => values.map((value) => value.trim()).filter(Boolean));
const optionalNumber = (schema) => z.preprocess((value) => value === "" || value === null ? undefined : value, schema.optional());

export const registerSchema = z.object({
    body: z.object({
        fullname: z.string().trim().min(2).max(100),
        email: z.string().trim().toLowerCase().email().max(254),
        phoneNumber: z.string().trim().regex(/^\+?[0-9]{7,15}$/, "Enter a valid phone number"),
        password: z.string().min(8).max(128),
        role: z.enum(["student", "recruiter"]),
    }),
    params: emptyObject,
    query: emptyObject,
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().trim().toLowerCase().email(),
        password: z.string().min(1).max(128),
        role: z.enum(["student", "recruiter"]).optional(),
    }),
    params: emptyObject,
    query: emptyObject,
});

export const updateProfileSchema = z.object({
    body: z.object({
        fullname: z.string().trim().min(2).max(100).optional(),
        email: z.string().trim().toLowerCase().email().max(254).optional(),
        phoneNumber: z.string().trim().regex(/^\+?[0-9]{7,15}$/).optional(),
        bio: z.string().trim().max(1000).optional(),
        skills: csvOrArray.optional(),
    }),
    params: emptyObject,
    query: emptyObject,
});

const companyBody = z.object({
    name: z.string().trim().min(2).max(120).optional(),
    companyName: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().max(3000).optional(),
    website: z.union([z.literal(""), z.string().trim().url().max(500)]).optional(),
    location: z.string().trim().max(150).optional(),
});

export const createCompanySchema = z.object({
    body: companyBody.refine((body) => body.name || body.companyName, { message: "Company name is required" }),
    params: emptyObject,
    query: emptyObject,
});

export const updateCompanySchema = z.object({ body: companyBody, params: z.object({ id: objectId }), query: emptyObject });
export const idParamSchema = z.object({ body: emptyObject, params: z.object({ id: objectId }), query: emptyObject });

const jobBodyBase = z.object({
    title: z.string().trim().min(2).max(160),
    description: z.string().trim().min(20).max(20000),
    requirements: csvOrArray,
    skills: csvOrArray.optional().default([]),
    salary: optionalNumber(z.coerce.number().min(0).max(1000)),
    salaryMin: optionalNumber(z.coerce.number().min(0).max(1000)),
    salaryMax: optionalNumber(z.coerce.number().min(0).max(1000)),
    location: z.string().trim().min(2).max(150),
    remoteType: z.enum(["Remote", "Hybrid", "On-site"]).default("On-site"),
    jobType: z.string().trim().min(2).max(80),
    experience: z.coerce.number().int().min(0).max(60),
    experienceLevel: z.coerce.number().int().min(0).max(60).optional(),
    position: z.coerce.number().int().min(1).max(10000),
    companyId: objectId,
    category: z.string().trim().max(120).optional().default(""),
    status: z.enum(["draft", "active", "closed", "expired", "archived"]).optional(),
    applicationDeadline: z.coerce.date().optional(),
    featured: z.union([z.boolean(), z.enum(["true", "false"]).transform((value) => value === "true")]).optional(),
});

const validateSalaryRange = (job, context) => {
    const min = job.salaryMin ?? job.salary;
    const max = job.salaryMax ?? job.salary;
    if (min === undefined || max === undefined) {
        context.addIssue({ code: "custom", path: ["salary"], message: "Salary or salary range is required" });
    } else if (min > max) {
        context.addIssue({ code: "custom", path: ["salaryMax"], message: "salaryMax must be greater than or equal to salaryMin" });
    }
};

const jobBody = jobBodyBase.superRefine(validateSalaryRange);

export const createJobSchema = z.object({ body: jobBody, params: emptyObject, query: emptyObject });
export const updateJobSchema = z.object({
    body: jobBodyBase.partial().superRefine((job, context) => {
        if (job.salary !== undefined || job.salaryMin !== undefined || job.salaryMax !== undefined) {
            validateSalaryRange(job, context);
        }
    }),
    params: z.object({ id: objectId }),
    query: emptyObject,
});

export const jobSearchSchema = z.object({
    body: emptyObject,
    params: emptyObject,
    query: z.object({
        keyword: z.string().trim().max(120).optional(),
        location: z.string().trim().max(120).optional(),
        category: z.string().trim().max(120).optional(),
        salaryMin: z.coerce.number().min(0).max(1000).optional(),
        salaryMax: z.coerce.number().min(0).max(1000).optional(),
        experience: z.coerce.number().int().min(0).max(60).optional(),
        remoteType: z.enum(["Remote", "Hybrid", "On-site"]).optional(),
        jobType: z.string().trim().max(80).optional(),
        skills: csvOrArray.optional(),
        sort: z.enum(["recent", "oldest", "salary-high", "salary-low", "relevance"]).default("recent"),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(50).default(20),
    }),
});

export const updateApplicationStatusSchema = z.object({
    body: z.object({
        status: z.enum(["Applied", "Under Review", "Shortlisted", "Interview", "Selected", "Rejected", "Withdrawn", "Accepted", "pending", "accepted", "rejected"]),
        note: z.string().trim().max(2000).optional(),
    }),
    params: z.object({ id: objectId }),
    query: emptyObject,
});
