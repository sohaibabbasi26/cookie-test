const cloudinary = require("../configurations/cloudinaryConfig");

async function uploadImage(filePath, image_title) {
  try {
    const cloudinaryResponse = await cloudinary.uploader.upload(filePath.path, {
        resource_type: 'image',
        folder: 'images', 
        public_id: image_title,  
    });

    console.log("Upload Successful:", cloudinaryResponse);
    return cloudinaryResponse;
  } catch (err) {
    console.error("Error uploading image:", err);
    throw err;
  }
}


module.exports = {
    uploadImage
}