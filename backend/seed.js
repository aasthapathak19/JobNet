/**
 * JobNet Comprehensive Seed Script
 * Seeds realistic companies and 30+ jobs covering all major tech categories
 * Run: node seed.js
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./models/user.model.js";
import { Company } from "./models/company.model.js";
import { Job } from "./models/job.model.js";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/jobnet";

const COMPANIES = [
    {
        name: "Google India",
        description: "Google LLC is an American multinational technology company focusing on artificial intelligence, online advertising, search engine technology, and cloud computing.",
        website: "https://google.com",
        location: "Bengaluru",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png"
    },
    {
        name: "Microsoft India",
        description: "Microsoft Corporation is an American multinational technology corporation producing computer software, consumer electronics, personal computers, and related services.",
        website: "https://microsoft.com",
        location: "Hyderabad",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/768px-Microsoft_logo.svg.png"
    },
    {
        name: "Amazon Web Services",
        description: "Amazon Web Services (AWS) is a subsidiary of Amazon that provides on-demand cloud computing platforms and APIs.",
        website: "https://aws.amazon.com",
        location: "Hyderabad",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/768px-Amazon_Web_Services_Logo.svg.png"
    },
    {
        name: "Flipkart",
        description: "Flipkart is an Indian e-commerce company, headquartered in Bengaluru. It is India's leading B2C e-commerce marketplace.",
        website: "https://flipkart.com",
        location: "Bengaluru",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3e/Flipkart_logo.png/320px-Flipkart_logo.png"
    },
    {
        name: "Razorpay",
        description: "Razorpay is an Indian fintech company that provides payment gateway solutions and banking services.",
        website: "https://razorpay.com",
        location: "Bengaluru",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Razorpay_logo.svg/768px-Razorpay_logo.svg.png"
    },
    {
        name: "Zomato",
        description: "Zomato is an Indian multinational food delivery company founded in 2008. It provides a platform for restaurant discovery, food delivery, and more.",
        website: "https://zomato.com",
        location: "Gurugram",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Zomato_logo.png/320px-Zomato_logo.png"
    },
    {
        name: "Meesho",
        description: "Meesho is an Indian e-commerce company founded in 2015. It provides a platform for small businesses and individuals to sell products online.",
        website: "https://meesho.com",
        location: "Bengaluru",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Meesho_Logo.png/320px-Meesho_Logo.png"
    },
    {
        name: "Paytm",
        description: "Paytm is an Indian digital payments and financial technology company. It offers a wide range of financial services.",
        website: "https://paytm.com",
        location: "Noida",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Paytm_logo.png/320px-Paytm_logo.png"
    },
    {
        name: "Infosys",
        description: "Infosys Limited is an Indian multinational information technology company that provides business consulting, information technology and outsourcing services.",
        website: "https://infosys.com",
        location: "Bengaluru",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Infosys_logo.svg/768px-Infosys_logo.svg.png"
    },
    {
        name: "CrowdStrike India",
        description: "CrowdStrike is an American cybersecurity technology company. It provides cloud workload and endpoint security, threat intelligence, and cyberattack response services.",
        website: "https://crowdstrike.com",
        location: "Pune",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/7/71/CrowdStrike_logo.svg/640px-CrowdStrike_logo.svg.png"
    },
];

const JOBS = [
    // SOFTWARE ENGINEERING
    {
        title: "Senior React Developer",
        description: "We are looking for an experienced React Developer to join our frontend team. You will build and maintain high-performance web applications used by millions of users. Work with modern React patterns including hooks, context, and performance optimization.",
        requirements: ["React.js", "Redux/Zustand", "TypeScript", "REST APIs", "Git", "CI/CD basics"],
        skills: ["React", "TypeScript", "Redux", "Next.js", "TailwindCSS", "Jest"],
        salary: 22,
        salaryMin: 18,
        salaryMax: 28,
        location: "Bengaluru",
        jobType: "Full-time",
        remoteType: "Hybrid",
        experienceLevel: 4,
        position: 3,
        category: "Frontend Developer",
        featured: true,
        companyName: "Flipkart"
    },
    {
        title: "Full Stack Engineer (MERN)",
        description: "Join our core product team to build scalable full-stack applications. You'll own features end-to-end — from designing MongoDB schemas to shipping React components. We use a modern MERN stack with microservices architecture.",
        requirements: ["MongoDB", "Express.js", "React.js", "Node.js", "REST APIs", "Docker basics"],
        skills: ["MongoDB", "Express", "React", "Node.js", "Docker", "AWS basics"],
        salary: 18,
        salaryMin: 15,
        salaryMax: 22,
        location: "Gurugram",
        jobType: "Full-time",
        remoteType: "On-site",
        experienceLevel: 2,
        position: 5,
        category: "Full Stack Developer",
        featured: false,
        companyName: "Zomato"
    },
    {
        title: "Backend Engineer - Node.js",
        description: "Build and scale the payment infrastructure that processes millions of transactions daily. You will design high-throughput Node.js microservices, work with Redis caching, and ensure 99.99% uptime for critical financial APIs.",
        requirements: ["Node.js", "Express.js", "MongoDB/PostgreSQL", "Redis", "REST/GraphQL", "System design"],
        skills: ["Node.js", "Express", "PostgreSQL", "Redis", "Kafka", "Docker", "AWS"],
        salary: 28,
        salaryMin: 22,
        salaryMax: 35,
        location: "Bengaluru",
        jobType: "Full-time",
        remoteType: "Hybrid",
        experienceLevel: 4,
        position: 2,
        category: "Backend Developer",
        featured: true,
        companyName: "Razorpay"
    },
    {
        title: "Software Development Engineer I (SDE-1)",
        description: "Exciting opportunity for fresh or early-career engineers to join our engineering team. You will build features for our customer-facing apps, participate in design reviews, and grow into a full software engineer with mentorship.",
        requirements: ["Data Structures & Algorithms", "Java or Python", "OOP concepts", "Basic SQL", "Problem solving"],
        skills: ["Java", "Python", "SQL", "Git", "Data Structures"],
        salary: 12,
        salaryMin: 10,
        salaryMax: 15,
        location: "Hyderabad",
        jobType: "Full-time",
        remoteType: "On-site",
        experienceLevel: 0,
        position: 10,
        category: "Software Engineer",
        featured: false,
        companyName: "Infosys"
    },
    {
        title: "React Native Developer",
        description: "Build our next-generation mobile apps for Android and iOS using React Native. You'll work on performance optimization, native module integration, and creating delightful user experiences for 50M+ app users.",
        requirements: ["React Native", "JavaScript/TypeScript", "Android/iOS basics", "REST APIs", "Redux"],
        skills: ["React Native", "TypeScript", "Redux", "Expo", "Native Modules", "Firebase"],
        salary: 20,
        salaryMin: 16,
        salaryMax: 25,
        location: "Bengaluru",
        jobType: "Full-time",
        remoteType: "Remote",
        experienceLevel: 3,
        position: 2,
        category: "Mobile App Developer",
        featured: false,
        companyName: "Meesho"
    },
    {
        title: "Next.js Frontend Developer",
        description: "We're looking for a Next.js expert to lead our web platform's frontend architecture. You will implement SSR/SSG strategies, optimize Core Web Vitals, build reusable component libraries, and ensure accessibility compliance.",
        requirements: ["Next.js", "React", "TypeScript", "CSS/TailwindCSS", "SEO basics", "Performance optimization"],
        skills: ["Next.js", "React", "TypeScript", "TailwindCSS", "Vercel", "GraphQL"],
        salary: 25,
        salaryMin: 20,
        salaryMax: 32,
        location: "Remote",
        jobType: "Full-time",
        remoteType: "Remote",
        experienceLevel: 3,
        position: 2,
        category: "Frontend Developer",
        featured: true,
        companyName: "Razorpay"
    },
    // DATA & AI
    {
        title: "Machine Learning Engineer",
        description: "Work on Google's core ML infrastructure. You'll design and train large-scale ML models, build data pipelines for model training, deploy models to production serving billions of requests, and collaborate with research teams on cutting-edge AI.",
        requirements: ["Python", "TensorFlow/PyTorch", "ML fundamentals", "Statistics", "Distributed computing", "System design"],
        skills: ["Python", "TensorFlow", "PyTorch", "Kubernetes", "GCP", "Spark", "MLflow"],
        salary: 45,
        salaryMin: 35,
        salaryMax: 60,
        location: "Bengaluru",
        jobType: "Full-time",
        remoteType: "Hybrid",
        experienceLevel: 5,
        position: 3,
        category: "Machine Learning Engineer",
        featured: true,
        companyName: "Google India"
    },
    {
        title: "Data Scientist",
        description: "Apply statistical modeling and machine learning to drive product decisions. You'll analyze user behavior data, build recommendation systems, develop A/B testing frameworks, and present insights to leadership.",
        requirements: ["Python/R", "Statistics & Probability", "Machine Learning", "SQL", "Data visualization", "A/B testing"],
        skills: ["Python", "R", "Pandas", "Scikit-learn", "SQL", "Tableau", "Spark"],
        salary: 22,
        salaryMin: 18,
        salaryMax: 28,
        location: "Gurugram",
        jobType: "Full-time",
        remoteType: "Hybrid",
        experienceLevel: 2,
        position: 4,
        category: "Data Scientist",
        featured: false,
        companyName: "Zomato"
    },
    {
        title: "AI Engineer - Generative AI",
        description: "Build next-generation AI products using LLMs, RAG systems, and multimodal models. You'll integrate OpenAI/Gemini APIs, design prompt engineering systems, build AI copilots, and optimize inference latency for production deployment.",
        requirements: ["Python", "LLM APIs (OpenAI/Gemini)", "Prompt Engineering", "RAG/Vector DBs", "FastAPI", "LangChain/LlamaIndex"],
        skills: ["Python", "LangChain", "OpenAI API", "Pinecone", "FastAPI", "Docker", "Redis"],
        salary: 35,
        salaryMin: 28,
        salaryMax: 45,
        location: "Bengaluru",
        jobType: "Full-time",
        remoteType: "Hybrid",
        experienceLevel: 3,
        position: 5,
        category: "AI Engineer",
        featured: true,
        companyName: "Microsoft India"
    },
    {
        title: "NLP Engineer",
        description: "Design and build NLP systems for understanding user intent, information extraction, and automated text analysis at scale. Work with transformer models, fine-tuning techniques, and production NLP pipelines.",
        requirements: ["Python", "NLP (NLTK/spaCy/Hugging Face)", "Deep Learning", "Transformer models", "Text preprocessing", "Model evaluation"],
        skills: ["Python", "Hugging Face", "spaCy", "BERT", "PyTorch", "Elasticsearch", "GCP"],
        salary: 30,
        salaryMin: 25,
        salaryMax: 40,
        location: "Hyderabad",
        jobType: "Full-time",
        remoteType: "Hybrid",
        experienceLevel: 3,
        position: 2,
        category: "NLP Engineer",
        featured: false,
        companyName: "Microsoft India"
    },
    {
        title: "Data Analyst",
        description: "Transform raw data into actionable business insights. Build dashboards for key business metrics, conduct cohort analysis, support product teams with data-driven decisions, and work with large-scale e-commerce datasets.",
        requirements: ["SQL (Advanced)", "Python/Excel", "Data visualization (Power BI/Tableau)", "Statistics basics", "Business acumen"],
        skills: ["SQL", "Python", "Power BI", "Tableau", "Excel", "Google Analytics"],
        salary: 10,
        salaryMin: 8,
        salaryMax: 14,
        location: "Noida",
        jobType: "Full-time",
        remoteType: "On-site",
        experienceLevel: 1,
        position: 5,
        category: "Data Analyst",
        featured: false,
        companyName: "Paytm"
    },
    {
        title: "MLOps Engineer",
        description: "Build and maintain the ML platform that enables data scientists to train, deploy, monitor, and retrain models in production. Own CI/CD pipelines for ML, model versioning, and automated retraining workflows.",
        requirements: ["Python", "Kubernetes", "Docker", "MLflow/Kubeflow", "CI/CD", "Cloud (AWS/GCP/Azure)", "Monitoring (Prometheus/Grafana)"],
        skills: ["Python", "Kubernetes", "Docker", "MLflow", "Airflow", "AWS SageMaker", "Prometheus"],
        salary: 32,
        salaryMin: 25,
        salaryMax: 40,
        location: "Bengaluru",
        jobType: "Full-time",
        remoteType: "Hybrid",
        experienceLevel: 4,
        position: 2,
        category: "MLOps Engineer",
        featured: false,
        companyName: "Google India"
    },
    // CLOUD & DEVOPS
    {
        title: "DevOps Engineer",
        description: "Drive our cloud infrastructure and CI/CD transformation. You'll manage Kubernetes clusters, build deployment pipelines, implement infrastructure as code using Terraform, and ensure high availability of our microservices platform.",
        requirements: ["Linux", "Docker/Kubernetes", "Terraform", "CI/CD (Jenkins/GitLab CI)", "AWS/Azure", "Monitoring (Grafana/Prometheus)", "Scripting (Bash/Python)"],
        skills: ["Kubernetes", "Docker", "Terraform", "Jenkins", "AWS", "Linux", "Prometheus", "Grafana"],
        salary: 28,
        salaryMin: 22,
        salaryMax: 36,
        location: "Hyderabad",
        jobType: "Full-time",
        remoteType: "Hybrid",
        experienceLevel: 4,
        position: 3,
        category: "DevOps Engineer",
        featured: true,
        companyName: "Amazon Web Services"
    },
    {
        title: "Cloud Architect - AWS",
        description: "Design and architect scalable, secure, and cost-efficient cloud infrastructure on AWS for enterprise customers. Lead cloud migration projects, define architectural standards, and mentor junior cloud engineers.",
        requirements: ["AWS Certified Solutions Architect", "Networking", "Security best practices", "IaC (Terraform/CloudFormation)", "Microservices", "Cost optimization", "7+ years experience"],
        skills: ["AWS", "Terraform", "CloudFormation", "VPC", "IAM", "EKS", "RDS", "Cost Management"],
        salary: 48,
        salaryMin: 38,
        salaryMax: 60,
        location: "Hyderabad",
        jobType: "Full-time",
        remoteType: "On-site",
        experienceLevel: 7,
        position: 2,
        category: "Cloud Architect",
        featured: false,
        companyName: "Amazon Web Services"
    },
    {
        title: "Site Reliability Engineer (SRE)",
        description: "Own the reliability, scalability, and performance of Google's globally distributed services. You'll define SLIs/SLOs, build runbooks, automate toil, conduct postmortems, and collaborate with development teams to improve reliability.",
        requirements: ["Linux systems", "Programming (Go/Python)", "Kubernetes", "Distributed systems", "Observability (logs/metrics/traces)", "Incident management"],
        skills: ["Go", "Python", "Kubernetes", "Prometheus", "Grafana", "Terraform", "GCP", "Linux"],
        salary: 42,
        salaryMin: 32,
        salaryMax: 55,
        location: "Bengaluru",
        jobType: "Full-time",
        remoteType: "Hybrid",
        experienceLevel: 5,
        position: 3,
        category: "Site Reliability Engineer",
        featured: true,
        companyName: "Google India"
    },
    {
        title: "Platform Engineer",
        description: "Build the developer platform that enables 500+ engineers to ship faster. Own internal tooling, CI/CD infrastructure, container orchestration, and developer experience improvements that reduce time-to-production.",
        requirements: ["Kubernetes", "Docker", "Helm", "Python/Go", "CI/CD platforms", "GitOps (ArgoCD/FluxCD)", "Internal developer portals"],
        skills: ["Kubernetes", "Helm", "ArgoCD", "Backstage", "Go", "Python", "AWS", "Terraform"],
        salary: 30,
        salaryMin: 24,
        salaryMax: 38,
        location: "Bengaluru",
        jobType: "Full-time",
        remoteType: "Remote",
        experienceLevel: 3,
        position: 4,
        category: "Platform Engineer",
        featured: false,
        companyName: "Flipkart"
    },
    // CYBERSECURITY
    {
        title: "Cybersecurity Engineer",
        description: "Protect our platform and customers from security threats. You'll conduct threat modeling, implement security controls, manage vulnerability assessments, respond to incidents, and build security automation tools.",
        requirements: ["Network security", "OWASP Top 10", "SIEM tools", "Incident response", "Python/Bash scripting", "Security certifications (CEH/CISSP preferred)"],
        skills: ["Penetration Testing", "SIEM", "Python", "Vulnerability Assessment", "IDS/IPS", "OWASP"],
        salary: 24,
        salaryMin: 18,
        salaryMax: 32,
        location: "Pune",
        jobType: "Full-time",
        remoteType: "On-site",
        experienceLevel: 3,
        position: 4,
        category: "Cybersecurity Engineer",
        featured: true,
        companyName: "CrowdStrike India"
    },
    {
        title: "Application Security Engineer",
        description: "Embed security into our software development lifecycle. You'll perform SAST/DAST testing, conduct code security reviews, develop secure coding guidelines, run bug bounty programs, and build developer security tooling.",
        requirements: ["SAST/DAST tools", "Secure coding practices", "OWASP Top 10", "API security", "Python/Java knowledge", "Threat modeling"],
        skills: ["Burp Suite", "SAST tools", "Python", "Java", "OWASP ZAP", "GitHub Advanced Security", "Threat Modeling"],
        salary: 28,
        salaryMin: 22,
        salaryMax: 36,
        location: "Pune",
        jobType: "Full-time",
        remoteType: "Hybrid",
        experienceLevel: 3,
        position: 3,
        category: "Application Security Engineer",
        featured: false,
        companyName: "CrowdStrike India"
    },
    {
        title: "SOC Analyst (Level 2)",
        description: "Monitor, investigate, and respond to security incidents in our 24/7 Security Operations Center. Analyze threat intelligence, perform log analysis, handle escalations, and improve detection capabilities using SIEM and EDR tools.",
        requirements: ["SIEM (Splunk/QRadar)", "Incident response", "Threat intelligence", "Network analysis", "Security certifications (CompTIA Security+/CEH)", "Linux/Windows administration"],
        skills: ["Splunk", "CrowdStrike Falcon", "MITRE ATT&CK", "Incident Response", "Log Analysis", "Python"],
        salary: 16,
        salaryMin: 12,
        salaryMax: 22,
        location: "Pune",
        jobType: "Full-time",
        remoteType: "On-site",
        experienceLevel: 2,
        position: 6,
        category: "SOC Analyst",
        featured: false,
        companyName: "CrowdStrike India"
    },
    {
        title: "Cloud Security Engineer",
        description: "Secure our multi-cloud infrastructure (AWS, Azure, GCP). Design and implement cloud security architecture, manage IAM policies, configure security posture management tools, and ensure compliance with ISO 27001 and SOC 2.",
        requirements: ["AWS/Azure/GCP security", "IAM", "CSPM tools (Prisma Cloud/Wiz)", "IaC security", "Compliance frameworks", "Python scripting"],
        skills: ["AWS Security", "Terraform", "Prisma Cloud", "IAM", "Python", "SOC 2", "ISO 27001"],
        salary: 32,
        salaryMin: 25,
        salaryMax: 42,
        location: "Bengaluru",
        jobType: "Full-time",
        remoteType: "Hybrid",
        experienceLevel: 4,
        position: 2,
        category: "Cloud Security Engineer",
        featured: false,
        companyName: "CrowdStrike India"
    },
    {
        title: "Information Security Analyst",
        description: "Support the Information Security function by conducting risk assessments, managing GRC activities, implementing security policies, and ensuring regulatory compliance. Good opportunity for freshers looking to build a security career.",
        requirements: ["Security fundamentals", "Risk management basics", "CompTIA Security+", "Policy writing", "Audit experience preferred"],
        skills: ["GRC", "Risk Assessment", "ISO 27001", "NIST", "Security Policies", "Excel"],
        salary: 8,
        salaryMin: 6,
        salaryMax: 12,
        location: "Noida",
        jobType: "Full-time",
        remoteType: "On-site",
        experienceLevel: 0,
        position: 5,
        category: "Information Security Analyst",
        featured: false,
        companyName: "Paytm"
    },
    // DATA ENGINEERING
    {
        title: "Data Engineer",
        description: "Design and build our data infrastructure that processes 50TB+ of data daily. Build reliable ETL pipelines, design data warehouse schemas, optimize query performance, and enable data scientists to access clean, structured data.",
        requirements: ["Python", "SQL (Advanced)", "Apache Spark", "Airflow", "Data warehouse (Snowflake/BigQuery)", "ETL design patterns", "Kafka basics"],
        skills: ["Python", "Apache Spark", "Airflow", "Snowflake", "dbt", "Kafka", "AWS Glue", "SQL"],
        salary: 26,
        salaryMin: 20,
        salaryMax: 34,
        location: "Bengaluru",
        jobType: "Full-time",
        remoteType: "Hybrid",
        experienceLevel: 3,
        position: 3,
        category: "Data Engineer",
        featured: false,
        companyName: "Flipkart"
    },
    // TESTING & QUALITY
    {
        title: "QA Engineer - Automation",
        description: "Build robust automated test suites for our web and API products. You'll design test strategies, implement Selenium/Playwright tests, integrate with CI/CD pipelines, and establish quality standards across engineering teams.",
        requirements: ["Selenium/Playwright/Cypress", "Python or Java", "REST API testing", "CI/CD integration", "Test management tools", "Performance testing basics"],
        skills: ["Selenium", "Playwright", "Python", "Pytest", "Jenkins", "JIRA", "Postman", "K6"],
        salary: 14,
        salaryMin: 10,
        salaryMax: 20,
        location: "Hyderabad",
        jobType: "Full-time",
        remoteType: "On-site",
        experienceLevel: 2,
        position: 4,
        category: "QA Engineer",
        featured: false,
        companyName: "Infosys"
    },
    {
        title: "SDET (Software Development Engineer in Test)",
        description: "Combine software engineering skills with QA expertise to build scalable test infrastructure. Write testable code, build testing frameworks, and drive a culture of quality engineering across the organization.",
        requirements: ["Strong programming (Java/Python/Go)", "Test automation frameworks", "Performance testing", "API testing", "CI/CD", "Code review skills"],
        skills: ["Java", "TestNG", "REST Assured", "JMeter", "Docker", "CI/CD", "Selenium", "Allure"],
        salary: 22,
        salaryMin: 18,
        salaryMax: 28,
        location: "Bengaluru",
        jobType: "Full-time",
        remoteType: "Hybrid",
        experienceLevel: 3,
        position: 3,
        category: "SDET",
        featured: false,
        companyName: "Microsoft India"
    },
    // PRODUCT / MANAGEMENT
    {
        title: "Product Manager - Growth",
        description: "Lead growth product strategy for our core marketplace. Define the product vision, write detailed PRDs, partner with engineering and design, analyze user behavior, and drive key growth metrics through experimentation.",
        requirements: ["2+ years PM experience", "Data-driven decision making", "A/B testing", "Stakeholder management", "Technical understanding", "Strong communication"],
        skills: ["Product Strategy", "SQL", "A/B Testing", "Figma", "JIRA", "Analytics", "User Research"],
        salary: 28,
        salaryMin: 22,
        salaryMax: 36,
        location: "Gurugram",
        jobType: "Full-time",
        remoteType: "Hybrid",
        experienceLevel: 3,
        position: 2,
        category: "Product Manager",
        featured: true,
        companyName: "Zomato"
    },
    {
        title: "Technical Product Manager",
        description: "Bridge the gap between business requirements and engineering execution. You'll own the API product roadmap, work closely with enterprise customers, define technical specifications, and lead cross-functional teams to deliver developer-focused products.",
        requirements: ["Technical background (engineering preferred)", "API/developer products experience", "Product management", "Agile/Scrum", "Customer interviews", "Data analysis"],
        skills: ["API Design", "Product Management", "SQL", "Agile", "Figma", "Postman", "OKRs"],
        salary: 35,
        salaryMin: 28,
        salaryMax: 45,
        location: "Bengaluru",
        jobType: "Full-time",
        remoteType: "On-site",
        experienceLevel: 4,
        position: 2,
        category: "Technical Product Manager",
        featured: false,
        companyName: "Razorpay"
    },
    // DESIGN
    {
        title: "Senior UI/UX Designer",
        description: "Shape the user experience for products used by 100M+ Indians. You'll lead end-to-end design process from user research to high-fidelity prototypes, establish design systems, and collaborate with cross-functional teams.",
        requirements: ["Figma (Expert)", "User research & usability testing", "Interaction design", "Design systems", "Prototyping", "Collaboration with engineers"],
        skills: ["Figma", "User Research", "Design Systems", "Prototyping", "Adobe CC", "Accessibility", "Motion Design"],
        salary: 22,
        salaryMin: 18,
        salaryMax: 30,
        location: "Bengaluru",
        jobType: "Full-time",
        remoteType: "Hybrid",
        experienceLevel: 4,
        position: 2,
        category: "UI/UX Designer",
        featured: false,
        companyName: "Meesho"
    },
    // ADDITIONAL SPECIALIZED ROLES
    {
        title: "Solutions Architect",
        description: "Partner with enterprise customers to design and implement cloud solutions on AWS. You'll understand customer requirements, develop solution architectures, create proof-of-concepts, and ensure technical excellence in implementations.",
        requirements: ["AWS Certified Solutions Architect Professional", "Enterprise architecture", "Client engagement skills", "IaC", "Microservices", "10+ years IT experience"],
        skills: ["AWS", "Enterprise Architecture", "Solution Design", "Terraform", "Migration", "Pre-sales"],
        salary: 50,
        salaryMin: 40,
        salaryMax: 65,
        location: "Hyderabad",
        jobType: "Full-time",
        remoteType: "Hybrid",
        experienceLevel: 8,
        position: 4,
        category: "Solutions Architect",
        featured: true,
        companyName: "Amazon Web Services"
    },
    {
        title: "Blockchain Developer",
        description: "Build decentralized applications and smart contracts on Ethereum and Polygon. Work on DeFi protocols, NFT platforms, and Web3 integrations. Solid understanding of distributed systems and cryptography required.",
        requirements: ["Solidity", "Ethereum/EVM", "Web3.js/Ethers.js", "Smart contract security", "Hardhat/Truffle", "IPFS"],
        skills: ["Solidity", "Ethereum", "Hardhat", "Web3.js", "React", "Node.js", "IPFS"],
        salary: 28,
        salaryMin: 20,
        salaryMax: 40,
        location: "Remote",
        jobType: "Full-time",
        remoteType: "Remote",
        experienceLevel: 2,
        position: 3,
        category: "Blockchain Developer",
        featured: false,
        companyName: "Razorpay"
    },
    {
        title: "Database Administrator",
        description: "Manage and optimize our mission-critical databases serving 200M+ users. Own database performance tuning, backup/recovery strategies, replication setup, and ensure high availability for MySQL and MongoDB clusters.",
        requirements: ["MySQL/PostgreSQL (Expert)", "MongoDB", "Performance tuning", "Backup/Recovery", "Replication/Clustering", "Query optimization", "Linux administration"],
        skills: ["MySQL", "PostgreSQL", "MongoDB", "Redis", "Performance Tuning", "Replication", "Linux"],
        salary: 20,
        salaryMin: 16,
        salaryMax: 28,
        location: "Noida",
        jobType: "Full-time",
        remoteType: "On-site",
        experienceLevel: 5,
        position: 2,
        category: "Database Administrator",
        featured: false,
        companyName: "Paytm"
    },
    {
        title: "Fresher Software Engineer (2024/2025 Batch)",
        description: "Great opportunity for fresh graduates to kickstart their software engineering career. You'll receive structured training on Java/Python, data structures, and web development. Rotational programs across different engineering teams. No prior experience needed!",
        requirements: ["B.Tech/B.E. in CS/IT/ECE", "Strong DSA fundamentals", "Java or Python", "Basic SQL", "Good communication", "Batch 2024/2025"],
        skills: ["Java", "Python", "DSA", "SQL", "Git", "OOP"],
        salary: 6,
        salaryMin: 5,
        salaryMax: 8,
        location: "Hyderabad",
        jobType: "Full-time",
        remoteType: "On-site",
        experienceLevel: 0,
        position: 25,
        category: "Software Engineer",
        featured: false,
        companyName: "Infosys"
    },
    {
        title: "Deep Learning Engineer - Computer Vision",
        description: "Build computer vision models for product recognition, image quality assessment, and visual search at massive scale. Work with PyTorch, custom model architectures, model distillation, and high-performance inference pipelines.",
        requirements: ["Python", "PyTorch", "Deep Learning (CNNs, Transformers)", "Computer Vision (OpenCV)", "CUDA/GPU optimization", "MLOps basics"],
        skills: ["PyTorch", "Computer Vision", "OpenCV", "CUDA", "Python", "TensorRT", "Kubernetes"],
        salary: 38,
        salaryMin: 30,
        salaryMax: 50,
        location: "Bengaluru",
        jobType: "Full-time",
        remoteType: "Hybrid",
        experienceLevel: 4,
        position: 3,
        category: "Machine Learning Engineer",
        featured: true,
        companyName: "Flipkart"
    },
    {
        title: "Engineering Manager - Backend",
        description: "Lead a team of 8-12 backend engineers building Paytm's core payments infrastructure. You'll define technical roadmap, drive engineering excellence, hire and grow engineers, and collaborate with product and business leadership.",
        requirements: ["8+ years engineering experience", "3+ years management", "Strong technical background (Java/Go/Python)", "System design expertise", "Hiring & mentoring", "Agile leadership"],
        skills: ["Engineering Leadership", "System Design", "Java", "Microservices", "Agile", "Hiring", "OKRs"],
        salary: 55,
        salaryMin: 42,
        salaryMax: 70,
        location: "Noida",
        jobType: "Full-time",
        remoteType: "On-site",
        experienceLevel: 8,
        position: 1,
        category: "Engineering Manager",
        featured: false,
        companyName: "Paytm"
    },
];

async function seedDatabase() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // Find or create recruiter user (seed user)
        let recruiter = await User.findOne({ email: "recruiter@test.com" });
        if (!recruiter) {
            const hashedPassword = await bcrypt.hash("password123", 10);
            recruiter = await User.create({
                fullname: "Test Recruiter",
                email: "recruiter@test.com",
                phoneNumber: 9876543210,
                password: hashedPassword,
                role: "recruiter",
                profile: { bio: "Test recruiter account" }
            });
            console.log("✅ Created recruiter user");
        } else {
            console.log("✅ Using existing recruiter user");
        }

        // Ensure student user exists
        let student = await User.findOne({ email: "student@test.com" });
        if (!student) {
            const hashedPassword = await bcrypt.hash("password123", 10);
            student = await User.create({
                fullname: "Test Student",
                email: "student@test.com",
                phoneNumber: 1234567890,
                password: hashedPassword,
                role: "student",
                profile: {
                    bio: "Passionate software engineer looking for opportunities",
                    skills: ["React", "Node.js", "JavaScript", "Python", "SQL"]
                }
            });
            console.log("✅ Created student user");
        }

        // Seed companies
        const companyMap = {};
        for (const companyData of COMPANIES) {
            let company = await Company.findOne({ name: companyData.name });
            if (!company) {
                company = await Company.create({
                    ...companyData,
                    userId: recruiter._id
                });
                console.log(`✅ Created company: ${company.name}`);
            } else {
                console.log(`⏩ Company exists: ${company.name}`);
            }
            companyMap[company.name] = company._id;
        }

        // Clear existing jobs and re-seed
        const existingJobCount = await Job.countDocuments({ created_by: recruiter._id });
        if (existingJobCount > 0) {
            await Job.deleteMany({ created_by: recruiter._id });
            console.log(`🗑️ Cleared ${existingJobCount} existing seeded jobs`);
        }

        // Seed jobs
        let jobCount = 0;
        for (const jobData of JOBS) {
            const { companyName, ...rest } = jobData;
            const companyId = companyMap[companyName];
            if (!companyId) {
                console.warn(`⚠️ Company not found: ${companyName}, skipping job: ${jobData.title}`);
                continue;
            }

            // Normalize location
            const LOCATION_ALIASES = {
                "gurgaon": "gurugram", "gurugram": "gurugram",
                "bangalore": "bengaluru", "bengaluru": "bengaluru",
                "delhi ncr": "delhi", "delhi": "delhi",
                "noida": "noida", "hyderabad": "hyderabad",
                "pune": "pune", "mumbai": "mumbai",
                "chennai": "chennai", "kolkata": "kolkata",
                "remote": "remote", "hybrid": "hybrid",
            };
            const locNorm = LOCATION_ALIASES[rest.location.toLowerCase()] || rest.location.toLowerCase();

            await Job.create({
                ...rest,
                locationNormalized: locNorm,
                company: companyId,
                created_by: recruiter._id,
                requirements: rest.requirements, // already array
            });
            jobCount++;
        }

        console.log(`✅ Seeded ${jobCount} jobs successfully`);
        console.log("\n📋 Test Credentials:");
        console.log("   Student  - email: student@test.com   | password: password123");
        console.log("   Recruiter- email: recruiter@test.com | password: password123");
        console.log("\n🚀 Database seeding complete!");

    } catch (error) {
        console.error("❌ Seeding failed:", error);
    } finally {
        await mongoose.connection.close();
        console.log("🔒 Database connection closed");
    }
}

seedDatabase();
