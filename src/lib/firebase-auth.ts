import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase";
import { createUserProfile, getUserProfile, type UserProfile } from "./firebase-chat";

function initialsFromName(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "NU";
}

function makeNitraId(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 18) || "user";
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `@${base}_${suffix}`;
}

function withTimeout<T>(promise: Promise<T>, ms = 15000, message = "Firebase is taking too long to respond. Check your Firebase configuration and try again."): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export async function registerWithFirebase(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<UserProfile> {
  const auth = getFirebaseAuth();

  // Authentication is the only operation that blocks entering Nitra.
  // Firestore profile creation happens in the background so a slow/blocked
  // Firestore request can never leave the signup button stuck forever.
  const credential = await withTimeout(
    createUserWithEmailAndPassword(auth, input.email.trim(), input.password),
    15000,
    "Firebase Authentication did not respond within 15 seconds. Check that Email/Password sign-in is enabled and that nitrachat.vercel.app is an authorized domain.",
  );

  const profile: UserProfile = {
    uid: credential.user.uid,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    nitraId: makeNitraId(input.name),
    initials: initialsFromName(input.name),
    bio: "",
    status: "Available",
    avatarUrl: "",
    role: "",
    location: "",
    website: "",
    privacy: { showEmail: false, showPhone: false },
  };

  // Do not make navigation depend on Firestore. Both operations are attempted
  // independently; a Firestore/rules/network problem can be repaired later.
  void updateProfile(credential.user, { displayName: profile.name }).catch(() => undefined);
  void createUserProfile(profile).catch(() => undefined);

  return profile;
}

export async function loginWithFirebase(email: string, password: string): Promise<UserProfile> {
  const auth = getFirebaseAuth();
  const credential = await withTimeout(
    signInWithEmailAndPassword(auth, email.trim(), password),
    15000,
    "Firebase Authentication did not respond within 15 seconds. Check your connection and Firebase configuration.",
  );

  const profile = await withTimeout(
    getUserProfile(credential.user.uid),
    10000,
    "Firebase signed you in, but Firestore did not respond. Check the Firestore configuration.",
  );
  if (profile) return profile;

  const fallback: UserProfile = {
    uid: credential.user.uid,
    name: credential.user.displayName || credential.user.email?.split("@")[0] || "Nitra User",
    email: credential.user.email || email.trim().toLowerCase(),
    nitraId: makeNitraId(credential.user.displayName || "user"),
    initials: initialsFromName(credential.user.displayName || "Nitra User"),
    bio: "",
    status: "Available",
  };

  // A missing profile should not block login either. Repair it in the
  // background after the authenticated user reaches the app.
  void createUserProfile(fallback).catch(() => undefined);
  return fallback;
}

export async function logoutFromFirebase() {
  await signOut(getFirebaseAuth());
}

export function subscribeToFirebaseAuth(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}
