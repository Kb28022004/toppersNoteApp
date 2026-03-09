const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

let isFirebaseInitialized = false;

try {
  // Use local JSON file for credentials
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  admin.firestore().settings({ ignoreUndefinedProperties: true });
  isFirebaseInitialized = true;
  console.log('✅ Firebase Admin initialized successfully.');
} catch (error) {
  console.error("❌ Firebase Admin Initialization Error:", error.message);
}

module.exports = { admin, isFirebaseInitialized };
