import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/workkar';

async function resetPasswords() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');
    
    const newPassword = 'Password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update all users in the 'users' collection
    const userResult = await mongoose.connection.collection('users').updateMany(
      {}, 
      { $set: { password: hashedPassword } }
    );
    console.log(`Updated passwords for ${userResult.modifiedCount} documents in 'users' collection.`);
    
    // Update all users in the 'workers' collection
    const workerResult = await mongoose.connection.collection('workers').updateMany(
      {}, 
      { $set: { password: hashedPassword } }
    );
    console.log(`Updated passwords for ${workerResult.modifiedCount} documents in 'workers' collection.`);
    
    console.log(`\nALL passwords have been successfully reset to: ${newPassword}`);
    
  } catch(err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

resetPasswords();
