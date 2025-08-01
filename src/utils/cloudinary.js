import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadCloudinary = async (filepath) => {
  try {
    if (!filepath) throw new Error("File path is required");
    const response=await cloudinary.uploader.upload(filepath, {
      resource_type: "auto",
    });
    console.log("File uploaded successfully to Cloudinary",
        response.url);
    fs.unlinkSync(filepath); // Delete the local file after upload
    console.log("Local file deleted successfully");
        return response;
  } catch (error) {
    fs.unlinkSync(filepath);
    return null;
  }
};

export {uploadCloudinary};
