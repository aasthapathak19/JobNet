# JobNet Security Audit

Audit date: 2026-10-08

## Executive summary

The original application trusted frontend route guards, exposed recruiter resources without consistent ownership checks, accepted weakly validated input, and used development-oriented cookie, CORS, upload, and error behavior. The upgrade moves these controls to the API and establishes deny-by-default role and ownership checks for sensitive operations.

No known critical or high-severity application-level issue remains in the implemented flows. The residual items below are deployment or hardening work that should be addressed before handling real applicant documents at scale.

## Controls verified

### Authentication

- JWTs are accepted only from the configured HTTP-only cookie.
- Signature, malformed-token, expired-token, missing-user, and missing-token cases return explicit `401` responses.
- Password hashes use bcrypt and are excluded from normal Mongoose queries and JSON output.
- Login is rate limited and returns a generic invalid-credentials response.
- Logout clears the cookie with the same cookie attributes used when setting it.
- Production startup requires a non-default JWT secret of sufficient length.

### Authorization and IDOR

- Student and recruiter permissions are enforced by backend middleware.
- Company reads and updates verify the authenticated recruiter owns the company.
- Job changes verify `postedBy` ownership.
- Applicant lists verify ownership of the related job.
- Application status changes load the application and verify ownership of its job.
- Public job details expose an aggregate application count, not applicant identities.
- Dashboard queries derive identity from authentication and do not accept a client-supplied owner ID.

### Input and files

- Zod rejects malformed bodies, parameters, query values, unsupported enums, and excessive page sizes before controller logic.
- User-controlled regular-expression input is escaped.
- MongoDB IDs are structurally validated before use.
- Profile images, logos, and resumes have separate extension, MIME, detected-signature, and size policies.
- Failed or unauthorized staged uploads are removed by error handling.
- Request bodies are size limited and malformed JSON receives a stable error response.

### HTTP and operational security

- Helmet supplies standard response security headers.
- CORS uses an environment allowlist and credentialed requests.
- HPP reduces query parameter pollution.
- General and authentication-specific rate limits are active.
- Production errors omit stack traces and internal exception details.
- Structured logs redact authorization, cookies, passwords, tokens, and common sensitive fields.
- Request IDs support correlation without exposing sensitive values.
- Graceful shutdown closes HTTP and MongoDB resources.

## CSRF posture

Cookie authentication creates CSRF considerations. The default deployment uses a same-site frontend/API path through Nginx, an origin allowlist, JSON request bodies, and a configurable SameSite cookie. This is appropriate when `COOKIE_SAME_SITE=lax` or `strict` and frontend/API are same-site.

If a deployment requires `COOKIE_SAME_SITE=none` for a cross-site frontend, add a synchronizer or signed double-submit CSRF token before launch. CORS alone is not a complete CSRF defense for every request shape.

## XSS posture

React escapes ordinary rendered strings and no raw HTML rendering path is used in the reviewed screens. Helmet adds browser protections. User content should continue to be rendered as text; any future rich-text job description feature must use a maintained allowlist sanitizer on the server and client.

## Dependency status

- Backend production and development dependency audit: no known vulnerabilities at audit time.
- The frontend runtime dependency updates are applied.
- Remaining frontend audit advisories are in the Vite/Tailwind build toolchain and npm proposes breaking major-version migrations. They are not shipped in the final Nginx runtime image. Upgrade Vite and Tailwind in a dedicated compatibility change rather than using `npm audit fix --force` blindly.

Dependency reports are time-sensitive and must be rerun in CI or by a dependency update service.

## Residual risks and follow-up

1. Resume URLs are directly retrievable when local storage or public Cloudinary delivery is used. Real applicant data should use private/authenticated assets and short-lived signed download URLs.
2. Replacing or deleting an upload clears the database reference but does not yet destroy the previous Cloudinary asset. Store provider public IDs and delete superseded objects to prevent orphaned files.
3. SameSite `none` deployments need explicit CSRF tokens as described above.
4. Existing databases may contain legacy status values or duplicates that conflict with new enums and unique indexes. Run a reviewed migration and backup before first production rollout.
5. Account recovery, email verification, credential rotation, audit-log retention, and administrator incident tooling are outside the current product scope.
6. Rate limiting is process-local. A horizontally scaled deployment should use a shared Redis-compatible rate-limit store.
7. Secrets should come from a managed secret store in hosted environments, with MongoDB network controls, encryption, backups, and tested restore procedures.

## Verification evidence

Automated tests cover validation and error contracts, malformed JSON, missing/invalid/expired authentication, student/recruiter role boundaries, cross-recruiter job ownership, and pagination limits. An isolated end-to-end API smoke flow verified recruiter company/job creation, candidate search/save/apply, recruiter applicant access/status update, and candidate status tracking.

Security testing should remain part of every release. Add authenticated browser E2E tests and a deployment-level dynamic scan once a stable staging URL is available.
