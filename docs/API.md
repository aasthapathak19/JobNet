# JobNet API

Base path: `/api/v1`

Authentication uses an HTTP-only cookie. Requests that mutate data must include credentials. Every error uses this shape:

```json
{
  "success": false,
  "message": "Human-readable message",
  "code": "STABLE_ERROR_CODE",
  "requestId": "request-correlation-id"
}
```

Validation errors may also include `details`. Production responses never include stack traces.

## Service health

### `GET /health`

- Auth: none
- Returns: process liveness, database connection state, environment, uptime, and timestamp.
- Status: `200` while the API process is alive, even if MongoDB is unavailable.

### `GET /ready`

- Auth: none
- Returns the same operational fields as health.
- Status: `200` when MongoDB is connected; `503` otherwise.

## Authentication and users

### `POST /user/register`

- Auth: none
- Rate limited: yes
- Content type: `multipart/form-data`
- Body: `fullname`, `email`, `phoneNumber`, `password`, `role` (`student` or `recruiter`), optional image `file`.
- Success: `201` with the created public user.
- Errors: `400 VALIDATION_ERROR`, `400 INVALID_FILE_TYPE`, `409 EMAIL_IN_USE`, `429` rate limit.

### `POST /user/login`

- Auth: none
- Rate limited: yes
- Body: `email`, `password`, optional `role` for existing-client compatibility.
- Success: `200`; sets the auth cookie and returns the public user.
- Errors: `400 VALIDATION_ERROR`, `401 INVALID_CREDENTIALS`, `429` rate limit.

### `POST /user/logout`

- Auth: required
- Success: `200`; clears the auth cookie.

### `GET /user/me`

- Auth: required
- Success: `200` with the current public user.
- Errors: `401 AUTH_REQUIRED`, `401 INVALID_TOKEN`, `401 TOKEN_EXPIRED`.

### `POST /user/profile/update`

- Auth: required
- Content type: `multipart/form-data`
- Body: optional `fullname`, `email`, `phoneNumber`, `bio`, comma-separated/array `skills`, resume `file`.
- Resume formats: PDF, DOC, DOCX; maximum 10 MiB; content signature is checked.
- Success: `200` with the updated user.

### `POST /user/profile/photo`

- Auth: required
- Content type: `multipart/form-data`
- Body: profile image `file`.
- Formats: JPG, PNG, WebP; maximum 5 MiB; content signature is checked.
- Success: `200` with the updated user.

### `DELETE /user/profile/resume`

- Auth: required
- Success: `200` and updated user with resume fields cleared.

## Companies

All company management endpoints require a recruiter. ID-based endpoints also require ownership.

### `POST /company/register`

- Body: `companyName` or `name`.
- Success: `201` with the company.
- Errors: `403 FORBIDDEN`, `409 COMPANY_EXISTS`.

### `GET /company/get`

- Returns only companies owned by the current recruiter.

### `GET /company/get/:id`

- Returns an owned company.
- Errors: `400 INVALID_ID`, `403 COMPANY_OWNERSHIP_REQUIRED`, `404 COMPANY_NOT_FOUND`.

### `PUT /company/update/:id`

- Content type: `multipart/form-data`
- Body: optional `name`, `description`, `website`, `location`, logo `file`.
- Logo formats: JPG, PNG, WebP; maximum 5 MiB; content signature is checked.

## Jobs

### `GET /job/get`

- Auth: none
- Query: `keyword`, `location`, `category`, `salaryMin`, `salaryMax`, `experience`, `remoteType`, `jobType`, comma-separated `skills`, `sort`, `page`, `limit`.
- Sort: `recent`, `oldest`, `salary-high`, `salary-low`, or `relevance`.
- Pagination: page defaults to 1, limit defaults to 20 and is capped at 50.
- Keyword ordering uses title exact match, title prefix, title containment, category match, then recency.

```json
{
  "success": true,
  "jobs": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 125,
    "totalPages": 7,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### `GET /job/get/:id`

- Auth: none
- Returns job/company details and `applicationCount`; applicant identities are never exposed here.

### `POST /job/post`

- Auth: recruiter
- Ownership: `companyId` must belong to the recruiter.
- Body: `title`, `description`, `requirements`, optional `skills`, `salary` or `salaryMin`/`salaryMax`, `location`, `remoteType`, `jobType`, `experience`, `position`, `companyId`, optional `category`, `status`, `applicationDeadline`, `featured`.
- Success: `201` with the job.

### `GET /job/getadminjobs`

- Auth: recruiter
- Returns non-archived jobs posted by the recruiter.

### `PUT /job/:id`

- Auth: recruiter and job owner
- Body: any validated job fields to update.

### `DELETE /job/:id`

- Auth: recruiter and job owner
- Behavior: archives the job rather than physically deleting it.

## Saved jobs

All saved-job endpoints require a student account.

### `POST /job/:id/save`

- Saves the job idempotently.
- Success: `201`.

### `DELETE /job/:id/save`

- Removes the saved relationship idempotently.

### `GET /job/saved`

- Returns populated jobs and companies in newest-saved order.

## Applications

### `POST /application/apply/:id`

- Auth: student
- Creates one application per student/job and stores a resume URL snapshot.
- Success: `201`.
- Errors: `404 JOB_NOT_AVAILABLE`, `409 DUPLICATE_RESOURCE`.

### `GET /application/get`

- Auth: student
- Returns the student's applications, newest first, with populated job and company.

### `GET /application/:id/applicants`

- Auth: recruiter and job owner
- `id` is the job ID.
- Returns the job with a populated `applications` array for compatibility with the recruiter table.

### `PATCH /application/status/:id`

- Auth: recruiter owning the application's job
- `id` is the application ID.
- Body: `status`, optional `note`.
- Statuses: `Applied`, `Under Review`, `Shortlisted`, `Interview`, `Selected`, `Rejected`, `Withdrawn`.
- Updates `statusHistory` and `lastUpdatedBy`.
- Compatibility: `POST /application/status/:id/update` accepts the same body.

## Dashboards

### `GET /dashboard/candidate`

- Auth: student
- Returns profile completion, application/saved counts, recent applications, recent jobs, and explainable deterministic job matches.

### `GET /dashboard/recruiter`

- Auth: recruiter
- Returns owned-job and applicant metrics, recent owned jobs, and status totals.

Dashboard data is always scoped to the authenticated user; the client cannot provide an owner ID.

## Operational notes

- Send `X-Request-Id` to preserve an upstream correlation ID; otherwise the API generates one.
- Allowed browser origins come from comma-separated `CLIENT_URL`.
