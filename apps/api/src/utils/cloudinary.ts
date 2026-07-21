import { ApiError } from "@repo/utils";
import { v2 as cloudinary } from "cloudinary";
import fs from "node:fs/promises";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const uploadOnCloudinary = async (localFilePath: string) => {
  try {
    if (!localFilePath) return null;
    return await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to upload profile picture";
    throw new ApiError(502, message);
  } finally {
    if (localFilePath) await fs.unlink(localFilePath).catch(() => undefined);
  }
};
