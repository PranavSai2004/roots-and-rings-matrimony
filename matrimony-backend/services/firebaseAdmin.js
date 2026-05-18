const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
// Service account key file will be provided by user from Firebase Console
let firebaseInitialized = false;

const initializeFirebase = () => {
  if (firebaseInitialized) return;

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
    path.join(__dirname, '../serviceAccountKey.json');

  try {
    // Check if service account file exists
    require('fs').accessSync(serviceAccountPath);
    
    admin.initializeApp({
      credential: admin.credential.cert(require(serviceAccountPath)),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    
    firebaseInitialized = true;
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.warn('⚠️ Firebase Admin not initialized');
    console.warn('📝 Setup: Download serviceAccountKey.json from Firebase Console');
    console.warn('   1. Go to Firebase Console > Project Settings > Service Accounts');
    console.warn('   2. Click "Generate New Private Key"');
    console.warn('   3. Save JSON file to matrimony-backend/serviceAccountKey.json');
    console.warn('   4. Add to .gitignore (keep secret!)');
  }
};

// Verify Firebase ID token
const verifyFirebaseToken = async (idToken) => {
  try {
    if (!firebaseInitialized) {
      initializeFirebase();
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return { 
      valid: true, 
      uid: decodedToken.uid, 
      phoneNumber: decodedToken.phone_number,
      claims: decodedToken 
    };
  } catch (error) {
    console.error('❌ Firebase token verification error:', error.message);
    return { 
      valid: false, 
      error: error.message 
    };
  }
};

module.exports = { admin, verifyFirebaseToken, initializeFirebase };
