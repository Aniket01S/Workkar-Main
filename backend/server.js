import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import workerRoutes from './routes/workers.js';
import jobRoutes from './routes/jobs.js';
import adminRoutes from './routes/admin.js';
import workerAuthRoutes from './routes/worker/authRoutes.js';
import workerPermissionRoutes from './routes/worker/permissionRoutes.js';
import workerProfileRoutes from './routes/worker/profileRoutes.js';
import User from './models/User.js';
import path from 'path';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Serve uploads statically
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);

// Worker-specific Routes
app.use('/api/auth/worker', workerAuthRoutes);
app.use('/api/worker', workerPermissionRoutes);
app.use('/api/worker', workerProfileRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Workkar API is running...');
});

// Database Seeding function
const seedDatabase = async () => {
  try {
    // 1. Enforce Supreme Admin Account
    const supremeEmail = 'lakshyakumrawat07@gmail.com';
    const existingSupreme = await User.findOne({ email: supremeEmail });
    if (!existingSupreme) {
      await User.create({
        name: 'Lucky',
        email: supremeEmail,
        password: 'luckyadminpassword', // Auto-hashed by pre-save hook
        role: 'supreme-admin',
        status: 'active'
      });
      console.log(`Seeded Supreme Admin: ${supremeEmail} / luckyadminpassword`);
    } else if (existingSupreme.role !== 'supreme-admin') {
      existingSupreme.role = 'supreme-admin';
      existingSupreme.status = 'active';
      await existingSupreme.save();
      console.log(`Updated existing user ${supremeEmail} to Supreme Admin`);
    } else {
      console.log(`Supreme Admin exists: ${supremeEmail}`);
    }

    // 2. Seed other initial accounts if empty
    const workerCount = await User.countDocuments({ role: 'worker' });
    const adminCount = await User.countDocuments({ role: 'admin' });
    const customerCount = await User.countDocuments({ role: 'customer' });

    if (workerCount === 0 && adminCount === 0 && customerCount === 0) {
      console.log('Database is empty. Seeding initial users...');

      // Seed Admin
      await User.create({
        name: 'Admin Coordinator',
        email: 'admin@workkar.com',
        password: 'adminpassword',
        role: 'admin',
        status: 'active'
      });
      console.log('Seeded Admin: admin@workkar.com / adminpassword');

      // Seed Customer
      await User.create({
        name: 'Alex Mercer',
        email: 'customer@workkar.com',
        password: 'customerpassword',
        role: 'customer',
        status: 'active',
        address: '1428 Elm Street, Springfield',
        phone: '555-0199'
      });
      console.log('Seeded Customer: customer@workkar.com / customerpassword');

      // Seed Workers
      const initialWorkers = [
        {
          name: "Marcus Johnson",
          email: "marcus@workkar.com",
          password: "password123",
          role: "worker",
          status: "active",
          skill: "Carpenter",
          skillTitle: "Master Carpenter",
          experience: 8,
          rating: 4.9,
          rate: 28,
          availability: "Available",
          verificationDocument: "seeded-marcus.pdf",
          avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCR8cl_nJ_jKN5lGqYhv_Kksvll5ZjyQHLZxai281yM2GGn6aqAlZE6O5HSUuY_v-ALq1FNoT_3vy-vpW9hw87tEfAsbSnbXKfnV4iJOe8jxpJZmZqMUDApeD9eQSI7uuyCzhkq6qY0Pahi5GZLgpXnOwVpYQu2IqUCblgtCpG791lqEQqrntIC4f8fQ3PKYecYlQO049Q8lUHt8oVftZxbwFpgex7WX5nvkEUUXo4lhGOanpvspUCVfxk6vBkkoZ6u6_onz6wcG7_i",
          verified: true,
          description: "Marcus is an experienced master carpenter specializing in solid wood furniture, custom shelving, cabinet installation, and repair work.",
          wallet: { balance: 1245.00, weekly: 842.50, jobEarnings: 650.00, incentives: 120.00, tips: 72.50 },
          reviews: [
            { user: "Elena P.", rating: 5, date: "2 days ago", comment: "Marcus did an excellent job building our bookshelf. Fast, neat, and highly professional!" },
            { user: "Robert S.", rating: 4.8, date: "1 week ago", comment: "Very precise woodworking. Arrived on time and worked cleanly." }
          ]
        },
        {
          name: "Sarah Davis",
          email: "sarah@workkar.com",
          password: "password123",
          role: "worker",
          status: "active",
          skill: "Plumber",
          skillTitle: "Licensed Plumber",
          experience: 12,
          rating: 4.8,
          rate: 32,
          availability: "On Job",
          verificationDocument: "seeded-sarah.pdf",
          textAvatar: "SD",
          verified: true,
          description: "Sarah is a certified master plumber with 12 years of hands-on experience in residential drainage, emergency pipe repairs, water heater maintenance.",
          wallet: { balance: 500, weekly: 200, jobEarnings: 150, incentives: 0, tips: 50 },
          reviews: [
            { user: "David K.", rating: 5, date: "3 days ago", comment: "Resolved a complex bathroom leak that others couldn't diagnose." }
          ]
        },
        {
          name: "Elena Rodriguez",
          email: "elena@workkar.com",
          password: "password123",
          role: "worker",
          status: "pending", // Elena can start as pending approval
          skill: "Electrician",
          skillTitle: "Certified Electrician",
          experience: 5,
          rating: 4.7,
          rate: 25,
          availability: "Offline",
          verificationDocument: "seeded-elena.pdf",
          avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAaZxGhoyoXOE3BFe-KVneP0ehPXoJqnYUb0X8tpOETpLqHCX2TSWaGBZpBwYrWx7MQNnP8M_d-yiJejLrIfzAAjkHwGJz38auU8Z5ngqwC7KyFHRNzpkwoumHbWhn7IwGZsCp_u1JKfVg08IE1674eZdj3Gce2Q4NF04FxWnXmDLl6sPz1HFjDdlpSywF3mLAlyxwx4Nzj54bGYkmTQeH6KRpMMs14XT_0b_WF8a2LMVlPgALT6fy-cAe6b8b-ZLMnsx6eBIDYjOhz",
          verified: false,
          description: "Elena has spent 5 years dealing with domestic electrical frameworks. Her services cover circuit breakers, smart lighting layouts, generator setups.",
          reviews: []
        },
        {
          name: "John Doe",
          email: "john@workkar.com",
          password: "password123",
          role: "worker",
          status: "active",
          skill: "Electrician",
          skillTitle: "Master Electrician",
          experience: 5,
          rating: 4.9,
          rate: 25,
          availability: "Available",
          verificationDocument: "seeded-john.pdf",
          avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAyn73H76ZJdgf-yj3fNGxZfN8Yv-MwnQvLCa_Wp1YS1iT6I-vuqHzLgIw2dyq32whs2h6T8P3wzoMOjSPPcf7jYKwIeXjPDf_cvSokBpfXJ-nQGdRVgJmzahT_J3heHCJoxOMGYaXEcEIjxNp_nzXe8e3zc0SVtywWlde9Ijuq0rD8FVXHAYfugHJslXgLdZ5-Wh8rLBG0LNa0bgwIX5M8uuf84AKZEuuMUMmpOPu-L6l1874CjJLCrKFDPApeC-bCOYPAD6KFLT5B",
          verified: true,
          description: "John is a highly requested electrical specialist in residential and commercial wiring, panels upgrades, lighting layouts.",
          reviews: []
        }
      ];

      for (const w of initialWorkers) {
        await User.create(w);
      }
      console.log('Seeded initial workers with password: password123');
    }
  } catch (err) {
    console.error('Seeding database failed:', err);
  }
};

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  seedDatabase();
});
