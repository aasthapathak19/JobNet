import { Job } from "../models/job.model.js";

// Location alias normalization map
const LOCATION_ALIASES = {
    "gurgaon": "gurugram",
    "gurugram": "gurugram",
    "bangalore": "bengaluru",
    "bengaluru": "bengaluru",
    "delhi ncr": "delhi",
    "delhi": "delhi",
    "ncr": "delhi",
    "noida": "noida",
    "hyderabad": "hyderabad",
    "pune": "pune",
    "mumbai": "mumbai",
    "chennai": "chennai",
    "kolkata": "kolkata",
    "jaipur": "jaipur",
    "chandigarh": "chandigarh",
    "ahmedabad": "ahmedabad",
    "remote": "remote",
    "hybrid": "hybrid",
};

function normalizeLocation(loc) {
    if (!loc) return "";
    return LOCATION_ALIASES[loc.toLowerCase().trim()] || loc.toLowerCase().trim();
}

// Category keyword mapping for fuzzy search
const CATEGORY_KEYWORDS = {
    "cybersecurity": ["cybersecurity", "security", "infosec", "soc", "penetration", "pentest", "appsec", "cloud security", "information security", "cyber"],
    "data science": ["data science", "data scientist", "ml", "machine learning", "deep learning", "nlp", "ai", "artificial intelligence", "computer vision", "generative ai"],
    "devops": ["devops", "sre", "site reliability", "platform engineer", "infrastructure", "cloud engineer", "cloud architect", "aws", "azure", "gcp", "kubernetes", "docker"],
    "frontend": ["frontend", "front-end", "react", "vue", "angular", "ui engineer", "web developer", "nextjs", "next.js"],
    "backend": ["backend", "back-end", "node.js", "nodejs", "java", "python", "golang", "api", "server-side", "express", "django", "spring"],
    "fullstack": ["fullstack", "full stack", "full-stack", "mern", "mean"],
    "mobile": ["mobile", "android", "ios", "react native", "flutter", "swift", "kotlin"],
    "data engineering": ["data engineer", "big data", "spark", "kafka", "etl", "data pipeline", "airflow"],
    "qa": ["qa", "quality assurance", "test engineer", "sdet", "automation test", "testing"],
    "product": ["product manager", "product management", "technical product", "project manager", "engineering manager"],
    "design": ["ui/ux", "ux designer", "product designer", "ui designer", "ux researcher"],
    "blockchain": ["blockchain", "web3", "solidity", "defi", "smart contract"],
    "embedded": ["embedded", "iot", "firmware", "rtos", "microcontroller"],
    "database": ["dba", "database administrator", "database engineer", "sql", "nosql", "oracle"],
    "cloud": ["cloud", "aws", "azure", "gcp", "cloud architect", "cloud engineer", "platform"],
};

