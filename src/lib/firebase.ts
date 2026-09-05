import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  databaseURL?: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
};

declare global {
  interface Window {
    __NITRA_FIREBASE_CONFIG__?: FirebaseClientConfig;
  }
}

// Firebase Web configuration for the Nitra Chat Firebase project.
// These are client-side Firebase web-app identifiers; no Admin/service-account
// credentials are included. Runtime config is preferred when available.
const providedFirebaseConfig: FirebaseClientConfig = {
  apiKey: "AIzaSyAHyMPD2Wo5bYlZ5mu2zOoUU0nUAaC7tsY",
  authDomain: "nitra-chat-3fd77.firebaseapp.com",
  databaseURL: "https://nitra-chat-3fd77-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nitra-chat-3fd77",
  storageBucket: "nitra-chat-3fd77.firebasestorage.app",
  messagingSenderId: "492110163096",
  appId: "1:492110163096:web:3a1d036fb07e7362be34ed",
  measurementId: "G-HXWYQXNMRB",
};

// Prefer runtime config injected by the server layout. The provided web config
// is the fallback so the deployed client can initialize Firebase even when
// NEXT_PUBLIC_* variables are not exposed to the browser bundle.
function getConfig(): FirebaseClientConfig {
  const runtimeConfig = typeof window !== "undefined" ? window.__NITRA_FIREBASE_CONFIG__ : undefined;
  if (runtimeConfig?.apiKey && runtimeConfig.projectId && runtimeConfig.appId) {
    return runtimeConfig;
  }

  return {
    ...providedFirebaseConfig,
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || providedFirebaseConfig.apiKey,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || providedFirebaseConfig.authDomain,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || providedFirebaseConfig.projectId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || providedFirebaseConfig.storageBucket,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || providedFirebaseConfig.messagingSenderId,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || providedFirebaseConfig.appId,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || providedFirebaseConfig.measurementId,
  };
}

function requireFirebaseApp(): FirebaseApp {
  const firebaseConfig = getConfig();
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseAuth(): Auth {
  return getAuth(requireFirebaseApp());
}

export function getFirebaseDb(): Firestore {
  return getFirestore(requireFirebaseApp());
}

export default requireFirebaseApp;
