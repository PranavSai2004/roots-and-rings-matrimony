// Clear OTPs and reset rate limiting
const mongoose = require('mongoose');
const OTP = require('./models/OTP');

async function clearOTPs() {
  try {
    const mongoUri = 'mongodb+srv://user:123456@cluster0.mongodb.net/test?retryWrites=true&w=majority';
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Delete all OTPs for this mobile
    const mobile = '9390913183';
    const result = await OTP.deleteMany({ mobile });
    
    console.log(`✅ Deleted ${result.deletedCount} OTPs for mobile: ${mobile}`);
    console.log('✅ Ready to test fresh OTP!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

clearOTPs();
