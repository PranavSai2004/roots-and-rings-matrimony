const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

dotenv.config();

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const adminCount = await Admin.countDocuments();
    console.log('Admin count:', adminCount);
    
    if (adminCount === 0) {
      console.log('No admin found. Creating seed admin...');
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await Admin.create({
        email: 'admin@matrimonial.com',
        password: hashedPassword,
        fullName: 'System Administrator',
        isActive: true
      });
      console.log('Seed admin created: admin@matrimonial.com / admin123');
    } else {
      const admins = await Admin.find().select('-password');
      console.log('Existing admins:', admins);
    }
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

checkAdmin();
