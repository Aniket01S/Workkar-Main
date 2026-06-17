import express from 'express';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Helper to find worker in legacy User or new Worker collection
const findWorkerById = async (id) => {
  let worker = await User.findById(id);
  let isNew = false;
  if (!worker) {
    worker = await Worker.findById(id);
    if (worker) isNew = true;
  }
  return { worker, isNew };
};

// Helper to update booking status and add notification on customer User document
const updateCustomerBooking = async (customerId, jobId, status, notificationText, notifType = 'info') => {
  try {
    const customer = await User.findById(customerId);
    if (customer) {
      const booking = customer.bookings.find(b => b.id === jobId);
      if (booking) {
        booking.status = status;
        customer.markModified('bookings');
      }
      
      customer.notifications.push({
        id: `${jobId}-${status.toLowerCase()}-${Date.now()}`,
        title: `Booking Update: ${status}`,
        message: notificationText,
        type: notifType,
        date: new Date()
      });
      await customer.save();
    }
  } catch (err) {
    console.error('Error updating customer booking/notification:', err);
  }
};


// @desc    Book a worker (Client)
// @route   POST /api/jobs/book
router.post('/book', protect, async (req, res) => {
  const { workerId, customerName, address, skill, base, tax, total } = req.body;

  try {
    const { worker, isNew } = await findWorkerById(workerId);
    if (!worker || (worker.role !== 'worker' && !isNew)) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    const isAvailable = isNew ? worker.availability === true : worker.availability === 'Available';
    if (!isAvailable) {
      return res.status(400).json({ message: 'Worker is currently unavailable or on another job' });
    }

    // Set worker's active job as an Alert/Offer
    const jobOffer = {
      id: `#${Math.floor(100 + Math.random() * 900)}-WK`,
      customerName: customerName || req.user.name,
      address: address || 'Client Location',
      skill: skill || (isNew ? worker.profession : worker.skill) || 'Service Provider',
      total: total || ((isNew ? 25 : worker.rate) * 3 + 10),
      base: base || ((isNew ? 25 : worker.rate) * 3),
      tax: tax || 10,
      step: 1, // Alert / Pending Accept
      status: 'Alert',
      workerId: worker._id.toString(),
      customerId: req.user._id.toString()
    };

    worker.activeJob = jobOffer;
    worker.availability = isNew ? false : 'On Job';
    await worker.save();

    // Update customer bookings and notifications
    if (req.user) {
      req.user.bookings.push({
        id: jobOffer.id,
        workerId: worker._id.toString(),
        workerName: isNew ? worker.fullName : worker.name,
        skill: jobOffer.skill,
        total: jobOffer.total,
        status: 'Pending',
        date: new Date()
      });

      req.user.notifications.push({
        id: `book-${Date.now()}`,
        title: 'Booking Request Sent',
        message: `Your request #${jobOffer.id} has been sent to ${isNew ? worker.fullName : worker.name}.`,
        type: 'info',
        date: new Date()
      });

      await req.user.save();
    }

    res.status(200).json({ message: 'Booking request sent to worker', activeJob: jobOffer });
  } catch (error) {
    res.status(500).json({ message: 'Server error booking worker', error: error.message });
  }
});

// @desc    Get active job for worker
// @route   GET /api/jobs/active
router.get('/active', protect, authorize('worker'), async (req, res) => {
  try {
    const { worker, isNew } = await findWorkerById(req.user._id);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });

    res.json(worker.activeJob || null);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving active job', error: error.message });
  }
});

