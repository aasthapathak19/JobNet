# JobNet

JobNet is a full-stack recruitment platform for candidates and recruiters. It keeps the original React, Express, and MongoDB architecture while adding server-side search, persistent saved jobs, role and ownership authorization, secure uploads, operational health checks, automated tests, and production containers.

## Capabilities

### Candidates

- Register and authenticate with an HTTP-only cookie.
- Maintain a profile, photo, skills, and resume.
- Search and filter active jobs with server-side pagination.
- Save jobs persistently across sessions and devices.
- Apply once per job and track the application lifecycle.
- View profile completion, recent activity, and explainable job matches.

### Recruiters

- Create and manage only their own companies.
- Create, edit, publish, close, and archive owned jobs.
- View applicants only for owned jobs.
- Move applications through a recorded status history.
- View owned-job and applicant dashboard metrics.

## Technology

- Frontend: React 18, Vite, Tailwind CSS, Redux Toolkit, React Router, Axios, Radix UI, Lucide.
- Backend: Node.js 22, Express 4, MongoDB, Mongoose, Zod, JWT, Multer, Cloudinary, Pino.
- Quality: Vitest, Testing Library, Supertest, ESLint, GitHub Actions.
- Deployment: multi-stage Docker images, Nginx, Docker Compose.

## Quick Start With Docker

Requirements: Docker Desktop and Docker Compose.

```bash
git clone https://github.com/aasthapathak19/JobNet.git
cd JobNet
docker compose up --build
```

Open:

- Frontend: `http://localhost:5173`
- API: `http://localhost:8000`
- Liveness: `http://localhost:8000/health`
- Readiness: `http://localhost:8000/ready`

The development stack uses local upload storage and a named MongoDB volume. Register accounts through the UI; no default credentials are embedded in the application.

## Local Development

Requirements: Node.js 22 and MongoDB 7.

```bash
cd backend
copy .env.example .env
npm ci
npm run dev
```

In a second terminal:

```bash
cd frontend
copy .env.example .env
npm ci
npm run dev
```

Vite proxies `/api` and `/uploads` to the backend during local development.

## Configuration

Backend configuration is validated at startup. See [`backend/.env.example`](backend/.env.example) and [`backend/.env.production.example`](backend/.env.production.example).

Important values:

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Strong JWT signing secret |
| `CLIENT_URL` | Comma-separated browser origin allowlist |
| `SERVER_URL` | Public API origin used for local upload URLs |
| `COOKIE_SAME_SITE` | Cookie SameSite policy |
| `STORAGE_PROVIDER` | `local` for development or `cloudinary` for production |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

Never commit a real `.env` file. Production configuration rejects weak JWT secrets, insecure cookie settings, and missing Cloudinary credentials when Cloudinary storage is selected.

## Commands

Backend:

```bash
npm run check
npm test
npm start
```

Frontend:

```bash
npm run lint
npm test
npm run build
```

## Production-Like Deployment

Create an untracked `backend/.env.production`, then run:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

The frontend image compiles the React application and serves static assets through Nginx. The backend image installs production dependencies and runs as a non-root user with `node index.js`. Secrets are injected at runtime and are not copied into either image.

## Documentation

- [Project audit](docs/PROJECT_AUDIT.md)
- [API reference](docs/API.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Security audit](docs/SECURITY_AUDIT.md)

## API Conventions

- Base path: `/api/v1`
- Authentication: credentialed HTTP-only cookie
- Errors: `{ success, message, code, requestId }`
- List endpoints: bounded pagination, maximum page size 50
- Authorization: backend role and resource ownership checks

## Repository Layout

```text
backend/                 Express API, models, validation, tests
frontend/                React application and component tests
docs/                    Audit, API, architecture, and security docs
.github/workflows/ci.yml Continuous integration pipeline
docker-compose.yml       Local development stack
docker-compose.prod.yml  Production-like stack
```

## Current Scope

Job matching and recommendations use deterministic, explainable scoring based on skills and job data. This deliberately avoids opaque ML behavior. Email notifications, interview scheduling, resume parsing, and private document delivery are suitable next-stage integrations, not hidden or partially implemented features.
