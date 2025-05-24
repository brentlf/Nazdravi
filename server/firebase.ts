import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Parse the service account key from environment variable
try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
  
  console.log('Initializing Firebase Admin with project:', process.env.VITE_FIREBASE_PROJECT_ID);
  
  const app = initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  });

  export const db = getFirestore(app);
  console.log('✓ Firebase Admin initialized successfully');
} catch (error) {
  console.error('✗ Firebase Admin initialization failed:', error);
  throw error;
}