// @desc    Accept job offer (Worker)
// @route   PUT /api/jobs/accept
router.put('/accept', protect, authorize('worker'), async (req, res) => {
  try {
    const { worker, isNew } = await findWorkerById(req.user._id);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    if (!worker.activeJob || worker.activeJob.status !== 'Alert') {
      return res.status(400).json({ message: 'No active job offer to accept' });
    }

    const customerId = worker.activeJob.customerId;
    const jobId = worker.activeJob.id;
    const workerName = isNew ? worker.fullName : worker.name;

    worker.activeJob.step = 2;
    worker.activeJob.status = 'En Route';
    // Mark modified for nested subdocuments
    worker.markModified('activeJob');
    await worker.save();

    if (customerId) {
      await updateCustomerBooking(customerId, jobId, 'Accepted', `Worker ${workerName} has accepted your booking #${jobId} and is en route.`, 'success');
    }

    res.json({ message: 'Job accepted. En route to client.', activeJob: worker.activeJob });
  } catch (error) {
    res.status(500).json({ message: 'Server error accepting job', error: error.message });
  }
});

// @desc    Decline job offer (Worker)
// @route   PUT /api/jobs/decline
router.put('/decline', protect, authorize('worker'), async (req, res) => {
  try {
    const { worker, isNew } = await findWorkerById(req.user._id);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    if (!worker.activeJob || worker.activeJob.status !== 'Alert') {
      return res.status(400).json({ message: 'No active job offer to decline' });
    }

    const customerId = worker.activeJob.customerId;
    const jobId = worker.activeJob.id;
    const workerName = isNew ? worker.fullName : worker.name;

    worker.activeJob = undefined;
    worker.availability = isNew ? true : 'Available';
    await worker.save();

    if (customerId) {
      await updateCustomerBooking(customerId, jobId, 'Declined', `Worker ${workerName} has declined your booking request #${jobId}.`, 'warning');
    }

    res.json({ message: 'Job offer declined.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error declining job', error: error.message });
  }
});

// @desc    Start service (Worker)
// @route   PUT /api/jobs/start
router.put('/start', protect, authorize('worker'), async (req, res) => {
  try {
    const { worker, isNew } = await findWorkerById(req.user._id);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    if (!worker.activeJob || worker.activeJob.step !== 2) {
      return res.status(400).json({ message: 'Cannot start service in current state' });
    }

    const customerId = worker.activeJob.customerId;
    const jobId = worker.activeJob.id;
    const workerName = isNew ? worker.fullName : worker.name;

    worker.activeJob.step = 3;
    worker.activeJob.status = 'In Progress';
    worker.markModified('activeJob');
    await worker.save();

    if (customerId) {
      await updateCustomerBooking(customerId, jobId, 'In Progress', `Worker ${workerName} has started service on your booking #${jobId}.`, 'info');
    }

    res.json({ message: 'Service started.', activeJob: worker.activeJob });
  } catch (error) {
    res.status(500).json({ message: 'Server error starting service', error: error.message });
  }
});

// @desc    Complete job (Worker)
// @route   PUT /api/jobs/complete
router.put('/complete', protect, authorize('worker'), async (req, res) => {
  try {
    const { worker, isNew } = await findWorkerById(req.user._id);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    if (!worker.activeJob || worker.activeJob.step !== 3) {
      return res.status(400).json({ message: 'Cannot complete service in current state' });
    }

    const customerId = worker.activeJob.customerId;
    const jobId = worker.activeJob.id;
    const workerName = isNew ? worker.fullName : worker.name;

    const earnAmount = worker.activeJob.total;
    const baseEarn = worker.activeJob.base;
    const tipEarn = earnAmount - baseEarn;

    // Credit earnings
    worker.wallet.balance += earnAmount;
    worker.wallet.weekly += earnAmount;
    worker.wallet.jobEarnings += baseEarn;
    worker.wallet.tips += tipEarn;

    // Reset status and clear active job
    worker.activeJob = undefined;
    worker.availability = isNew ? true : 'Available';
    await worker.save();

    if (customerId) {
      await updateCustomerBooking(customerId, jobId, 'Completed', `Worker ${workerName} has completed service on your booking #${jobId}! You can now leave a review.`, 'success');
    }

    res.json({ message: `Job completed! Credited $${earnAmount.toFixed(2)} to your wallet.`, wallet: worker.wallet });
  } catch (error) {
    res.status(500).json({ message: 'Server error completing job', error: error.message });
  }
});

