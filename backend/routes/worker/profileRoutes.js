import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getWorkerProfile, updateWorkerProfile } from '../../controllers/worker/profileController.js';
import { protectWorker } from '../../middleware/workerAuth.js';

const router = express.Router();

// Configure multer storage with dynamic destinations
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = 'uploads/';
    if (file.fieldname === 'profilePhoto') {
      dest += 'profile/';
    } else if (file.fieldname === 'aadhaarCard') {
      dest += 'aadhaar/';
    } else if (file.fieldname === 'panCard') {
      dest += 'pan/';
    }
    
    // Ensure directory exists
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // limit files to 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG, PNG images and PDF files are allowed!'));
    }
  }
});

const uploadFields = upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'aadhaarCard', maxCount: 1 },
  { name: 'panCard', maxCount: 1 }
]);

// Wrapper for handling Multer errors
const handleMulterUpload = (req, res, next) => {
  uploadFields(req, res, (err) => {
    if (err) {
      return res.status(400).json({ 
        message: 'File upload error', 
        errors: { 
          profilePhoto: err.message,
          aadhaarCard: err.message,
          panCard: err.message
        } 
      });
    }
    next();
  });
};

router.get('/profile', protectWorker, getWorkerProfile);
router.put('/profile', protectWorker, handleMulterUpload, updateWorkerProfile);

export default router;
