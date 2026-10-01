# JobNet — Production-Grade Job Portal

A serious full-stack job platform built as a showcase of real software engineering skills — not a college demo.

## Overview

JobNet is a modern, production-oriented job portal for the Indian tech market. It supports multi-dimensional job search, relevance-based ranking, skill match scoring, and a comprehensive role taxonomy covering 50+ job categories across Software Engineering, Data & AI, Cloud/DevOps, Cybersecurity, Product, and more.

---

## Features

### Search & Discovery
- **Smart multi-filter search**: Simultaneously filter by keyword, location, industry, salary range, experience level, and work mode
- **Semantic keyword expansion**: Searching "cybersecurity" automatically finds Security Analyst, SOC Analyst, AppSec Engineer, Cloud Security Engineer, etc.
- **Relevance ranking**: Results ranked by match score — exact title match > category match > skill match > description
- **URL-driven state**: All filters serialize to URL params (`/jobs?q=devops&location=Bengaluru&salary=20-30`) — shareable and refresh-persistent
- **Search suggestions**: Real-time autocomplete from the role taxonomy as you type
- **Location alias normalization**: Bangalore = Bengaluru, Gurgaon = Gurugram — no missed results
- **Quick category browsing**: Carousel and trending role chips on homepage

### Job Cards
- Company logo with fallback initials
- Location + Remote/Hybrid/On-site badge
- Salary range display (₹12–20 LPA)
- Skill tags
- **Skill match % bar** for logged-in students
- Save/unsave with visual state
- Featured and Applied badges
- Time posted (relative)

### Job Details
- Full job description + requirements checklist
- Skill match breakdown (✓ You have / • You may need)
- Company information sidebar
- Stats: salary, experience, job type, openings count
- Share button (copies URL to clipboard)
- Save job toggle
- Apply CTA with gradient card

### Admin (Recruiter)
- Post jobs with: category, skills, salary range, work mode, experience level
- Manage companies, view applicants
- Protected routes

### UX Improvements
- Loading skeletons (not blank screens)
- Meaningful empty states with recovery actions
- Mobile-responsive navbar with hamburger menu
- Sticky navbar
- Active route highlighting
- Toast notifications for all key actions

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool |
| TailwindCSS | Styling |
| ShadCN/Radix UI | Component library |
| Redux Toolkit | State management |
| Redux Persist | State persistence |
| React Router DOM v6 | Routing + URL params |
| Framer Motion | Animations |
| Axios | API calls |
| Sonner | Toast notifications |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Multer | File uploads |
| Cloudinary | Image storage |
| dotenv | Environment config |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker | Containerization |
| Docker Compose | Multi-service orchestration |
| MongoDB Docker image | Database container |

---

## Architecture

```
JobNet/
├── backend/
│   ├── controllers/
│   │   ├── job.controller.js     # Multi-filter search, CRUD
│   │   ├── user.controller.js    # Auth, profile
│   │   ├── company.controller.js # Company management
│   │   └── application.controller.js
│   ├── models/
│   │   ├── job.model.js          # Extended: category, skills, salaryMin/Max, remoteType
│   │   ├── user.model.js         # Auth, profile, skills
│   │   ├── company.model.js      # Company info + logo
│   │   └── application.model.js
│   ├── routes/          # Express routers
│   ├── middlewares/     # Auth, file upload
│   ├── utils/           # DB connect, Cloudinary, datauri
│   └── seed.js          # Comprehensive seed: 10 companies, 33 jobs
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── FilterCard.jsx       # Multi-filter sidebar (5 dimensions)
    │   │   ├── HeroSection.jsx      # Search with autocomplete
    │   │   ├── Job.jsx              # Rich job card with skill match
    │   │   ├── JobDescription.jsx   # Full job detail page
    │   │   ├── Jobs.jsx             # Main jobs page, URL sync
    │   │   ├── Browse.jsx           # Browse page
    │   │   ├── JobSkeleton.jsx      # Loading placeholder
    │   │   ├── CategoryCarousel.jsx # 14 category quick-filters
    │   │   ├── LatestJobs.jsx       # Homepage job section
    │   │   └── admin/               # Recruiter admin pages
    │   ├── redux/
    │   │   ├── jobSlice.js          # Structured filters state
    │   │   ├── authSlice.js         # User auth state
    │   │   └── store.js             # Redux store with persist
    │   ├── hooks/
    │   │   └── useGetAllJobs.jsx    # Reactive to all filter dimensions
    │   └── utils/
    │       ├── searchUtils.js       # Search pipeline, ranking, utilities
    │       └── constant.js          # API endpoints
```

