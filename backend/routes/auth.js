import express from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user (worker, customer)
// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, role, skill, rate, experience, description, address, phone, verificationDocument } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Direct registration of admin or supreme-admin is strictly forbidden
    if (role === 'admin' || role === 'supreme-admin') {
      return res.status(400).json({ message: 'Direct registration for administrative roles is not allowed' });
    }

    const userData = {
      name,
      email,
      password,
      role: role || 'customer',
    };

    if (role === 'worker') {
      if (!verificationDocument) {
        return res.status(400).json({ message: 'Workers must upload verification documents' });
      }
      userData.skill = skill;
      userData.skillTitle = `Professional ${skill}`;
      userData.rate = Number(rate) || 20;
      userData.experience = Number(experience) || 0;
      userData.description = description || `Registered wage professional offering premium ${skill} services.`;
      userData.verificationDocument = verificationDocument;
      userData.verified = false; 
      userData.status = 'pending'; // Workers start as pending approval
      userData.availability = 'Offline';
      // Initials for text avatar
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
      userData.textAvatar = initials;
      // Initialize wallet
      userData.wallet = {
        balance: 0,
        weekly: 0,
        jobEarnings: 0,
        incentives: 0,
        tips: 0
      };
    } else {
      userData.address = address || '';
      userData.phone = phone || '';
      userData.status = 'active'; // Customers start as active
    }

    const user = await User.create(userData);

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if banned or suspended
    if (user.status === 'banned' || user.status === 'suspended') {
      return res.status(403).json({ message: `Access Denied: Your account has been ${user.status}` });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving profile' });
  }
});

// @desc    Auth user with Google & get token
// @route   POST /api/auth/google
router.post('/google', async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ message: 'Google credential is required' });
  }

  try {
    let email, name;

    // Check if mock token is used
    if (credential.startsWith('mock-google-token')) {
      const parts = credential.split('|');
      email = parts[1] || 'mockgoogle@workkar.com';
      name = parts[2] || 'Mock Google User';
    } else {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
    }

    if (!email) {
      return res.status(400).json({ message: 'Invalid Google token payload' });
    }

    // Find if user exists
    let user = await User.findOne({ email });

    if (user) {
      // Check status
      if (user.status === 'banned' || user.status === 'suspended') {
        return res.status(403).json({ message: `Access Denied: Your account has been ${user.status}` });
      }
    } else {
      // Create new customer account
      const randomPassword = Math.random().toString(36).substring(2) + Date.now().toString(36);
      user = await User.create({
        name,
        email,
        password: randomPassword,
        role: 'customer',
        status: 'active',
        address: '',
        phone: '',
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ message: 'Server error during Google auth', error: error.message });
  }
});

// @desc    Mark all notifications as read for current user
// @route   PUT /api/auth/notifications/read
router.put('/notifications/read', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.notifications.forEach(n => n.read = true);
    await user.save();
    res.json(user.notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error marking notifications read', error: error.message });
  }
});

// @desc    Mark a single notification as read
// @route   PUT /api/auth/notifications/read/:id
router.put('/notifications/read/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const notif = user.notifications.find(n => n.id === req.params.id);
    if (notif) {
      notif.read = true;
      user.markModified('notifications');
      await user.save();
    }
    res.json(user.notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error marking notification read', error: error.message });
  }
});

// @desc    Clear notifications (delete all)
// @route   DELETE /api/auth/notifications
router.delete('/notifications', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.notifications = [];
    await user.save();
    res.json(user.notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error clearing notifications', error: error.message });
  }
});

export default router;
