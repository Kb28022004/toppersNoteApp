const admin = require('firebase-admin');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

let isFirebaseInitialized = false;

try {
  if (admin.apps.length === 0) {
    let serviceAccount;

    // 1. Try environment variable (best for production/docker)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log('ℹ️ Using Firebase credentials from environment variable.');
      } catch (parseError) {
        console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT env var:', parseError.message);
      }
    }

    // 2. Try local file (fallback)
    if (!serviceAccount) {
      const configPath = path.join(__dirname, 'serviceAccountKey.json');
      if (fs.existsSync(configPath)) {
        serviceAccount = require('./serviceAccountKey.json');
        console.log('ℹ️ Using Firebase credentials from local file.');
      } else {
        console.error('❌ serviceAccountKey.json not found and FIREBASE_SERVICE_ACCOUNT env var is missing.');
      }
    }

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      admin.firestore().settings({ ignoreUndefinedProperties: true });
      isFirebaseInitialized = true;
      console.log('✅ Firebase Admin initialized successfully.');
    } else {
      console.warn('⚠️ Firebase initialization skipped due to missing credentials.');
    }
  } else {
    isFirebaseInitialized = true;
    console.log('ℹ️ Firebase Admin already initialized.');
  }
} catch (error) {
  console.error("❌ Firebase Admin Initialization Error:", error.stack || error.message);
  if (admin.apps.length > 0) {
      isFirebaseInitialized = true;
  }
}

module.exports = { admin, isFirebaseInitialized };


