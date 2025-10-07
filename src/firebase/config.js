// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { ENV_CONFIG } from '../config/environment.js';

// Your web app's Firebase configuration
// Using environment variables for better security
// NOTE: Storage is disabled as it's not available in the free plan
const firebaseConfig = {
  apiKey: ENV_CONFIG.FIREBASE.API_KEY,
  authDomain: ENV_CONFIG.FIREBASE.AUTH_DOMAIN,
  projectId: ENV_CONFIG.FIREBASE.PROJECT_ID,
  messagingSenderId: ENV_CONFIG.FIREBASE.MESSAGING_SENDER_ID,
  appId: ENV_CONFIG.FIREBASE.APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services (only Database and Auth)
export const db = getFirestore(app);
export const auth = getAuth(app);

// Storage is disabled - using placeholder images instead
export const storage = null;

// Test Firebase connection
console.log("Firebase initialized:", app);
console.log("Firestore database:", db);
console.log("Firebase auth:", auth);

export default app;