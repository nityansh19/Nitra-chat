import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
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

// Prefer the runtime config injected by the server layout. The process.env
// fallback keeps local development working with .env.local.
function getConfig(): FirebaseClientConfig {
  const runtimeConfig = typeof window !== "undefined" ? window.__NITRA_FIREBASE_CONFIG__ : undefined;
  return runtimeConfig ?? {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
  };
}

function requireFirebaseApp(): FirebaseApp {
  const firebaseConfig = getConfig();
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
    throw new Error("Firebase is not configured. Add the NEXT_PUBLIC_FIREBASE_* environment variables.");
  }
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseAuth(): Auth {
  return getAuth(requireFirebaseApp());
}

export function getFirebaseDb(): Firestore {
  return getFirestore(requireFirebaseApp());
}

export default requireFirebaseApp;
