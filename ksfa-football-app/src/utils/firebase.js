// src/utils/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyDspDWr-naHJL4A7WwmzLflo5jytvL45OY",
  authDomain: "footballdemo-5db1f.firebaseapp.com",
  projectId: "footballdemo-5db1f",
  storageBucket: "footballdemo-5db1f.firebasestorage.app",
  messagingSenderId: "140722212660",
  appId: "1:140722212660:web:4dbae5a944e96a5c135f61",
  measurementId: "G-TGWTQNDNDK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

