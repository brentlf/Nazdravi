import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Parse the service account key from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');

const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
});

export const db = getFirestore(app);