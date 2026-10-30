import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for profile photos
export const profilePhotoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'workkar/profile',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }],
  },
});

// Storage for Aadhaar cards
export const aadhaarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'workkar/aadhaar',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
  },
});

// Storage for PAN cards
export const panStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'workkar/pan',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
  },
});

export default cloudinary;
