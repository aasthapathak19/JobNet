import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";
import { fileTypeFromFile } from "file-type";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadRoot = path.resolve(__dirname, "../uploads");

const imageMimes = new Set(["image/jpeg", "image/png", "image/webp"]);
const resumeMimes = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const createUpload = ({ folder, maxSize, allowedMimes, allowedExtensions }) => {
    const destination = path.join(uploadRoot, folder);
    fs.mkdirSync(destination, { recursive: true });

    const storage = multer.diskStorage({
        destination: (_req, _file, callback) => callback(null, destination),
        filename: (_req, file, callback) => {
            const extension = path.extname(file.originalname).toLowerCase();
            callback(null, `${randomUUID()}${extension}`);
        },
    });

    const upload = multer({
        storage,
        limits: { fileSize: maxSize, files: 1 },
        fileFilter: (_req, file, callback) => {
            const extension = path.extname(file.originalname).toLowerCase();
            if (!allowedMimes.has(file.mimetype) || !allowedExtensions.has(extension)) {
                return callback(new AppError("Unsupported file type", 400, "INVALID_FILE_TYPE"));
            }
            callback(null, true);
        },
    }).single("file");

    const verifySignature = asyncHandler(async (req, _res, next) => {
        if (!req.file) return next();
        const detected = await fileTypeFromFile(req.file.path);
        if (!detected || !allowedMimes.has(detected.mime)) {
            await fs.promises.rm(req.file.path, { force: true });
            throw new AppError("File content does not match an allowed format", 400, "INVALID_FILE_CONTENT");
        }
        req.file.publicPath = path.relative(uploadRoot, req.file.path).split(path.sep).join("/");
        next();
    });

    return [upload, verifySignature];
};

export const profileImageUpload = createUpload({
    folder: "profile-images",
    maxSize: 5 * 1024 * 1024,
    allowedMimes: imageMimes,
    allowedExtensions: new Set([".jpg", ".jpeg", ".png", ".webp"]),
});

export const companyLogoUpload = createUpload({
    folder: "company-logos",
    maxSize: 5 * 1024 * 1024,
    allowedMimes: imageMimes,
    allowedExtensions: new Set([".jpg", ".jpeg", ".png", ".webp"]),
});

export const resumeUpload = createUpload({
    folder: "resumes",
    maxSize: 10 * 1024 * 1024,
    allowedMimes: resumeMimes,
    allowedExtensions: new Set([".pdf", ".doc", ".docx"]),
});

// Compatibility export for imports that have not yet selected an upload purpose.
export const singleUpload = resumeUpload;