// @desc    Withdraw funds (Worker)
// @route   POST /api/jobs/withdraw
router.post('/withdraw', protect, authorize('worker'), async (req, res) => {
  const { amount } = req.body;
  try {
    const { worker, isNew } = await findWorkerById(req.user._id);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });

    if (amount > worker.wallet.balance) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    worker.wallet.balance -= amount;
    await worker.save();

    res.json({ message: `Withdrawal of $${amount} successful`, wallet: worker.wallet });
  } catch (error) {
    res.status(500).json({ message: 'Server error processing withdrawal', error: error.message });
  }
});

// @desc    Get all active assignments (Admin)
// @route   GET /api/jobs/assignments
router.get('/assignments', protect, authorize('admin'), async (req, res) => {
  try {
    // Find all workers that have an activeJob defined
    const activeLegacyWorkers = await User.find({ role: 'worker', 'activeJob.id': { $exists: true } });
    const activeNewWorkers = await Worker.find({ 'activeJob.id': { $exists: true } });

    const legacyAssignments = activeLegacyWorkers.map(w => ({
      id: w.activeJob.id,
      title: w.activeJob.skill,
      worker: w.name,
      type: w.skill,
      status: w.activeJob.status === 'Alert' ? 'Pending' : 'Active',
      icon: w.skill === 'Plumber' ? 'build' : 'electrical_services'
    }));

    const newAssignments = activeNewWorkers.map(w => ({
      id: w.activeJob.id,
      title: w.activeJob.skill,
      worker: w.fullName,
      type: w.profession,
      status: w.activeJob.status === 'Alert' ? 'Pending' : 'Active',
      icon: w.profession === 'Plumber' ? 'build' : 'electrical_services'
    }));

    res.json([...legacyAssignments, ...newAssignments]);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving assignments', error: error.message });
  }
});

// @desc    Cancel a booking (Customer)
// @route   PUT /api/jobs/cancel/:jobId
router.put('/cancel/:jobId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const booking = user.bookings.find(b => b.id === req.params.jobId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'Pending' && booking.status !== 'Accepted') {
      return res.status(400).json({ message: 'Cannot cancel booking in current status' });
    }

    // Update booking status
    booking.status = 'Cancelled';
    user.markModified('bookings');

    // Find worker to release them
    const { worker, isNew } = await findWorkerById(booking.workerId);
    if (worker && worker.activeJob && worker.activeJob.id === req.params.jobId) {
      worker.activeJob = undefined;
      worker.availability = isNew ? true : 'Available';
      await worker.save();
    }

    // Push notification to customer
    user.notifications.push({
      id: `cancel-${req.params.jobId}-${Date.now()}`,
      title: 'Booking Cancelled',
      message: `You have cancelled your booking request #${req.params.jobId}.`,
      type: 'warning',
      date: new Date()
    });

    await user.save();

    res.json({ message: 'Booking cancelled successfully', bookings: user.bookings });
  } catch (error) {
    res.status(500).json({ message: 'Server error cancelling booking', error: error.message });
  }
});

// @desc    Submit worker review (Customer)
// @route   POST /api/jobs/review/:workerId
router.post('/review/:workerId', protect, async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    return res.status(400).json({ message: 'Rating and comment are required' });
  }

  const numRating = Number(rating);
  if (numRating < 1 || numRating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  try {
    const { worker, isNew } = await findWorkerById(req.params.workerId);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // Add review
    const newReview = {
      user: req.user.name || 'Anonymous Client',
      rating: numRating,
      comment,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    };

    worker.reviews.push(newReview);

    // Recalculate rating
    const totalReviews = worker.reviews.length;
    const ratingSum = worker.reviews.reduce((sum, r) => sum + r.rating, 0);
    worker.rating = Math.round((ratingSum / totalReviews) * 10) / 10;

    await worker.save();

    res.json({ message: 'Review submitted successfully', reviews: worker.reviews, rating: worker.rating });
  } catch (error) {
    res.status(500).json({ message: 'Server error submitting review', error: error.message });
  }
});

export default router;
