

export const config = {
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  },
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || (process.env.NODE_ENV === 'production' 
      ? 'https://us-central1-veenutrition-79fba.cloudfunctions.net/api'
      : 'http://localhost:5001/veenutrition-79fba/us-central1/api'),
    timeout: process.env.NODE_ENV === 'production' ? 30000 : 10000,
  },
  emails: {
    fromName: import.meta.env.VITE_EMAIL_FROM_NAME || 'Nazdravi',
    fromEmail: import.meta.env.VITE_EMAIL_FROM_EMAIL || 'info@nazdravi.com',
    adminEmail: import.meta.env.VITE_EMAIL_ADMIN || 'admin@nazdravi.com',
  },
  features: {
    enableAnalytics: true,
  },
} as const;
