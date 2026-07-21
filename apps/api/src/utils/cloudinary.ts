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
    if (!process.env.CLOUDINARY_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new ApiError(503, "Profile image storage is not configured");
    }

    if (!localFilePath) return null;
    return await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
      timeout: 30_000,
    });
  } catch (error: unknown) {
    // The storage provider is upstream of this API. Keep its diagnostic in the
    // server log, but return a stable message that the client can safely show.
    console.error("Cloudinary profile upload failed", error);
    throw new ApiError(502, "Profile image storage is temporarily unavailable. Please try again.");
  } finally {
    if (localFilePath) await fs.unlink(localFilePath).catch(() => undefined);
  }
};
