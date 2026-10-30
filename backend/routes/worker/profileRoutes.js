import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { getWorkerProfile, updateWorkerProfile } from '../../controllers/worker/profileController.js';
import { protectWorker } from '../../middleware/workerAuth.js';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Single Cloudinary storage — folder is set dynamically per field
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = 'workkar/misc';
    let transformation = [];

    if (file.fieldname === 'profilePhoto') {
      folder = 'workkar/profile';
      transformation = [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }];
    } else if (file.fieldname === 'aadhaarCard') {
      folder = 'workkar/aadhaar';
    } else if (file.fieldname === 'panCard') {
      folder = 'workkar/pan';
    }

    return {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'webp'],
      transformation,
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadFields = upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'aadhaarCard', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
]);

// Wrapper for multer errors
const handleMulterUpload = (req, res, next) => {
  uploadFields(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        message: 'File upload error',
        errors: {
          profilePhoto: err.message,
          aadhaarCard: err.message,
          panCard: err.message,
        },
      });
    }
    next();
  });
};

router.get('/profile', protectWorker, getWorkerProfile);
router.put('/profile', protectWorker, handleMulterUpload, updateWorkerProfile);

export default router;
