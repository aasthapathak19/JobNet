import pino from "pino";
import { env } from "../config/env.js";

export const logger = pino({
    level: env.LOG_LEVEL,
    base: undefined,
    redact: {
        paths: [
            "req.headers.authorization",
            "req.headers.cookie",
            "request.headers.authorization",
            "request.headers.cookie",
            "password",
            "token",
        ],
        censor: "[REDACTED]",
    },
});
