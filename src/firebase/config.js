// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBnil9YV9LpAVA4GLUjoPoq7PSgq3DYYgk",
  authDomain: "animals-adoption-app-v2.firebaseapp.com",
  projectId: "animals-adoption-app-v2",
  storageBucket: "animals-adoption-app-v2.appspot.com",
  messagingSenderId: "702758490735",
  appId: "1:702758490735:web:animals-adoption-app-v2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Test Firebase connection
console.log("Firebase initialized:", app);
console.log("Firestore database:", db);
console.log("Firebase auth:", auth);

export default app;