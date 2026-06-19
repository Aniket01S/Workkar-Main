import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const ReviewSchema = new mongoose.Schema({
  user: { type: String, required: true },
  rating: { type: Number, required: true },
  date: { type: String, default: 'Just now' },
  comment: { type: String, required: true }
});

const BookingSchema = new mongoose.Schema({
  id: { type: String, required: true },
  workerId: { type: String, required: true },
  workerName: { type: String, required: true },
  skill: { type: String, required: true },
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'En Route', 'In Progress', 'Completed', 'Declined', 'Cancelled', 'Pending Approval'],
    default: 'Pending'
  },
  date: { type: Date, default: Date.now }
}, { id: false });

const NotificationSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
  read: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['customer', 'worker', 'admin', 'supreme-admin'], 
    default: 'customer' 
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'banned', 'pending'],
    default: 'active'
  },
  
  // Worker-specific fields
  skill: { type: String },
  skillTitle: { type: String },
  experience: { type: Number, default: 0 },
  rating: { type: Number, default: null },
  rate: { type: Number, default: 0 },
  availability: { type: String, enum: ['Available', 'On Job', 'Offline'], default: 'Offline' },
  avatar: { type: String },
  textAvatar: { type: String },
  verified: { type: Boolean, default: false },
  reviews: [ReviewSchema],
  description: { type: String },
  verificationDocument: { type: String }, // path/URL/name of uploaded document
  
  // Wallet state (for worker)
  wallet: {
    balance: { type: Number, default: 0 },
    weekly: { type: Number, default: 0 },
    jobEarnings: { type: Number, default: 0 },
    incentives: { type: Number, default: 0 },
    tips: { type: Number, default: 0 }
  },

  // Active Job (for worker)
  activeJob: {
    id: { type: String },
    customerName: { type: String },
    address: { type: String },
    skill: { type: String },
    total: { type: Number },
    base: { type: Number },
    tax: { type: Number },
    step: { type: Number }, // 1: Accepted, 2: En Route, 3: In Progress, 4: Completed
    status: { type: String },
    workerId: { type: String },
    customerId: { type: String }
  },
  
  // Customer-specific fields
  address: { type: String },
  phone: { type: String },
  bookings: [BookingSchema],
  notifications: [NotificationSchema],
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);
export default User;
