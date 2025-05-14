import cloudinary from "../config/cloudinary.js";

/**
 * Uploads a buffer to Cloudinary into the given folder.
 * @param {Buffer} fileBuffer – the raw bytes of the file
 * @param {string} folder – the Cloudinary folder to use (e.g. "category", "products")
 * @returns {Promise<string>} – resolves with the secure_url
 */
export function uploadBufferToCloudinary(fileBuffer, folder) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          console.error(`Cloudinary upload to ${folder} failed:`, error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
}