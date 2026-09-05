import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth } from "./firebase";
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

export async function registerWithFirebase(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<UserProfile> {
  const credential = await createUserWithEmailAndPassword(auth, input.email.trim(), input.password);
  await updateProfile(credential.user, { displayName: input.name.trim() });

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

  await createUserProfile(profile);
  return profile;
}

export async function loginWithFirebase(email: string, password: string): Promise<UserProfile> {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const profile = await getUserProfile(credential.user.uid);
  if (profile) return profile;

  // Recover gracefully if an Auth account exists without its Firestore profile.
  const fallback: UserProfile = {
    uid: credential.user.uid,
    name: credential.user.displayName || credential.user.email?.split("@")[0] || "Nitra User",
    email: credential.user.email || email.trim().toLowerCase(),
    nitraId: makeNitraId(credential.user.displayName || "user"),
    initials: initialsFromName(credential.user.displayName || "Nitra User"),
    bio: "",
    status: "Available",
  };
  await createUserProfile(fallback);
  return fallback;
}

export async function logoutFromFirebase() {
  await signOut(auth);
}

export function subscribeToFirebaseAuth(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
