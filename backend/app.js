import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import { rateLimit } from "express-rate-limit";
import pinoHttp from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { AppError } from "./utils/appError.js";
import { requestId } from "./middlewares/requestId.js";
import { globalErrorHandler, notFound } from "./middlewares/error.middleware.js";
import healthRoute from "./routes/health.route.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import dashboardRoute from "./routes/dashboard.route.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.disable("x-powered-by");
if (env.TRUST_PROXY) app.set("trust proxy", 1);

app.use(requestId);
app.use(pinoHttp({
    logger,
    genReqId: (req) => req.requestId,
    customProps: (req) => ({ requestId: req.requestId }),
    serializers: {
        req: (req) => ({ method: req.method, url: req.url, requestId: req.requestId }),
        res: (res) => ({ statusCode: res.statusCode }),
    },
}));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
    credentials: true,
    origin(origin, callback) {
        if (!origin || env.clientOrigins.includes(origin)) return callback(null, true);
        return callback(new AppError("Origin is not allowed by CORS", 403, "CORS_ORIGIN_DENIED"));
    },
}));
app.use(rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    limit: env.RATE_LIMIT_MAX,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: (req) => req.path === "/health" || req.path === "/ready",
}));
app.use(express.json({ limit: env.BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: env.BODY_LIMIT }));
app.use(cookieParser());
app.use(hpp());

app.use(healthRoute);
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
    dotfiles: "deny",
    fallthrough: false,
    maxAge: env.NODE_ENV === "production" ? "1d" : 0,
}));

app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/dashboard", dashboardRoute);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
