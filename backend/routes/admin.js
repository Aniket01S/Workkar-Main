import express from 'express';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import AuditLog from '../models/AuditLog.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all users (Customers, Workers, Admins)
// @route   GET /api/admin/users
router.get('/users', protect, authorize('admin', 'supreme-admin'), async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    const newWorkers = await Worker.find({}).select('-password');
    
    // Map new workers to match the legacy User representation for the admin table
    const mappedNewWorkers = newWorkers.map(w => {
      const wObj = w.toObject();
      const initials = wObj.fullName ? wObj.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'WK';
      return {
        ...wObj,
        name: wObj.fullName,
        skill: wObj.profession,
        status: wObj.verificationStatus === 'APPROVED' ? 'active' : wObj.verificationStatus.toLowerCase(),
        textAvatar: initials,
        rating: wObj.rating || 5.0
      };
    });

    res.json([...users, ...mappedNewWorkers]);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving users', error: error.message });
  }
});

// @desc    Suspend a regular user (Customer or Worker)
// @route   PUT /api/admin/users/:id/suspend
router.put('/users/:id/suspend', protect, authorize('admin', 'supreme-admin'), async (req, res) => {
  try {
    let targetUser = await User.findById(req.params.id);
    let isNewWorker = false;
    if (!targetUser) {
      targetUser = await Worker.findById(req.params.id);
      isNewWorker = true;
    }
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Role protection
    if (!isNewWorker && targetUser.role === 'supreme-admin') {
      return res.status(403).json({ message: 'Cannot modify Supreme Admin accounts' });
    }

    // Admin cannot modify other admins
    if (!isNewWorker && req.user.role === 'admin' && targetUser.role === 'admin') {
      return res.status(403).json({ message: 'Admins cannot suspend other Admins' });
    }

    targetUser.status = 'suspended';
    if (isNewWorker || targetUser.role === 'worker') {
      targetUser.availability = isNewWorker ? false : 'Offline';
    }
    await targetUser.save();

    // Log action
    await AuditLog.create({
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'SUSPEND_USER',
      targetId: targetUser._id,
      targetName: isNewWorker ? targetUser.fullName : targetUser.name,
      details: `Suspended ${targetUser.role} user: ${isNewWorker ? targetUser.fullName : targetUser.name}`
    });

    res.json({ message: `User ${isNewWorker ? targetUser.fullName : targetUser.name} suspended successfully`, user: targetUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error suspending user', error: error.message });
  }
});

// @desc    Restore/Activate a suspended or banned user
// @route   PUT /api/admin/users/:id/restore
router.put('/users/:id/restore', protect, authorize('supreme-admin'), async (req, res) => {
  try {
    let targetUser = await User.findById(req.params.id);
    let isNewWorker = false;
    if (!targetUser) {
      targetUser = await Worker.findById(req.params.id);
      isNewWorker = true;
    }
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    targetUser.status = 'active';
    if (isNewWorker) {
      targetUser.availability = true;
    }
    await targetUser.save();

    // Log action
    await AuditLog.create({
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'RESTORE_USER',
      targetId: targetUser._id,
      targetName: isNewWorker ? targetUser.fullName : targetUser.name,
      details: `Restored/activated user account: ${isNewWorker ? targetUser.fullName : targetUser.name}`
    });

    res.json({ message: `User ${isNewWorker ? targetUser.fullName : targetUser.name} restored successfully`, user: targetUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error restoring user', error: error.message });
  }
});

// @desc    Promote Customer to Admin (Supreme Admin only)
// @route   PUT /api/admin/users/:id/promote
router.put('/users/:id/promote', protect, authorize('supreme-admin'), async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUser.role !== 'customer') {
      return res.status(400).json({ message: 'Only normal Customers can be promoted to Admin' });
    }

    targetUser.role = 'admin';
    await targetUser.save();

    // Log action
    await AuditLog.create({
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'PROMOTE_USER',
      targetId: targetUser._id,
      targetName: targetUser.name,
      details: `Promoted Customer ${targetUser.name} to Admin`
    });

    res.json({ message: `Customer ${targetUser.name} promoted to Admin successfully`, user: targetUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error promoting user', error: error.message });
  }
});

// @desc    Demote Admin to Customer (Supreme Admin only)
// @route   PUT /api/admin/users/:id/demote
router.put('/users/:id/demote', protect, authorize('supreme-admin'), async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUser.role !== 'admin') {
      return res.status(400).json({ message: 'User is not an Admin' });
    }

    targetUser.role = 'customer';
    await targetUser.save();

    // Log action
    await AuditLog.create({
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'DEMOTE_USER',
      targetId: targetUser._id,
      targetName: targetUser.name,
      details: `Demoted Admin ${targetUser.name} to Customer`
    });

    res.json({ message: `Admin ${targetUser.name} demoted to Customer`, user: targetUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error demoting user', error: error.message });
  }
});

// @desc    Temporarily ban a user or admin (Supreme Admin only)
// @route   PUT /api/admin/users/:id/ban
router.put('/users/:id/ban', protect, authorize('supreme-admin'), async (req, res) => {
  try {
    let targetUser = await User.findById(req.params.id);
    let isNewWorker = false;
    if (!targetUser) {
      targetUser = await Worker.findById(req.params.id);
      isNewWorker = true;
    }
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!isNewWorker && targetUser.role === 'supreme-admin') {
      return res.status(403).json({ message: 'Cannot ban Supreme Admin accounts' });
    }

    targetUser.status = 'banned';
    if (isNewWorker || targetUser.role === 'worker') {
      targetUser.availability = isNewWorker ? false : 'Offline';
    }
    await targetUser.save();

    // Log action
    await AuditLog.create({
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'BAN_USER',
      targetId: targetUser._id,
      targetName: isNewWorker ? targetUser.fullName : targetUser.name,
      details: `Banned user: ${isNewWorker ? targetUser.fullName : targetUser.name} (Role: ${targetUser.role})`
    });

    res.json({ message: `User ${isNewWorker ? targetUser.fullName : targetUser.name} banned successfully`, user: targetUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error banning user', error: error.message });
  }
});

// @desc    Remove/Delete user completely (Supreme Admin only)
// @route   DELETE /api/admin/users/:id
router.delete('/users/:id', protect, authorize('supreme-admin'), async (req, res) => {
  try {
    let targetUser = await User.findById(req.params.id);
    let isNewWorker = false;
    if (!targetUser) {
      targetUser = await Worker.findById(req.params.id);
      isNewWorker = true;
    }
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!isNewWorker && targetUser.role === 'supreme-admin') {
      return res.status(403).json({ message: 'Cannot delete Supreme Admin accounts' });
    }

    if (isNewWorker) {
      await Worker.findByIdAndDelete(req.params.id);
    } else {
      await User.findByIdAndDelete(req.params.id);
    }

    // Log action
    await AuditLog.create({
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'REMOVE_USER',
      targetId: targetUser._id,
      targetName: isNewWorker ? targetUser.fullName : targetUser.name,
      details: `Removed user completely: ${isNewWorker ? targetUser.fullName : targetUser.name} (Role: ${targetUser.role})`
    });

    res.json({ message: `User ${isNewWorker ? targetUser.fullName : targetUser.name} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting user', error: error.message });
  }
});

// @desc    Get admin activity logs (Supreme Admin only)
// @route   GET /api/admin/logs
router.get('/logs', protect, authorize('supreme-admin'), async (req, res) => {
  try {
    const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving logs', error: error.message });
  }
});

// @desc    Get analytics and stats
// @route   GET /api/admin/analytics
router.get('/analytics', protect, authorize('admin', 'supreme-admin'), async (req, res) => {
  try {
    const customerCount = await User.countDocuments({ role: 'customer' });
    const legacyWorkerCount = await User.countDocuments({ role: 'worker' });
    const newWorkerCount = await Worker.countDocuments({});
    const workerCount = legacyWorkerCount + newWorkerCount;
    
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    const legacyPending = await User.countDocuments({ role: 'worker', status: 'pending' });
    const newPending = await Worker.countDocuments({ verificationStatus: 'pending' });
    const pendingWorkers = legacyPending + newPending;

    res.json({
      customers: customerCount,
      workers: workerCount,
      admins: adminCount,
      pendingWorkers: pendingWorkers,
      revenue: 24500, // mock revenue matching dashboard
      jobRequests: 1284 // mock job requests matching dashboard
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving analytics', error: error.message });
  }
});

export default router;
