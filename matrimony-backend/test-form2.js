const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb+srv://venkatakrishnaaditya2003_db_user:RootsRings123@cluster0.jwh9m5k.mongodb.net/test?appName=Cluster0');
  
  const userId = new mongoose.Types.ObjectId();
  const dbUser = mongoose.connection.collection('users');
  await dbUser.insertOne({ _id: userId, mobile: '+1234567890', paymentStatus: 'confirmed', adminApprovedForForm2: true });

  const token = jwt.sign({ userId: userId.toString(), role: 'user' }, 'roots_rings_secret_key_2026');

  try {
    const res = await fetch('http://localhost:5000/profile/form2/submit', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        height: '5.6',
        familyType: 'nuclear',
        siblings: 'none',
        maritalStatus: 'never-married',
        expectations: 'hello',
        lifestyle: 'test',
        aboutMe: 'test'
      })
    });
    
    const data = await res.json();
    if (res.ok) {
      console.log("Success:", data);
    } else {
      console.error("Error Status:", res.status);
      console.error("Error Data:", data);
      if (data.stack) console.log("Stack:", data.stack);
    }
  } catch (err) {
    console.error("Fetch Error:", err);
  } finally {
    await dbUser.deleteOne({ _id: userId });
    await mongoose.disconnect();
  }
}
run();
