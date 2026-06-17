import Worker from '../../models/Worker.js';
import User from '../../models/User.js';

// Helper to map Worker fields to legacy User fields for frontend dashboard compatibility
const mapWorkerToUser = (worker) => {
  if (!worker) return null;
  const workerObj = worker.toObject ? worker.toObject() : worker;
  const initials = workerObj.fullName
    ? workerObj.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
    : 'WK';
    
  return {
    ...workerObj,
    name: workerObj.fullName || '',
    skill: workerObj.profession || '',
    status: workerObj.verificationStatus === 'APPROVED' ? 'active' : workerObj.verificationStatus.toLowerCase(),
    availability: workerObj.activeJob ? 'On Job' : (workerObj.availability === true || workerObj.availability === 'Available' ? 'Available' : 'Offline'),
    textAvatar: initials,
    verificationDocument: workerObj.aadhaarCard ? workerObj.aadhaarCard.split('/').pop() : '',
    wallet: workerObj.wallet || {
      balance: workerObj.earnings || 0,
      weekly: workerObj.earnings || 0,
      jobEarnings: workerObj.earnings || 0,
      incentives: 0,
      tips: 0
    }
  };
};

// @desc    Get logged-in worker profile
// @route   GET /api/worker/profile
// @access  Private (Worker)
export const getWorkerProfile = async (req, res) => {
  try {
    let worker = await Worker.findById(req.user._id).select('-password');
    if (!worker) {
      worker = await User.findById(req.user._id).select('-password');
      if (worker && worker.role === 'worker') {
        return res.json(worker);
      }
      return res.status(404).json({ message: 'Worker not found' });
    }
    res.json(mapWorkerToUser(worker));
  } catch (error) {
    console.error('Get worker profile error:', error);
    res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

// @desc    Complete worker profile onboarding (Personal Info, Profession, Documents)
// @route   PUT /api/worker/profile
// @access  Private (Worker)
export const updateWorkerProfile = async (req, res) => {
  try {
    const worker = await Worker.findById(req.user._id);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    const { fullName, age, gender, profession, latitude, longitude, formattedAddress } = req.body;
    const errors = {};

    // Validate inputs
    if (!fullName || !fullName.trim()) {
      errors.fullName = 'Full Name is required';
    }

    if (!age) {
      errors.age = 'Age is required';
    } else {
      const parsedAge = parseInt(age, 10);
      if (isNaN(parsedAge) || parsedAge < 18) {
        errors.age = 'Age must be 18 or above';
      }
    }

    if (!profession || !profession.trim()) {
      errors.profession = 'Profession is required';
    }

    if (latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
      errors.location = 'Location access is required';
    }

    // Check files uploaded or already existing in database
    const profilePhotoFile = req.files?.profilePhoto?.[0];
    const aadhaarCardFile = req.files?.aadhaarCard?.[0];
    const panCardFile = req.files?.panCard?.[0];

    const profilePhotoPath = profilePhotoFile ? `/uploads/profile/${profilePhotoFile.filename}` : worker.profilePhoto;
    const aadhaarCardPath = aadhaarCardFile ? `/uploads/aadhaar/${aadhaarCardFile.filename}` : worker.aadhaarCard;
    const panCardPath = panCardFile ? `/uploads/pan/${panCardFile.filename}` : worker.panCard;

    if (!profilePhotoPath) {
      errors.profilePhoto = 'Profile photo is required';
    }

    if (!aadhaarCardPath) {
      errors.aadhaarCard = 'Aadhaar card upload is required';
    }

    if (!panCardPath) {
      errors.panCard = 'PAN card upload is required';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    // Update worker details
    worker.fullName = fullName.trim();
    worker.age = parseInt(age, 10);
    worker.gender = gender;
    worker.profession = profession;
    worker.profilePhoto = profilePhotoPath;
    worker.aadhaarCard = aadhaarCardPath;
    worker.panCard = panCardPath;

    worker.latitude = Number(latitude);
    worker.longitude = Number(longitude);
    worker.location = {
      type: 'Point',
      coordinates: [Number(longitude), Number(latitude)]
    };

    // Reverse geocoding on backend using environment variable GOOGLE_MAPS_API_KEY
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (apiKey) {
      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          worker.formattedAddress = data.results[0].formatted_address;
        } else {
          worker.formattedAddress = `Location at (${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)})`;
        }
      } catch (error) {
        console.error('Google Maps geocoding in profile setup failed:', error);
        worker.formattedAddress = `Location at (${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)})`;
      }
    } else {
      worker.formattedAddress = formattedAddress || `Location at (${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)})`;
    }
    
    // On profile update completion, set verification status to pending and profileCompleted to true
    worker.verificationStatus = 'pending';
    worker.profileCompleted = true;
    worker.isVerified = false;

    const updatedWorker = await worker.save();

    res.json({
      message: 'Your profile has been submitted successfully and is waiting for admin verification.',
      worker: mapWorkerToUser(updatedWorker)
    });
  } catch (error) {
    console.error('Update worker profile error:', error);
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
};
