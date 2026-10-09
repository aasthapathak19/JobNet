import fs from "node:fs";
import cloudinary from "./cloudinary.js";
import { env } from "../config/env.js";
import { AppError } from "./appError.js";

const localUrl = (file) => `${env.SERVER_URL.replace(/\/$/, "")}/uploads/${file.publicPath || file.filename}`;

export const storeUploadedFile = async (file, folder) => {
    if (!file) return undefined;
    if (env.STORAGE_PROVIDER === "local") {
        file.persisted = true;
        return localUrl(file);
    }

    try {
        const result = await cloudinary.uploader.upload(file.path, {
            folder: `JobNet/${folder}`,
            resource_type: "auto",
            use_filename: true,
            unique_filename: true,
            overwrite: false,
        });
        await fs.promises.rm(file.path, { force: true });
        return result.secure_url;
    } catch (_error) {
        await fs.promises.rm(file.path, { force: true });
        throw new AppError("File upload failed. Please try again", 502, "FILE_STORAGE_ERROR");
    }
};
