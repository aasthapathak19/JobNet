/**
 * JobNet Search & Filter Utility
 * Client-side search/filter pipeline with relevance ranking
 */

// Location alias normalization
export const LOCATION_ALIASES = {
    "gurgaon": "gurugram",
    "gurugram": "gurugram",
    "bangalore": "bengaluru",
    "bengaluru": "bengaluru",
    "delhi ncr": "delhi",
    "delhi": "delhi",
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

export function normalizeLocation(loc) {
    if (!loc) return "";
    const lower = loc.toLowerCase().trim();
    return LOCATION_ALIASES[lower] || lower;
}

// Category keyword expansion map for fuzzy semantic search
export const CATEGORY_KEYWORDS = {
    "cybersecurity": [
        "cybersecurity", "cyber security", "security engineer", "security analyst",
        "infosec", "information security", "soc analyst", "penetration", "pentest",
        "appsec", "application security", "cloud security", "vulnerability", "threat",
        "cyber defense", "incident response", "siem", "crowdstrike"
    ],
    "machine learning": [
        "machine learning", "ml engineer", "deep learning", "computer vision",
        "mlops", "model training", "pytorch", "tensorflow", "neural network"
    ],
    "ai": [
        "ai", "artificial intelligence", "generative ai", "llm", "nlp",
        "natural language", "large language model", "gpt", "gemini", "openai",
        "prompt engineering", "rag", "langchain"
    ],
    "data science": [
        "data scientist", "data science", "statistical modeling", "predictive modeling",
        "analytics", "business intelligence", "bi analyst"
    ],
    "data": [
        "data analyst", "data engineer", "data scientist", "data science",
        "big data", "etl", "data pipeline", "spark", "kafka", "airflow",
        "data warehouse", "snowflake", "bigquery", "dbt"
    ],
    "devops": [
        "devops", "site reliability", "sre", "platform engineer", "infrastructure",
        "kubernetes", "k8s", "docker", "terraform", "helm", "cicd", "ci/cd",
        "jenkins", "gitlab ci", "argocd", "gitops"
    ],
    "cloud": [
        "cloud", "aws", "azure", "gcp", "google cloud", "cloud architect",
        "cloud engineer", "cloud security", "solutions architect"
    ],
    "frontend": [
        "frontend", "front-end", "front end", "react", "vue", "angular",
        "ui engineer", "web developer", "nextjs", "next.js", "javascript",
        "typescript", "tailwind", "html", "css"
    ],
    "backend": [
        "backend", "back-end", "back end", "node.js", "nodejs", "java",
        "python", "golang", "go lang", "api", "server-side", "express",
        "django", "spring", "fastapi", "rest api", "graphql"
    ],
    "fullstack": [
        "fullstack", "full stack", "full-stack", "mern", "mean", "mevn"
    ],
    "mobile": [
        "mobile", "android", "ios", "react native", "flutter", "swift", "kotlin",
        "mobile developer", "app developer"
    ],
    "qa": [
        "qa", "quality assurance", "test engineer", "sdet", "automation test",
        "testing", "selenium", "playwright", "cypress", "appium"
    ],
    "product": [
        "product manager", "pm", "product management", "technical product",
        "project manager", "engineering manager", "product owner", "scrum master"
    ],
    "blockchain": [
        "blockchain", "web3", "solidity", "defi", "smart contract",
        "ethereum", "nft", "crypto"
    ],
    "design": [
        "ui/ux", "ux designer", "product designer", "ui designer",
        "ux researcher", "figma", "user experience", "user interface"
    ],
    "database": [
        "dba", "database administrator", "database engineer", "sql", "nosql",
        "oracle", "postgres", "mysql", "mongodb", "redis"
    ],
    "embedded": [
        "embedded", "iot", "firmware", "rtos", "microcontroller", "fpga"
    ],
};

/**
 * Get all expanded keywords for a search query
 */
export function expandKeywords(query) {
    if (!query) return [];
    const q = query.toLowerCase().trim();
    const expanded = new Set([q]);
    
    for (const [, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(k => k.includes(q) || q.includes(k))) {
            keywords.forEach(k => expanded.add(k));
        }
    }
    return [...expanded];
}

/**
 * Calculate a relevance score for a job given a search query
 * Higher = more relevant
 */
export function calculateRelevanceScore(job, query) {
    if (!query || !query.trim()) return 0;
    
    const q = query.toLowerCase().trim();
    let score = 0;
    
    const title = (job.title || "").toLowerCase();
    const description = (job.description || "").toLowerCase();
    const category = (job.category || "").toLowerCase();
    const skills = (job.skills || []).map(s => s.toLowerCase());
    const requirements = (job.requirements || []).map(r => r.toLowerCase());
    
    // Exact title match — highest priority
    if (title === q) score += 100;
    // Title starts with query
    else if (title.startsWith(q)) score += 80;
    // Title includes query
    else if (title.includes(q)) score += 60;
    
    // Category exact match
    if (category === q) score += 50;
    else if (category.includes(q)) score += 35;
    
    // Check expanded keywords
    const expandedKws = expandKeywords(q);
    expandedKws.forEach(kw => {
        if (title.includes(kw)) score += 40;
        if (category.includes(kw)) score += 30;
        if (skills.some(s => s.includes(kw))) score += 20;
        if (requirements.some(r => r.includes(kw))) score += 10;
        if (description.includes(kw)) score += 5;
    });
    
    // Direct skill match
    if (skills.some(s => s === q)) score += 45;
    else if (skills.some(s => s.includes(q))) score += 25;
    
    // Description match
    if (description.includes(q)) score += 10;
    
    return score;
}

/**
 * Parse a salary range string like "8-12", "12-20", "20+", "0-5"
 * Returns { min, max } in LPA
 */
export function parseSalaryRange(rangeStr) {
    if (!rangeStr) return null;
    
    if (rangeStr.endsWith("+")) {
        const min = parseFloat(rangeStr.replace("+", ""));
        return { min, max: Infinity };
    }
    
    const parts = rangeStr.split("-");
    if (parts.length === 2) {
        return {
            min: parseFloat(parts[0]),
            max: parseFloat(parts[1])
        };
    }
    
    return null;
}

/**
 * Check if a job's salary overlaps with a given salary range
 * Uses salaryMin/salaryMax if available, falls back to salary
 */
export function salaryMatchesRange(job, rangeStr) {
    if (!rangeStr) return true;
    const range = parseSalaryRange(rangeStr);
    if (!range) return true;
    
    const jobMin = job.salaryMin ?? job.salary ?? 0;
    const jobMax = job.salaryMax ?? job.salary ?? 0;
    
    // Overlap logic: ranges overlap if jobMin <= rangeMax && jobMax >= rangeMin
    const overlapMin = Math.max(jobMin, range.min);
    const overlapMax = Math.min(jobMax, range.max === Infinity ? Infinity : range.max);
    
    return overlapMin <= overlapMax;
}

/**
 * Format salary for display
 * @param {number} salary - salary in LPA
 * @param {number} salaryMin - min salary in LPA  
 * @param {number} salaryMax - max salary in LPA
 */
export function formatSalary(salary, salaryMin, salaryMax) {
    if (salaryMin && salaryMax && salaryMin !== salaryMax) {
        return `₹${salaryMin}–${salaryMax} LPA`;
    }
    if (salary) {
        return `₹${salary} LPA`;
    }
    return "Salary not disclosed";
}

/**
 * Format experience level
 */
export function formatExperience(level) {
    if (level === 0) return "Fresher / 0 years";
    if (level === 1) return "1+ year";
    return `${level}+ years`;
}

/**
 * Time ago string from date
 */
export function timeAgo(dateStr) {
    if (!dateStr) return "";
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Main client-side filter pipeline
 * Input: jobs[], filters object
 * Output: sorted, filtered, scored jobs
 */
export function filterAndRankJobs(jobs, filters = {}) {
    if (!jobs || jobs.length === 0) return [];
    
    const { query, location, category, salaryRange, experience, remoteType, sort } = filters;
    
    let result = [...jobs];
    
    // Step 1: Text search (query)
    if (query && query.trim()) {
        const q = query.trim().toLowerCase();
        const expandedKws = expandKeywords(q);
        
        result = result.filter(job => {
            const title = (job.title || "").toLowerCase();
            const desc = (job.description || "").toLowerCase();
            const cat = (job.category || "").toLowerCase();
            const skills = (job.skills || []).map(s => s.toLowerCase());
            const reqs = (job.requirements || []).map(r => r.toLowerCase());
            
            // Check expanded keywords against all fields
            return expandedKws.some(kw =>
                title.includes(kw) ||
                cat.includes(kw) ||
                skills.some(s => s.includes(kw)) ||
                reqs.some(r => r.includes(kw)) ||
                desc.includes(kw)
            );
        });
    }
    
    // Step 2: Location filter
    if (location && location.trim()) {
        const normalizedTarget = normalizeLocation(location.trim());
        const originalTarget = location.trim().toLowerCase();
        
        result = result.filter(job => {
            const jobLoc = (job.location || "").toLowerCase();
            const jobLocNorm = (job.locationNormalized || normalizeLocation(job.location || "")).toLowerCase();
            const jobRemote = (job.remoteType || "").toLowerCase();
            
            // Special: remote/hybrid filter
            if (normalizedTarget === "remote") {
                return jobRemote === "remote" || jobLoc.includes("remote");
            }
            if (normalizedTarget === "hybrid") {
                return jobRemote === "hybrid" || jobLoc.includes("hybrid");
            }
            
            return (
                jobLoc.includes(originalTarget) ||
                jobLoc.includes(normalizedTarget) ||
                jobLocNorm.includes(normalizedTarget) ||
                jobLocNorm.includes(originalTarget)
            );
        });
    }
    
    // Step 3: Category/Industry filter
    if (category && category.trim()) {
        const catQ = category.trim().toLowerCase();
        const expandedCatKws = expandKeywords(catQ);
        
        result = result.filter(job => {
            const jobCat = (job.category || "").toLowerCase();
            const jobTitle = (job.title || "").toLowerCase();
            
            return expandedCatKws.some(kw =>
                jobCat.includes(kw) || jobTitle.includes(kw)
            );
        });
    }
    
    // Step 4: Salary range filter
    if (salaryRange) {
        result = result.filter(job => salaryMatchesRange(job, salaryRange));
    }
    
    // Step 5: Experience filter
    if (experience !== undefined && experience !== null && experience !== "") {
        const expNum = parseInt(experience);
        if (!isNaN(expNum)) {
            result = result.filter(job => (job.experienceLevel ?? 0) <= expNum);
        }
    }
    
    // Step 6: Remote type filter
    if (remoteType && remoteType.trim()) {
        result = result.filter(job => {
            return (job.remoteType || "On-site") === remoteType.trim();
        });
    }
    
    // Step 7: Rank by relevance if there's a query
    if (query && query.trim()) {
        result = result.map(job => ({
            ...job,
            _score: calculateRelevanceScore(job, query)
        }));
        
        if (sort === "recent") {
            // Sort by relevance first, then recency
            result.sort((a, b) => {
                const scoreDiff = (b._score || 0) - (a._score || 0);
                if (scoreDiff !== 0) return scoreDiff;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
        } else {
            // Apply explicit sort
            result = applySorting(result, sort);
        }
    } else {
        // No query — just sort
        result = applySorting(result, sort);
    }
    
    return result;
}

function applySorting(jobs, sort) {
    const sorted = [...jobs];
    switch (sort) {
        case "salary_high":
            sorted.sort((a, b) => (b.salary || 0) - (a.salary || 0));
            break;
        case "salary_low":
            sorted.sort((a, b) => (a.salary || 0) - (b.salary || 0));
            break;
        case "recent":
        default:
            sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return sorted;
}

/**
 * Build URL search params from filters
 */
export function filtersToURLParams(filters = {}) {
    const params = new URLSearchParams();
    if (filters.query) params.set("q", filters.query);
    if (filters.location) params.set("location", filters.location);
    if (filters.category) params.set("category", filters.category);
    if (filters.salaryRange) params.set("salary", filters.salaryRange);
    if (filters.experience) params.set("exp", filters.experience);
    if (filters.remoteType) params.set("remote", filters.remoteType);
    if (filters.sort && filters.sort !== "recent") params.set("sort", filters.sort);
    if (filters.page && filters.page > 1) params.set("page", String(filters.page));
    return params;
}

/**
 * Parse URL search params into filters
 */
export function urlParamsToFilters(searchParams) {
    return {
        query: searchParams.get("q") || "",
        location: searchParams.get("location") || "",
        category: searchParams.get("category") || "",
        salaryRange: searchParams.get("salary") || "",
        experience: searchParams.get("exp") || "",
        remoteType: searchParams.get("remote") || "",
        sort: searchParams.get("sort") || "recent",
        page: Math.max(1, Number(searchParams.get("page")) || 1),
    };
}

/**
 * Check if any filter is active
 */
export function hasActiveFilters(filters = {}) {
    return Object.entries(filters).some(([key, val]) => {
        if (key === "sort" || key === "page") return false;
        return typeof val === "string" ? val.trim() !== "" : Boolean(val);
    });
}

/**
 * Get skill match info between user skills and job skills
 */
export function getSkillMatch(userSkills, jobSkills) {
    if (!userSkills || !jobSkills) return { matched: [], missing: [], score: 0 };
    
    const userSkillsLower = userSkills.map(s => s.toLowerCase());
    const matched = [];
    const missing = [];
    
    jobSkills.forEach(skill => {
        if (userSkillsLower.some(us => us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us))) {
            matched.push(skill);
        } else {
            missing.push(skill);
        }
    });
    
    const score = jobSkills.length > 0 ? Math.round((matched.length / jobSkills.length) * 100) : 0;
    
    return { matched, missing, score };
}

// All available industry categories for filter UI
export const INDUSTRY_CATEGORIES = [
    {
        group: "Software Engineering",
        roles: [
            "Frontend Developer", "Backend Developer", "Full Stack Developer",
            "Software Engineer", "Mobile App Developer", "React Developer",
            "Next.js Developer", "Node.js Developer", "Web Developer"
        ]
    },
    {
        group: "Data & AI",
        roles: [
            "Data Analyst", "Data Scientist", "Machine Learning Engineer",
            "AI Engineer", "NLP Engineer", "Deep Learning Engineer",
            "Computer Vision Engineer", "MLOps Engineer"
        ]
    },
    {
        group: "Cloud & DevOps",
        roles: [
            "DevOps Engineer", "Cloud Engineer", "Cloud Architect",
            "Site Reliability Engineer", "Platform Engineer", "Infrastructure Engineer"
        ]
    },
    {
        group: "Cybersecurity",
        roles: [
            "Cybersecurity Engineer", "Security Analyst", "Application Security Engineer",
            "SOC Analyst", "Cloud Security Engineer", "Information Security Analyst"
        ]
    },
    {
        group: "Data Engineering",
        roles: [
            "Data Engineer", "Database Administrator", "Big Data Engineer"
        ]
    },
    {
        group: "Testing & Quality",
        roles: [
            "QA Engineer", "Test Engineer", "Automation Test Engineer", "SDET"
        ]
    },
    {
        group: "Product & Management",
        roles: [
            "Product Manager", "Technical Product Manager", "Project Manager",
            "Engineering Manager", "Product Analyst"
        ]
    },
    {
        group: "Design",
        roles: [
            "UI/UX Designer", "Product Designer", "UX Researcher"
        ]
    },
    {
        group: "Emerging & Specialized",
        roles: [
            "Blockchain Developer", "Web3 Developer", "Embedded Software Engineer",
            "Solutions Architect", "Technical Consultant"
        ]
    }
];

// All locations for filter
export const LOCATIONS = [
    "Bengaluru", "Hyderabad", "Gurugram", "Noida", "Delhi",
    "Mumbai", "Pune", "Chennai", "Kolkata", "Jaipur",
    "Chandigarh", "Ahmedabad", "Remote", "Hybrid"
];

// Salary ranges with labels
export const SALARY_RANGES = [
    { value: "0-5", label: "Under ₹5 LPA" },
    { value: "5-8", label: "₹5 – ₹8 LPA" },
    { value: "8-12", label: "₹8 – ₹12 LPA" },
    { value: "12-20", label: "₹12 – ₹20 LPA" },
    { value: "20-30", label: "₹20 – ₹30 LPA" },
    { value: "30+", label: "₹30+ LPA" },
];

// Experience levels
export const EXPERIENCE_LEVELS = [
    { value: "0", label: "Fresher / 0 years" },
    { value: "1", label: "1+ year" },
    { value: "2", label: "2+ years" },
    { value: "3", label: "3+ years" },
    { value: "5", label: "5+ years" },
    { value: "8", label: "8+ years" },
];

// Remote type options
export const REMOTE_TYPES = [
    { value: "Remote", label: "Remote" },
    { value: "Hybrid", label: "Hybrid" },
    { value: "On-site", label: "On-site" },
];
