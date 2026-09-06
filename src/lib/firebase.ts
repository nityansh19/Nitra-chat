import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAHyMPD2Wo5bYlZ5mu2zOoUU0nUAaC7tsY",
  authDomain: "nitra-chat-3fd77.firebaseapp.com",
  databaseURL: "https://nitra-chat-3fd77-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nitra-chat-3fd77",
  storageBucket: "nitra-chat-3fd77.firebasestorage.app",
  messagingSenderId: "492110163096",
  appId: "1:492110163096:web:3a1d036fb07e7362be34ed",
  measurementId: "G-HXWYQXNMRB",
};

function requireFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseAuth(): Auth {
  return getAuth(requireFirebaseApp());
}

export function getFirebaseDb(): Firestore {
  return getFirestore(requireFirebaseApp());
}

export default requireFirebaseApp;
