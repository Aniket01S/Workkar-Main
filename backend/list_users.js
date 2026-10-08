import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/workkar';

async function listUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');
    
    // Check User collection
    const users = await mongoose.connection.collection('users').find({}).toArray();
    console.log('\n--- CUSTOMERS & ADMINS (users collection) ---');
    users.forEach(u => {
      console.log(`Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
    });
    
    // Check Worker collection
    const workers = await mongoose.connection.collection('workers').find({}).toArray();
    console.log('\n--- WORKERS (workers collection) ---');
    workers.forEach(w => {
      console.log(`Name: ${w.fullName || w.name}, Email: ${w.email}, Phone: ${w.mobile || 'N/A'}`);
    });
    
  } catch(err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

listUsers();
