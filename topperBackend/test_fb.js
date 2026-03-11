const { admin, isFirebaseInitialized } = require('./src/config/firebase');
console.log('isFirebaseInitialized:', isFirebaseInitialized);
if (isFirebaseInitialized) {
    try {
        const db = admin.firestore();
        console.log('Firestore accessed successfully');
    } catch (err) {
        console.error('Firestore access error:', err.message);
    }
} else {
    console.log('Firebase was not initialized');
}
