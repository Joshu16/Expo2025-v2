// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBZ28tY4uu7Ec0pou2vQl9PlEiqU0IFc4U",
  authDomain: "animals-adoption-app.firebaseapp.com",
  projectId: "animals-adoption-app",
  storageBucket: "animals-adoption-app.firebasestorage.app",
  messagingSenderId: "360360840693",
  appId: "1:360360840693:web:f81ab7be2be926eca5a4bc",
  measurementId: "G-HDDQLXGS7R"
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