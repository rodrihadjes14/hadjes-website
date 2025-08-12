// utils/cloudinary.js
const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');

function configFromEnv() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET 
} = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || 
!CLOUDINARY_API_SECRET) {
    // keep this message on ONE line, plain quotes only:
    throw new Error('Missing CLOUDINARY_* env vars');
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
  });
  return cloudinary;
}

function uploadBuffer(buffer, folder = 'listings', options = {}) {
  const c = configFromEnv();
  return new Promise((resolve, reject) => {
    const stream = c.uploader.upload_stream(
      { folder, resource_type: 'image', overwrite: false, ...options },
      (err, result) => {
        if (err) return reject(err);
        resolve({
          url: result.secure_url,
          width: result.width,
          height: result.height,
          public_id: result.public_id
        });
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

module.exports = { configFromEnv, uploadBuffer };

