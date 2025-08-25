import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// IMPORTANT: Replace this with your own Firebase configuration
// You can get this from the Firebase console:
// Project settings > General > Your apps > Web app > Firebase SDK snippet > Config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAcoz3FPtzMlqmVlhSKhKIIsR9dcv4ESYU",
  authDomain: "re-circuit.firebaseapp.com",
  projectId: "re-circuit",
  storageBucket: "re-circuit.appspot.com",
  messagingSenderId: "220008974760",
  appId: "1:220008974760:web:5fa2f57cf573fca058759d",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, googleProvider };
