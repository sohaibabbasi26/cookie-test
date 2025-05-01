const cloudinary = require("../configurations/cloudinaryConfig");

async function uploadVideo(filePath, video_title) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "video",
      public_id: video_title,
      overwrite: true,
      folder: "videos",
    });

    console.log("Upload Successful:", result);
    return result;
  } catch (err) {
    console.error("Error uploading video:", err);
    throw err;
  }
}

module.exports = {
    uploadVideo
}