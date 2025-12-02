import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/synapse';
    await mongoose.connect(mongoURI);
    
    console.log('Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@synapse.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Email:', existingAdmin.email);
      console.log('Username:', existingAdmin.username);
      process.exit(0);
    }

    const admin = await User.create({
      username: adminUsername,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      avatar: 'https://i.pravatar.cc/150?img=68',
    });

    console.log('Admin user created successfully');
    console.log('Email:', admin.email);
    console.log('Username:', admin.username);
    console.log('Password:', adminPassword);
    console.log('Please change the password after first login');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
