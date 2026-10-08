import jwt from 'jsonwebtoken';
import Worker from '../../models/Worker.js';
import User from '../../models/User.js';

const generateWorkerToken = (id) => {
  return jwt.sign({ id, role: 'worker' }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

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
    status: workerObj.status || (workerObj.verificationStatus === 'APPROVED' ? 'active' : workerObj.verificationStatus.toLowerCase()),
    availability: workerObj.activeJob ? 'On Job' : (workerObj.availability === true || workerObj.availability === 'Available' ? 'Available' : 'Offline'),
    textAvatar: initials,
    verificationDocument: workerObj.aadhaarCard ? workerObj.aadhaarCard.split('/').pop() : '',
    activeJob: workerObj.activeJob || null,
    // Mock wallet for compatibility with dashboard views if not present
    wallet: workerObj.wallet || {
      balance: workerObj.earnings || 0,
      weekly: workerObj.earnings || 0,
      jobEarnings: workerObj.earnings || 0,
      incentives: 0,
      tips: 0
    }
  };
};

// @desc    Register a new worker
// @route   POST /api/auth/worker/register
// @access  Public
export const registerWorker = async (req, res) => {
  const { email, mobile, password, confirmPassword } = req.body;

  try {
    const errors = {};

    if (!email) {
      errors.email = 'Email is required';
    }
    if (!mobile) {
      errors.mobile = 'Mobile number is required';
    }
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    // Check unique email
    const emailExists = await Worker.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: { email: 'Email is already registered' } 
      });
    }

    // Check unique mobile
    const mobileExists = await Worker.findOne({ mobile });
    if (mobileExists) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: { mobile: 'Mobile number is already registered' } 
      });
    }

    const worker = await Worker.create({
      email,
      mobile,
      password, // auto-hashed by Mongoose pre-save hook
      role: 'worker',
      verificationStatus: 'not_started',
      profileCompleted: false,
      isVerified: false,
      availability: false
    });

    if (worker) {
      res.status(201).json({
        ...mapWorkerToUser(worker),
        token: generateWorkerToken(worker._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid worker data' });
    }
  } catch (error) {
    console.error('Worker registration error:', error);
    res.status(500).json({ message: 'Server error during worker registration', error: error.message });
  }
};

// @desc    Authenticate worker & get token
// @route   POST /api/auth/worker/login
// @access  Public
export const loginWorker = async (req, res) => {
  const { emailOrMobile, password } = req.body;

  try {
    if (!emailOrMobile || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Find worker by email OR mobile number
    let worker = await Worker.findOne({
      $or: [
        { email: emailOrMobile.toLowerCase() },
        { mobile: emailOrMobile }
      ]
    });
    let isNew = false;

    if (!worker) {
      // Find worker in legacy User collection
      worker = await User.findOne({ email: emailOrMobile.toLowerCase(), role: 'worker' });
    } else {
      isNew = true;
    }

    if (!worker || !(await worker.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      ...(isNew ? mapWorkerToUser(worker) : worker.toObject()),
      token: generateWorkerToken(worker._id)
    });
  } catch (error) {
    console.error('Worker login error:', error);
    res.status(500).json({ message: 'Server error during worker login', error: error.message });
  }
};

// @desc    Get current worker info
// @route   GET /api/auth/worker/me
// @access  Private (Worker)
export const getWorkerMe = async (req, res) => {
  try {
    let worker = await Worker.findById(req.user._id).select('-password');
    if (worker) {
      res.json(mapWorkerToUser(worker));
    } else {
      worker = await User.findById(req.user._id).select('-password');
      if (worker && worker.role === 'worker') {
        res.json(worker);
      } else {
        res.status(404).json({ message: 'Worker not found' });
      }
    }
  } catch (error) {
    console.error('Worker fetch me error:', error);
    res.status(500).json({ message: 'Server error retrieving worker profile' });
  }
};
