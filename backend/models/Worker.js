import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const ReviewSchema = new mongoose.Schema({
  user: { type: String, required: true },
  rating: { type: Number, required: true },
  date: { type: String, default: 'Just now' },
  comment: { type: String, required: true }
});

const WorkerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'worker'
  },
  age: {
    type: Number
  },
  gender: {
    type: String
  },
  profession: {
    type: String
  },
  experience: {
    type: Number,
    default: 0
  },
  rate: {
    type: Number,
    default: 20
  },
  description: {
    type: String,
    default: ''
  },
  profilePhoto: {
    type: String
  },
  aadhaarCard: {
    type: String
  },
  panCard: {
    type: String
  },
  locationPermission: {
    type: Boolean,
    default: false
  },
  notificationPermission: {
    type: Boolean,
    default: false
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  formattedAddress: {
    type: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['not_started', 'pending', 'approved', 'rejected'],
    default: 'not_started'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: []
    }
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'banned'],
    default: 'pending'
  },
  availability: {
    type: Boolean,
    default: false
  },
  jobsCompleted: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  reviews: [ReviewSchema],
  earnings: {
    type: Number,
    default: 0
  },
  wallet: {
    balance: { type: Number, default: 0 },
    weekly: { type: Number, default: 0 },
    jobEarnings: { type: Number, default: 0 },
    incentives: { type: Number, default: 0 },
    tips: { type: Number, default: 0 }
  },
  activeJob: {
    id: { type: String },
    customerName: { type: String },
    address: { type: String },
    skill: { type: String },
    total: { type: Number },
    base: { type: Number },
    tax: { type: Number },
    step: { type: Number },
    status: { type: String },
    workerId: { type: String },
    customerId: { type: String }
  }
}, {
  timestamps: true
});

// Hash password before saving
WorkerSchema.pre('save', async function(next) {
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
WorkerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Worker = mongoose.model('Worker', WorkerSchema);
export default Worker;
