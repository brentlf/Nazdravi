import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// Parse the service account key from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');

console.log('🔥 Initializing Firebase Admin...');
console.log('📋 Project ID:', process.env.VITE_FIREBASE_PROJECT_ID);
console.log('🔐 Service Account Key exists:', !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
console.log('📄 Service Account parsed:', !!serviceAccount.project_id);

const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
});

const db = getFirestore(app);
db.settings({ ignoreUndefinedProperties: true });

const storage = getStorage(app);

console.log('✅ Firebase Admin initialized successfully');
console.log('🗃️ Firestore instance created');
console.log('💾 Firebase Storage initialized');

export { db, storage };