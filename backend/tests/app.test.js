import request from "supertest";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

let app;
let jwt;
let User;
let Job;
const studentId = "64b000000000000000000001";
const recruiterId = "64b000000000000000000002";

beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.LOG_LEVEL = "silent";
    process.env.MONGO_URI ||= "mongodb://127.0.0.1:27017/jobnet-test";
    process.env.JWT_SECRET ||= "test-only-secret-that-is-at-least-32-characters";
    ({ default: app } = await import("../app.js"));
    ({ default: jwt } = await import("jsonwebtoken"));
    ({ default: User } = await import("../models/user.model.js"));
    ({ default: Job } = await import("../models/job.model.js"));
});

afterEach(() => vi.restoreAllMocks());

const mockCurrentUser = (role, id) => {
    vi.spyOn(User, "findById").mockReturnValue({
        select: () => ({ lean: async () => ({ _id: id, fullname: "Test User", email: "test@example.com", role, profile: {} }) }),
    });
    return jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: "5m" });
};

describe("service health", () => {
    it("reports liveness without requiring the database", async () => {
        const response = await request(app).get("/health");
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ success: true, status: "ok", environment: "test" });
        expect(response.body.database.connected).toBe(false);
        expect(response.headers["x-request-id"]).toBeTruthy();
    });

    it("fails readiness while MongoDB is disconnected", async () => {
        const response = await request(app).get("/ready");
        expect(response.status).toBe(503);
        expect(response.body).toMatchObject({ success: false, status: "not_ready" });
    });
});

describe("error contract", () => {
    it("returns a consistent not-found response", async () => {
        const response = await request(app).get("/does-not-exist");
        expect(response.status).toBe(404);
        expect(response.body).toMatchObject({ success: false, code: "ROUTE_NOT_FOUND" });
        expect(response.body.requestId).toBeTruthy();
    });

    it("rejects malformed JSON", async () => {
        const response = await request(app)
            .post("/api/v1/user/login")
            .set("Content-Type", "application/json")
            .send('{"email":');
        expect(response.status).toBe(400);
        expect(response.body.code).toBe("INVALID_JSON");
    });

    it("rejects invalid registration input before controller logic", async () => {
        const response = await request(app).post("/api/v1/user/register").send({ email: "bad" });
        expect(response.status).toBe(400);
        expect(response.body.code).toBe("VALIDATION_ERROR");
    });
});

describe("authentication boundary", () => {
    it("rejects missing authentication", async () => {
        const response = await request(app).get("/api/v1/user/me");
        expect(response.status).toBe(401);
        expect(response.body.code).toBe("AUTH_REQUIRED");
    });

    it("always responds to an invalid JWT", async () => {
        const response = await request(app).get("/api/v1/user/me").set("Cookie", "token=not-a-jwt");
        expect(response.status).toBe(401);
        expect(response.body.code).toBe("INVALID_TOKEN");
    });

    it("always responds to an expired JWT", async () => {
        const token = jwt.sign({ userId: studentId }, process.env.JWT_SECRET, { expiresIn: -1 });
        const response = await request(app).get("/api/v1/user/me").set("Cookie", `token=${token}`);
        expect(response.status).toBe(401);
        expect(response.body.code).toBe("TOKEN_EXPIRED");
    });
});

describe("authorization boundary", () => {
    it("prevents a student from posting a job", async () => {
        const token = mockCurrentUser("student", studentId);
        const response = await request(app).post("/api/v1/job/post").set("Cookie", `token=${token}`).send({});
        expect(response.status).toBe(403);
        expect(response.body.code).toBe("FORBIDDEN");
    });

    it("allows a recruiter through the role gate before validating job input", async () => {
        const token = mockCurrentUser("recruiter", recruiterId);
        const response = await request(app).post("/api/v1/job/post").set("Cookie", `token=${token}`).send({});
        expect(response.status).toBe(400);
        expect(response.body.code).toBe("VALIDATION_ERROR");
    });

    it("prevents a recruiter from archiving another recruiter's job", async () => {
        const token = mockCurrentUser("recruiter", recruiterId);
        vi.spyOn(Job, "findById").mockResolvedValue({
            _id: "64b000000000000000000010",
            created_by: { toString: () => "64b000000000000000000099" },
        });
        const response = await request(app)
            .delete("/api/v1/job/64b000000000000000000010")
            .set("Cookie", `token=${token}`);
        expect(response.status).toBe(403);
        expect(response.body.code).toBe("JOB_OWNERSHIP_REQUIRED");
    });

    it("rejects unbounded job page sizes before querying MongoDB", async () => {
        const response = await request(app).get("/api/v1/job/get?limit=5000");
        expect(response.status).toBe(400);
        expect(response.body.code).toBe("VALIDATION_ERROR");
    });
});
