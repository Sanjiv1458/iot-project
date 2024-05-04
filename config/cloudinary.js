import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("api thing: ",process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET);

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload the file on Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // Remove the local file after successful upload
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;

    // Delete the file from Cloudinary
    const response = await cloudinary.uploader.destroy(publicId);

    return response;
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
