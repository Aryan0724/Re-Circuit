// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAcoz3FPtzMlqmVlhSKhKIIsR9dcv4ESYU",
  authDomain: "re-circuit.firebaseapp.com",
  projectId: "re-circuit",
  storageBucket: "re-circuit.appspot.com",
  messagingSenderId: "220008974760",
  appId: "1:220008974760:web:5fa2f57cf573fca058759d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
