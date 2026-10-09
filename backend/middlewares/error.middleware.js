import multer from "multer";
import fs from "node:fs";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { AppError } from "../utils/appError.js";
import { logger } from "../utils/logger.js";

export const notFound = (req, res, next) => {
    next(new AppError(`Route ${req.method} ${req.originalUrl} was not found`, 404, "ROUTE_NOT_FOUND"));
};

const normalizeError = (error) => {
    if (error instanceof AppError) return error;

    if (error instanceof ZodError) {
        return new AppError("Request validation failed", 400, "VALIDATION_ERROR", error.flatten());
    }

    if (error instanceof multer.MulterError) {
        const message = error.code === "LIMIT_FILE_SIZE" ? "Uploaded file is too large" : error.message;
        return new AppError(message, 400, "UPLOAD_ERROR");
    }

    if (error?.name === "CastError") {
        return new AppError("The requested resource identifier is invalid", 400, "INVALID_ID");
    }

    if (error?.code === 11000) {
        return new AppError("A resource with those details already exists", 409, "DUPLICATE_RESOURCE");
    }

    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
        return new AppError("Request body contains invalid JSON", 400, "INVALID_JSON");
    }

    return new AppError("Internal server error", 500, "INTERNAL_ERROR");
};

export const globalErrorHandler = (error, req, res, _next) => {
    const normalized = normalizeError(error);
    const statusCode = normalized.statusCode || 500;
    const context = { err: error, requestId: req.requestId, method: req.method, path: req.originalUrl, statusCode };

    if (statusCode >= 500) logger.error(context, "Request failed");
    else logger.warn(context, "Request rejected");

    if (req.file?.path && !req.file.persisted) {
        fs.rm(req.file.path, { force: true }, () => {});
    }

    const response = {
        success: false,
        message: normalized.message,
        code: normalized.code,
        requestId: req.requestId,
    };

    if (normalized.details) response.details = normalized.details;
    if (env.NODE_ENV !== "production" && statusCode >= 500) response.stack = error.stack;

    res.status(statusCode).json(response);
};
