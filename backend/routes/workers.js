import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import AuditLog from '../models/AuditLog.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all workers
// @route   GET /api/workers
router.get('/', async (req, res) => {
  try {
    const legacyWorkers = await User.find({ role: 'worker' }).select('-password');
    const newWorkers = await Worker.find({}).select('-password');

    // Map new workers to legacy format for UI compatibility
    const mappedNewWorkers = newWorkers.map(w => {
      const wObj = w.toObject();
      const initials = wObj.fullName ? wObj.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'WK';
      const isApproved = wObj.verificationStatus === 'approved';
      return {
        ...wObj,
        name: wObj.fullName,
        skill: wObj.profession,
        status: isApproved ? 'active' : wObj.verificationStatus,
        verified: isApproved,
        availability: wObj.availability ? 'Available' : 'Offline',
        textAvatar: initials,
        rating: wObj.rating || 5.0
      };
    });

    res.json([...legacyWorkers, ...mappedNewWorkers]);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving workers', error: error.message });
  }
});

// @desc    Toggle availability (Supports both legacy and new workers)
// @route   PUT /api/workers/availability
router.put('/availability', async (req, res) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === 'worker') {
      // New worker flow
      const worker = await Worker.findById(decoded.id);
      if (!worker) return res.status(404).json({ message: 'Worker not found' });
      if (worker.verificationStatus !== 'approved') {
        return res.status(403).json({ message: 'Account is pending approval or suspended' });
      }
      worker.availability = !worker.availability;
      await worker.save();
      return res.json({ 
        availability: worker.availability ? 'Available' : 'Offline', 
        name: worker.fullName 
      });
    } else {
      // Legacy worker flow
      const user = await User.findById(decoded.id);
      if (!user || user.role !== 'worker') {
        return res.status(403).json({ message: 'Not authorized as worker' });
      }
      if (user.status !== 'active') {
        return res.status(403).json({ message: 'Account is pending approval or suspended' });
      }
      user.availability = user.availability === 'Available' ? 'Offline' : 'Available';
      await user.save();
      return res.json({ 
        availability: user.availability, 
        name: user.name 
      });
    }
  } catch (error) {
    console.error('Toggle availability error:', error);
    return res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
  }
});

// @desc    Approve a pending worker (Supports legacy and new workers)
// @route   PUT /api/workers/:id/approve
router.put('/:id/approve', protect, authorize('admin', 'supreme-admin'), async (req, res) => {
  try {
    let worker = await User.findById(req.params.id);
    let isNew = false;

    if (!worker) {
      worker = await Worker.findById(req.params.id);
      isNew = true;
    }

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    if (isNew) {
      worker.isVerified = true;
      worker.verificationStatus = 'approved';
      worker.status = 'active';
      worker.availability = true;
      worker.rating = 4.8;
      await worker.save();
    } else {
      worker.verified = true;
      worker.status = 'active';
      worker.availability = 'Available';
      worker.rating = 4.8;
      await worker.save();
    }

    // Log the action
    await AuditLog.create({
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'APPROVE_WORKER',
      targetId: worker._id,
      targetName: isNew ? worker.fullName : worker.name,
      details: `Approved worker registration for ${isNew ? worker.fullName : worker.name} (${isNew ? worker.profession : worker.skill})`
    });

    res.json({ message: `Worker ${isNew ? worker.fullName : worker.name} approved successfully`, worker });
  } catch (error) {
    res.status(500).json({ message: 'Server error approving worker', error: error.message });
  }
});

// @desc    Suspend a worker (Supports legacy and new workers)
// @route   PUT /api/workers/:id/suspend
router.put('/:id/suspend', protect, authorize('admin', 'supreme-admin'), async (req, res) => {
  try {
    let worker = await User.findById(req.params.id);
    let isNew = false;

    if (!worker) {
      worker = await Worker.findById(req.params.id);
      isNew = true;
    }

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    if (isNew) {
      worker.status = 'suspended';
      worker.availability = false;
      await worker.save();
    } else {
      worker.status = 'suspended';
      worker.availability = 'Offline';
      await worker.save();
    }

    // Log the action
    await AuditLog.create({
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'SUSPEND_WORKER',
      targetId: worker._id,
      targetName: isNew ? worker.fullName : worker.name,
      details: `Suspended worker ${isNew ? worker.fullName : worker.name}`
    });

    res.json({ message: `Worker ${isNew ? worker.fullName : worker.name} suspended successfully`, worker });
  } catch (error) {
    res.status(500).json({ message: 'Server error suspending worker', error: error.message });
  }
});

// @desc    Reject/Delete a worker (Supports legacy and new workers)
// @route   DELETE /api/workers/:id
router.delete('/:id', protect, authorize('admin', 'supreme-admin'), async (req, res) => {
  try {
    let worker = await User.findById(req.params.id);
    let isNew = false;

    if (!worker) {
      worker = await Worker.findById(req.params.id);
      isNew = true;
    }

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    if (isNew) {
      await Worker.findByIdAndDelete(req.params.id);
    } else {
      await User.findByIdAndDelete(req.params.id);
    }

    // Log the action
    await AuditLog.create({
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'REJECT_WORKER',
      targetId: worker._id,
      targetName: isNew ? worker.fullName : worker.name,
      details: `Rejected and deleted worker registration for ${isNew ? worker.fullName : worker.name}`
    });

    res.json({ message: `Worker ${isNew ? worker.fullName : worker.name} rejected and removed` });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting worker', error: error.message });
  }
});

export default router;
