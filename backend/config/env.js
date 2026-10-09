import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const booleanFromString = z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true");

const envSchema = z
    .object({
        NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
        PORT: z.coerce.number().int().min(1).max(65535).default(8000),
        MONGO_URI: z.string().min(1, "MONGO_URI is required"),
        JWT_SECRET: z.string().min(32).optional(),
        SECRET_KEY: z.string().min(1).optional(),
        JWT_EXPIRES_IN: z.string().default("1d"),
        CLIENT_URL: z.string().default("http://localhost:5173"),
        SERVER_URL: z.string().default("http://localhost:8000"),
        COOKIE_NAME: z.string().default("token"),
        COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
        COOKIE_SECURE: booleanFromString,
        COOKIE_MAX_AGE_MS: z.coerce.number().int().positive().default(86400000),
        RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
        RATE_LIMIT_MAX: z.coerce.number().int().positive().default(200),
        AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
        BODY_LIMIT: z.string().default("100kb"),
        TRUST_PROXY: booleanFromString,
        LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
        STORAGE_PROVIDER: z.enum(["local", "cloudinary"]).default("local"),
        CLOUDINARY_CLOUD_NAME: z.string().optional(),
        CLOUDINARY_API_KEY: z.string().optional(),
        CLOUDINARY_API_SECRET: z.string().optional(),
        CLOUD_NAME: z.string().optional(),
        API_KEY: z.string().optional(),
        API_SECRET: z.string().optional(),
    })
    .superRefine((values, context) => {
        const secret = values.JWT_SECRET || values.SECRET_KEY;
        if (!secret || (values.NODE_ENV === "production" && secret.length < 32)) {
            context.addIssue({
                code: "custom",
                path: ["JWT_SECRET"],
                message: "JWT_SECRET must be at least 32 characters in production",
            });
        }

        if (values.COOKIE_SAME_SITE === "none" && !values.COOKIE_SECURE) {
            context.addIssue({
                code: "custom",
                path: ["COOKIE_SECURE"],
                message: "COOKIE_SECURE must be true when COOKIE_SAME_SITE is none",
            });
        }

        if (values.STORAGE_PROVIDER === "cloudinary") {
            const credentials = [
                values.CLOUDINARY_CLOUD_NAME || values.CLOUD_NAME,
                values.CLOUDINARY_API_KEY || values.API_KEY,
                values.CLOUDINARY_API_SECRET || values.API_SECRET,
            ];
            if (credentials.some((credential) => !credential)) {
                context.addIssue({ code: "custom", path: ["STORAGE_PROVIDER"], message: "Cloudinary credentials are required when STORAGE_PROVIDER is cloudinary" });
            }
        }
    });

const result = envSchema.safeParse(process.env);

if (!result.success) {
    const details = result.error.issues
        .map((issue) => `${issue.path.join(".") || "environment"}: ${issue.message}`)
        .join("; ");
    throw new Error(`Invalid environment configuration: ${details}`);
}

const values = result.data;

export const env = Object.freeze({
    ...values,
    jwtSecret: values.JWT_SECRET || values.SECRET_KEY,
    clientOrigins: values.CLIENT_URL.split(",").map((origin) => origin.trim()).filter(Boolean),
    cloudinary: {
        cloudName: values.CLOUDINARY_CLOUD_NAME || values.CLOUD_NAME,
        apiKey: values.CLOUDINARY_API_KEY || values.API_KEY,
        apiSecret: values.CLOUDINARY_API_SECRET || values.API_SECRET,
    },
});
