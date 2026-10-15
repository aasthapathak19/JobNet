import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/appError.js";

const LOCATION_ALIASES = {
    bangalore: "bengaluru",
    bengaluru: "bengaluru",
    gurgaon: "gurugram",
    gurugram: "gurugram",
    "delhi ncr": "delhi",
    delhi: "delhi",
    noida: "noida",
    hyderabad: "hyderabad",
    pune: "pune",
    mumbai: "mumbai",
    chennai: "chennai",
    kolkata: "kolkata",
    remote: "remote",
    hybrid: "hybrid",
};

const normalizeLocation = (value = "") => {
    const trimmed = (value || "").trim().toLowerCase();
    return LOCATION_ALIASES[trimmed] || trimmed;
};

const slugify = (value = "") =>
    value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// Helper to determine category from title
const detectCategory = (title = "") => {
    const t = title.toLowerCase();
    if (t.includes("data") || t.includes("ml") || t.includes("ai") || t.includes("machine learning")) return "Data & AI";
    if (t.includes("cloud") || t.includes("devops") || t.includes("sre") || t.includes("infrastructure")) return "Cloud & DevOps";
    if (t.includes("security") || t.includes("soc") || t.includes("cyber")) return "Cybersecurity";
    if (t.includes("design") || t.includes("ui") || t.includes("ux")) return "Design";
    if (t.includes("product") || t.includes("pm") || t.includes("project")) return "Product & Management";
    if (t.includes("qa") || t.includes("test") || t.includes("sdet")) return "Testing & Quality";
    return "Software Engineering";
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Extract common tech skills from text
const extractSkills = (text = "", requiredSkills = []) => {
    if (Array.isArray(requiredSkills) && requiredSkills.length > 0) {
        return requiredSkills.slice(0, 8);
    }
    const skillList = [
        "React", "Node.js", "JavaScript", "TypeScript", "Python", "Java", "C++",
        "AWS", "Docker", "Kubernetes", "MongoDB", "SQL", "PostgreSQL", "Next.js",
        "Redux", "Express", "TailwindCSS", "Git", "REST APIs", "GraphQL", "Figma"
    ];
    const found = skillList.filter(s => new RegExp(`(?:^|\\W)${escapeRegex(s)}(?:$|\\W)`, "i").test(text));
    return found.length > 0 ? found.slice(0, 6) : ["JavaScript", "React", "Node.js"];
};

// Normalize salary into LPA (Lakhs Per Annum)
const normalizeSalaryInLPA = (min, max, currency) => {
    if (min || max) {
        let val = max || min;
        // If in INR (e.g. 1200000) -> 12 LPA
        if (currency === "INR" || val > 100000) {
            val = Math.round(val / 100000);
            return {
                salary: val,
                salaryMin: min ? Math.round(min / 100000) : Math.max(1, val - 3),
                salaryMax: max ? Math.round(max / 100000) : val + 4,
            };
        }
        // If in USD (e.g. 60000) -> convert to approx LPA
        if (currency === "USD" || val > 1000) {
            const lpa = Math.round((val * 85) / 100000);
            return {
                salary: lpa,
                salaryMin: Math.max(1, lpa - 4),
                salaryMax: lpa + 6,
            };
        }
        // If already in small number (e.g. 12)
        return {
            salary: Math.round(val),
            salaryMin: min ? Math.round(min) : Math.max(1, Math.round(val) - 2),
            salaryMax: max ? Math.round(max) : Math.round(val) + 3,
        };
    }
    // Sensible default LPA
    return { salary: 14, salaryMin: 10, salaryMax: 18 };
};

/**
 * Fetch and sync jobs from JSearch RapidAPI into JobNet MongoDB
 */
export async function syncJobsFromJSearch({
    apiKey,
    query = "Software Developer in Bengaluru, India",
    userId,
    numPages = 1,
    country = "in"
}) {
    const key = apiKey || env.RAPIDAPI_KEY || process.env.RAPIDAPI_KEY;

    if (!key) {
        throw new AppError(
            "RapidAPI Key is required to fetch live jobs from JSearch. Please enter your RapidAPI Key or add RAPIDAPI_KEY in backend/.env",
            400,
            "RAPIDAPI_KEY_REQUIRED"
        );
    }

    const url = new URL("https://jsearch.p.rapidapi.com/search-v2");
    url.searchParams.set("query", query);
    url.searchParams.set("num_pages", String(numPages));
    url.searchParams.set("country", country);

    const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
            "x-rapidapi-key": key.trim(),
            "x-rapidapi-host": "jsearch.p.rapidapi.com",
        },
    });

    if (!response.ok) {
        const errText = await response.text();
        if (response.status === 401 || response.status === 403) {
            throw new AppError(
                "Invalid or unauthorized RapidAPI Key. Please verify your key from https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch",
                401,
                "INVALID_RAPIDAPI_KEY"
            );
        }
        if (response.status === 429) {
            throw new AppError(
                "RapidAPI rate limit exceeded. Please wait or upgrade your plan.",
                429,
                "RATE_LIMIT_EXCEEDED"
            );
        }
        throw new AppError(`JSearch API error (${response.status}): ${errText}`, 502, "EXTERNAL_API_ERROR");
    }

    const result = await response.json();
    let externalJobs = [];
    if (result.data && Array.isArray(result.data.jobs)) {
        externalJobs = result.data.jobs;
    } else if (Array.isArray(result.data)) {
        externalJobs = result.data;
    } else if (Array.isArray(result.jobs)) {
        externalJobs = result.jobs;
    }

    if (!Array.isArray(externalJobs) || externalJobs.length === 0) {
        return {
            success: true,
            syncedCount: 0,
            skippedCount: 0,
            totalFetched: 0,
            message: `No jobs found for query: "${query}"`,
        };
    }

    let syncedCount = 0;
    let skippedCount = 0;
    const syncedJobs = [];

    for (const rawJob of externalJobs) {
        try {
            const companyName = (rawJob.employer_name || "Tech Solutions India").trim();
            const jobTitle = (rawJob.job_title || "Software Engineer").trim();

            // 1. Find or create company
            let company = await Company.findOne({ name: companyName });
            if (!company) {
                company = await Company.create({
                    name: companyName,
                    description: `${companyName} is hiring tech talent via JSearch / JobNet.`,
                    website: rawJob.employer_website || "https://google.com",
                    location: rawJob.job_city || rawJob.job_country || "India",
                    logo: rawJob.employer_logo || "",
                    userId: userId,
                });
            }

            // 2. Check for duplicate job
            const existingJob = await Job.findOne({
                title: jobTitle,
                company: company._id,
            });

            if (existingJob) {
                skippedCount++;
                continue;
            }

            // 3. Process fields
            const locationRaw = rawJob.job_city || (rawJob.job_is_remote ? "Remote" : "Bengaluru");
            const locationNorm = normalizeLocation(locationRaw);
            const salaryInfo = normalizeSalaryInLPA(
                rawJob.job_min_salary,
                rawJob.job_max_salary,
                rawJob.job_salary_currency
            );

            const skills = extractSkills(
                `${jobTitle} ${rawJob.job_description || ""}`,
                rawJob.job_required_skills
            );

            const requirements = Array.isArray(rawJob.job_highlights?.Qualifications) && rawJob.job_highlights.Qualifications.length
                ? rawJob.job_highlights.Qualifications.slice(0, 5)
                : ["Strong problem solving skills", "Experience with modern web technologies", "Team collaboration"];

            // Experience in years
            const expMonths = rawJob.job_required_experience?.required_experience_in_months;
            const expYears = expMonths ? Math.round(expMonths / 12) : 2;

            const isRemote = rawJob.job_is_remote === true || /remote/i.test(locationRaw);

            // 4. Create Job
            const created = await Job.create({
                title: jobTitle,
                slug: slugify(jobTitle),
                description: rawJob.job_description || `Join ${companyName} as a ${jobTitle}.`,
                requirements,
                skills,
                salary: salaryInfo.salary,
                salaryMin: salaryInfo.salaryMin,
                salaryMax: salaryInfo.salaryMax,
                experienceLevel: expYears,
                location: locationRaw,
                locationNormalized: locationNorm,
                jobType: rawJob.job_employment_type === "PARTTIME" ? "Part-time" : "Full-time",
                remoteType: isRemote ? "Remote" : "On-site",
                position: 1,
                company: company._id,
                created_by: userId,
                category: detectCategory(jobTitle),
                status: "active",
            });

            syncedCount++;
            syncedJobs.push({
                id: created._id,
                title: created.title,
                company: companyName,
                location: locationRaw,
            });
        } catch (itemErr) {
            console.error("Error syncing individual job:", itemErr.message);
            skippedCount++;
        }
    }

    return {
        success: true,
        syncedCount,
        skippedCount,
        totalFetched: externalJobs.length,
        syncedJobs,
        message: `Successfully synced ${syncedCount} live jobs into JobNet (${skippedCount} duplicates skipped)`,
    };
}