---

## Search/Filter Architecture

### Pipeline (client-side, applied on top of server results)

```
User Input
  → Normalize Query (lowercase, trim)
  → Expand Keywords (e.g. "cybersecurity" → 10 related terms)
  → Filter by Text Search (title, category, skills, requirements, description)
  → Filter by Location (with alias normalization)
  → Filter by Category/Industry (with semantic expansion)
  → Filter by Salary Range (numeric overlap logic)
  → Filter by Experience Level
  → Filter by Work Mode (Remote/Hybrid/On-site)
  → Score by Relevance (if query present)
  → Sort (by relevance + recency | salary high | salary low)
  → Render
```

### Relevance Scoring
| Signal | Score |
|---|---|
| Exact title match | +100 |
| Title starts with query | +80 |
| Title contains query | +60 |
| Category exact match | +50 |
| Category contains query | +35 |
| Expanded keyword in title | +40 |
| Expanded keyword in category | +30 |
| Exact skill match | +45 |
| Skill partial match | +25 |
| Expanded keyword in skills | +20 |
| Description match | +5–10 |

### Salary Filtering
Salary stored as numeric LPA (e.g. `salaryMin: 12, salaryMax: 20`). Range overlap logic:
- A job paying ₹10–15 LPA matches a filter for ₹12+ because the ranges overlap
- Never compares display strings

### Location Normalization
```js
"Gurgaon" → "gurugram"
"Bangalore" → "bengaluru"
"Delhi NCR" → "delhi"
```

---

## Unique Features

1. **Semantic category expansion** — "Cybersecurity" finds Security Analyst, SOC Analyst, AppSec Engineer, Cloud Security, Information Security
2. **Skill match scoring** — Shows % match between user profile skills and job requirements, with ✓ matched and • missing breakdown
3. **URL-driven filter state** — `/jobs?q=devops&location=Bengaluru&salary=20-30` is fully shareable and refresh-persistent
4. **Structured salary data** — Internal `salaryMin`/`salaryMax` with overlap-based range matching
5. **Multi-dimensional simultaneous filtering** — All 5 filter dimensions are independent and combineable
6. **Trending roles section** — Curated high-growth roles on homepage

---

## Setup

### Prerequisites
- Docker Desktop
- Node.js 18+ (for local dev without Docker)

### Quick Start (Docker)

```bash
git clone <repo>
cd JobNet
docker compose up --build -d
```

Then seed the database:
```bash
cd backend
npm install
MONGO_URI=mongodb://localhost:27017/jobnet node seed.js
```

Access:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **MongoDB**: mongodb://localhost:27017/jobnet

### Test Credentials
| Role | Email | Password |
|---|---|---|
| Student | student@test.com | password123 |
| Recruiter | recruiter@test.com | password123 |

---

## Environment Variables

Create `backend/.env`:
```env
PORT=8000
MONGO_URI=mongodb://mongo:27017/jobnet
SECRET_KEY=your_jwt_secret_here
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
```

> **Note**: Cloudinary is only required for profile photo and resume uploads. The core job search functionality works without it.

---

## Running Locally (without Docker)

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Future Improvements

- [ ] Pagination / infinite scroll for large job sets
- [ ] Email notifications for job applications
- [ ] Admin dashboard analytics
- [ ] Job alerts (saved searches with notifications)
- [ ] Candidate resume parsing
- [ ] Company reviews/ratings
- [ ] Interview scheduling integration
- [ ] Advanced AI-powered job matching using embeddings
- [ ] Mobile app (React Native)

---

## Engineering Notes

Built to demonstrate:
- Thoughtful data modeling (extended job schema with category, skills, salary ranges, remoteType)
- Reusable utility functions (searchUtils.js)
- Real search/filter logic (semantic expansion, relevance scoring, overlap matching)
- Proper state management (structured Redux filters, not a single string)
- URL-driven filter state (shareable, refresh-persistent)
- Production patterns (loading states, error handling, empty states with recovery)
- Mobile responsiveness
- Clean folder structure and separation of concerns
