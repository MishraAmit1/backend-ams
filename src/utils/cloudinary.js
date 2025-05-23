import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
// Configure Cloudinary (should be done once in app initialization)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;
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
    return uploadResult;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;
  } finally {
    try {
      await fs.unlink(localFilePath);
    } catch (cleanupError) {
      console.error("Error cleaning up local file:", cleanupError);
    }
  }
};
