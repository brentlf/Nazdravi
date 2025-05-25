import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Parse the service account key from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');

console.log('🔥 Initializing Firebase Admin...');
console.log('📋 Project ID:', process.env.VITE_FIREBASE_PROJECT_ID);
console.log('🔐 Service Account Key exists:', !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
console.log('📄 Service Account parsed:', !!serviceAccount.project_id);

const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
});

const db = getFirestore(app);
console.log('✅ Firebase Admin initialized successfully');
console.log('🗃️ Firestore instance created');

export { db };