const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { sendError } = require('../utils/response');

// Base upload directory
const baseUploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');

// Ensure base upload directory exists
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}

/**
 * Multer storage configuration
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folderName = 'platform'; // Default for super-admin or unknown
    
    // If tenant-isolated (e.g. admin or student belonging to an admin)
    if (req.user) {
       if (req.user.role === 'admin') {
         folderName = req.user.id;
       } else if (req.user.role === 'student' && req.user.adminId) {
         folderName = req.user.adminId;
       }
    }

    const uploadPath = path.join(baseUploadDir, folderName);
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Sanitize filename: Date.now()-randomhex-originalname
    const randomHex = crypto.randomBytes(4).toString('hex');
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '');
    cb(null, `${Date.now()}-${randomHex}-${safeName}`);
  }
});

/**
 * File filter for allowed image types
 */
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG, GIF, and WebP are allowed.'), false);
  }
};

// Max file size
const maxFileSize = process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE, 10) : 2 * 1024 * 1024; // Default 2MB

const upload = multer({ 
  storage, 
  fileFilter, 
  limits: { fileSize: maxFileSize } 
});

/**
 * Middleware wrapper for multer to handle errors format consistently
 */
const handleMulterError = (middleware) => (req, res, next) => {
  middleware(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return sendError(res, 400, `Upload error: ${err.message}`);
      }
      return sendError(res, 400, `Upload failed: ${err.message}`);
    }
    next();
  });
};

module.exports = {
  uploadSingle: handleMulterError(upload.single('image')),
  uploadMultiple: handleMulterError(upload.array('images', 5)),
};