function buildSearchQuery(keyword, location, category, salaryMin, salaryMax, experience, remoteType) {
    const query = {};
    const conditions = [];

    // Keyword search — search title, description, category, skills, requirements
    if (keyword && keyword.trim()) {
        const kw = keyword.trim();
        
        // Find matching categories based on keyword
        const matchedCategories = [];
        const kwLower = kw.toLowerCase();
        for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
            if (keywords.some(k => kwLower.includes(k) || k.includes(kwLower))) {
                matchedCategories.push(cat);
            }
        }

        const searchConditions = [
            { title: { $regex: kw, $options: "i" } },
            { description: { $regex: kw, $options: "i" } },
            { category: { $regex: kw, $options: "i" } },
            { skills: { $elemMatch: { $regex: kw, $options: "i" } } },
            { requirements: { $elemMatch: { $regex: kw, $options: "i" } } },
        ];

        // Also search for expanded category keywords
        if (matchedCategories.length > 0) {
            const expandedKeywords = matchedCategories.flatMap(cat => CATEGORY_KEYWORDS[cat]);
            const uniqueKeywords = [...new Set(expandedKeywords)];
            uniqueKeywords.forEach(ek => {
                searchConditions.push({ title: { $regex: ek, $options: "i" } });
                searchConditions.push({ category: { $regex: ek, $options: "i" } });
            });
        }

        conditions.push({ $or: searchConditions });
    }

    // Location filter with alias normalization
    if (location && location.trim()) {
        const normalizedLoc = normalizeLocation(location.trim());
        const originalLoc = location.trim();
        
        // Build location OR conditions to handle aliases
        const locationAliases = Object.entries(LOCATION_ALIASES)
            .filter(([, v]) => v === normalizedLoc)
            .map(([k]) => k);
        
        const locConditions = [
            { location: { $regex: originalLoc, $options: "i" } },
            { locationNormalized: { $regex: normalizedLoc, $options: "i" } },
        ];
        
        // Add all alias variants
        locationAliases.forEach(alias => {
            locConditions.push({ location: { $regex: alias, $options: "i" } });
            locConditions.push({ location: { $regex: normalizedLoc, $options: "i" } });
        });

        // Special handling: remote/hybrid searches
        if (normalizedLoc === "remote") {
            locConditions.push({ remoteType: "Remote" });
        } else if (normalizedLoc === "hybrid") {
            locConditions.push({ remoteType: "Hybrid" });
        }
        
        conditions.push({ $or: locConditions });
    }

    // Category/Industry filter
    if (category && category.trim()) {
        const cat = category.trim().toLowerCase();
        const expandedKeywords = CATEGORY_KEYWORDS[cat] || [cat];
        
        const catConditions = [
            { category: { $regex: cat, $options: "i" } },
        ];
        expandedKeywords.forEach(kw => {
            catConditions.push({ category: { $regex: kw, $options: "i" } });
            catConditions.push({ title: { $regex: kw, $options: "i" } });
        });
        
        conditions.push({ $or: catConditions });
    }

    // Salary range filter (salary stored in LPA)
    if (salaryMin !== undefined && salaryMin !== null && salaryMin !== "") {
        const min = parseFloat(salaryMin);
        if (!isNaN(min)) {
            // Job salary should be >= min or salaryMax >= min
            conditions.push({
                $or: [
                    { salary: { $gte: min } },
                    { salaryMax: { $gte: min } }
                ]
            });
        }
    }
    if (salaryMax !== undefined && salaryMax !== null && salaryMax !== "") {
        const max = parseFloat(salaryMax);
        if (!isNaN(max)) {
            conditions.push({
                $or: [
                    { salary: { $lte: max } },
                    { salaryMin: { $lte: max } }
                ]
            });
        }
    }

    // Experience filter
    if (experience !== undefined && experience !== null && experience !== "") {
        const exp = parseInt(experience);
        if (!isNaN(exp)) {
            conditions.push({
                $or: [
                    { experienceLevel: { $lte: exp } },
                    { experienceLevel: exp }
                ]
            });
        }
    }

    // Remote type filter
    if (remoteType && remoteType.trim()) {
        conditions.push({ remoteType: remoteType.trim() });
    }

    if (conditions.length > 0) {
        query.$and = conditions;
    }

    return query;
}

// admin post krega job
export const postJob = async (req, res) => {
    try {
        const {
            title, description, requirements, salary, salaryMin, salaryMax,
            location, jobType, experience, position, companyId,
            category, skills, remoteType, featured
        } = req.body;
        const userId = req.id;

        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
            return res.status(400).json({
                message: "Something is missing.",
                success: false
            })
        };

        // Normalize location for alias support
        const locationNorm = normalizeLocation(location);

        // Parse skills from comma-separated string or array
        let skillsArray = [];
        if (skills) {
            skillsArray = typeof skills === 'string' ? skills.split(",").map(s => s.trim()).filter(Boolean) : skills;
        }

        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(",").map(r => r.trim()).filter(Boolean),
            salary: Number(salary),
            salaryMin: salaryMin ? Number(salaryMin) : Number(salary),
            salaryMax: salaryMax ? Number(salaryMax) : Number(salary),
            location,
            locationNormalized: locationNorm,
            jobType,
            experienceLevel: Number(experience),
            position: Number(position),
            company: companyId,
            created_by: userId,
            category: category || "",
            skills: skillsArray,
            remoteType: remoteType || "On-site",
            featured: featured === "true" || featured === true,
        });

        return res.status(201).json({
            message: "New job created successfully.",
            job,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

// student k liye - enhanced multi-filter search
export const getAllJobs = async (req, res) => {
    try {
        const {
            keyword = "",
            location = "",
            category = "",
            salaryMin,
            salaryMax,
            experience,
            remoteType,
            sort = "recent"
        } = req.query;

        const query = buildSearchQuery(keyword, location, category, salaryMin, salaryMax, experience, remoteType);

        // Sort options
        let sortQuery = { createdAt: -1 }; // default: newest
        if (sort === "salary_high") sortQuery = { salary: -1 };
        else if (sort === "salary_low") sortQuery = { salary: 1 };
        else if (sort === "recent") sortQuery = { createdAt: -1 };

        const jobs = await Job.find(query)
            .populate({ path: "company" })
            .sort(sortQuery)
            .lean();

        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };

        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

// student - get single job
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path: "applications"
        }).populate({ path: "company" });
        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            })
        };
        return res.status(200).json({ job, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

// admin kitne job create kra hai abhi tk
export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;
        const jobs = await Job.find({ created_by: adminId })
            .populate({ path: 'company' })
            .sort({ createdAt: -1 });
        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}
