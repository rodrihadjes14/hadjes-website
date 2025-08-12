// middleware/upload.js
const multer = require('multer');

/* Use memoryStorage so we can stream to Cloudinary (no temp files on 
disk) */
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    files: 20,                 // max number of images per request
    fileSize: 8 * 1024 * 1024  // 8MB each (adjust if needed)
  },
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  }
});

module.exports = { upload };

