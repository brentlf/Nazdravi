import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";
import { config } from "./config";

// Validate Firebase configuration
if (!config.firebase.apiKey || !config.firebase.projectId || !config.firebase.appId) {
  throw new Error('Firebase configuration is incomplete. Please check your environment variables.');
}


// Initialize Firebase
const app = initializeApp(config.firebase);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only if supported and enabled)
export const analytics = config.features.enableAnalytics 
  ? isSupported().then(yes => yes ? getAnalytics(app) : null)
  : Promise.resolve(null);

// Auth providers
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
