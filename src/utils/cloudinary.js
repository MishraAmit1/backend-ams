import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
// Configure Cloudinary (should be done once in app initialization)
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new Error("Missing Cloudinary configuration environment variables");
}
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) throw new Error("No file path provided");
  try {
    await fs.access(localFilePath);
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log(
      "File uploaded successfully on Cloudinary:",
      uploadResult,
      uploadResult.secure_url
    );
    await fs.unlink(localFilePath);
    return uploadResult;
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error("Failed to upload to Cloudinary", { cause: error });
  }
};
