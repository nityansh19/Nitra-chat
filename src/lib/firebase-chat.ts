import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "./firebase";

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  nitraId: string;
  initials: string;
  bio?: string;
  status?: string;
  avatarUrl?: string;
  role?: string;
  location?: string;
  website?: string;
  privacy?: Record<string, boolean>;
};

export type Conversation = {
  id: string;
  type: "direct" | "group";
  title?: string;
  participantIds: string[];
  lastMessageId?: string;
  lastMessageText?: string;
  lastMessageAt?: unknown;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  replyToId?: string;
  reactions?: Record<string, string[]>;
  editedAt?: unknown;
  deletedAt?: unknown;
  createdAt?: unknown;
};

export type FriendRequestStatus = "pending" | "accepted" | "declined" | "cancelled";

export type FriendRequest = {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendRequestStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
};

function getUsersRef() {
  return collection(getFirebaseDb(), "users");
}

function getConversationsRef() {
  return collection(getFirebaseDb(), "conversations");
}

function getFriendRequestsRef() {
  return collection(getFirebaseDb(), "friendRequests");
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getFirebaseDb();
  const snapshot = await getDoc(doc(db, "users", uid));
  if (!snapshot.exists()) return null;
  return { uid: snapshot.id, ...(snapshot.data() as Omit<UserProfile, "uid">) };
}

export async function createUserProfile(profile: UserProfile) {
  const db = getFirebaseDb();
  await setDoc(doc(db, "users", profile.uid), {
    name: profile.name,
    email: profile.email,
    phone: profile.phone || "",
    nitraId: profile.nitraId,
    initials: profile.initials,
    bio: profile.bio || "",
    status: profile.status || "Available",
    avatarUrl: profile.avatarUrl || "",
    role: profile.role || "",
    location: profile.location || "",
    website: profile.website || "",
    privacy: profile.privacy || { showEmail: false, showPhone: false },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserProfile(uid: string, patch: Partial<UserProfile>) {
  const db = getFirebaseDb();
  const { uid: _uid, ...safePatch } = patch;
  await updateDoc(doc(db, "users", uid), { ...safePatch, updatedAt: serverTimestamp() });
}

export async function searchUsers(search: string, currentUid?: string): Promise<UserProfile[]> {
  const normalized = search.trim().toLowerCase();
  if (!normalized) return [];

  const usersRef = getUsersRef();
  const fields = ["nitraId", "email", "name", "phone"] as const;
  const results = new Map<string, UserProfile>();

  for (const field of fields) {
    const snapshot = await getDocs(query(usersRef, where(field, ">=", normalized), where(field, "<=", normalized + "\uf8ff"), limit(10)));
    snapshot.forEach((item) => {
      if (item.id === currentUid) return;
      results.set(item.id, { uid: item.id, ...(item.data() as Omit<UserProfile, "uid">) });
    });
  }

  return [...results.values()].slice(0, 20);
}

export async function getFriendRequestBetween(uid: string, otherUid: string): Promise<FriendRequest | null> {
  const requests = await getDocs(query(getFriendRequestsRef(), where("senderId", "==", uid), where("receiverId", "==", otherUid), limit(10)));
  const reverse = await getDocs(query(getFriendRequestsRef(), where("senderId", "==", otherUid), where("receiverId", "==", uid), limit(10)));
  const all = [...requests.docs, ...reverse.docs];
  const active = all
    .map((item) => ({ id: item.id, ...(item.data() as Omit<FriendRequest, "id">) }))
    .find((item) => item.status === "pending" || item.status === "accepted");
  return active || null;
}

export async function sendFriendRequest(senderId: string, receiverId: string) {
  const authUser = getFirebaseAuth().currentUser;
  if (!authUser) {
    const error = new Error("You are not signed in to Firebase.") as Error & { code?: string };
    error.code = "auth/not-signed-in";
    throw error;
  }

  // Never trust a UID stored in localStorage for a Firestore write. Firebase
  // Security Rules validate request.auth.uid, so the sender must be the
  // currently authenticated Firebase user.
  if (authUser.uid !== senderId) {
    const error = new Error("Your Nitra session is out of sync. Please sign in again.") as Error & { code?: string };
    error.code = "auth/session-mismatch";
    throw error;
  }

  if (senderId === receiverId) throw new Error("You cannot add yourself.");
  const existing = await getFriendRequestBetween(senderId, receiverId);
  if (existing?.status === "accepted") return existing.id;
  if (existing?.status === "pending") return existing.id;

  const created = await addDoc(getFriendRequestsRef(), {
    senderId,
    receiverId,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return created.id;
}

export async function updateFriendRequest(requestId: string, status: "accepted" | "declined" | "cancelled") {
  await updateDoc(doc(getFirebaseDb(), "friendRequests", requestId), { status, updatedAt: serverTimestamp() });
}

export function subscribeToFriendRequests(uid: string, callback: (items: FriendRequest[]) => void): Unsubscribe {
  const requests = getFriendRequestsRef();
  const incoming = query(requests, where("receiverId", "==", uid), where("status", "==", "pending"));
  const outgoing = query(requests, where("senderId", "==", uid), where("status", "==", "pending"));
  let inItems: FriendRequest[] = [];
  let outItems: FriendRequest[] = [];
  const emit = () => callback([...inItems, ...outItems]);
  const unsubIn = onSnapshot(incoming, (snapshot) => {
    inItems = snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<FriendRequest, "id">) }));
    emit();
  });
  const unsubOut = onSnapshot(outgoing, (snapshot) => {
    outItems = snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<FriendRequest, "id">) }));
    emit();
  });
  return () => { unsubIn(); unsubOut(); };
}

export function subscribeToFriends(uid: string, callback: (userIds: string[]) => void): Unsubscribe {
  const requests = getFriendRequestsRef();
  let incoming: FriendRequest[] = [];
  let outgoing: FriendRequest[] = [];
  const emit = () => {
    const ids = new Set<string>();
    incoming.filter((r) => r.status === "accepted").forEach((r) => ids.add(r.senderId));
    outgoing.filter((r) => r.status === "accepted").forEach((r) => ids.add(r.receiverId));
    callback([...ids]);
  };
  const a = onSnapshot(query(requests, where("receiverId", "==", uid)), (snapshot) => {
    incoming = snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<FriendRequest, "id">) }));
    emit();
  });
  const b = onSnapshot(query(requests, where("senderId", "==", uid)), (snapshot) => {
    outgoing = snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<FriendRequest, "id">) }));
    emit();
  });
  return () => { a(); b(); };
}

export async function findOrCreateDirectConversation(uid: string, otherUid: string) {
  const conversationsRef = getConversationsRef();
  const existing = await getDocs(query(conversationsRef, where("participantIds", "array-contains", uid), limit(50)));
  const match = existing.docs.find((item) => {
    const data = item.data();
    const participants = (data.participantIds || []) as string[];
    return data.type === "direct" && participants.length === 2 && participants.includes(otherUid);
  });
  if (match) return match.id;

  const created = await addDoc(conversationsRef, {
    type: "direct",
    participantIds: [uid, otherUid],
    lastMessageText: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return created.id;
}

export function subscribeToConversations(uid: string, callback: (items: Conversation[]) => void): Unsubscribe {
  const conversationsRef = getConversationsRef();
  const q = query(conversationsRef, where("participantIds", "array-contains", uid), orderBy("updatedAt", "desc"));
  return onSnapshot(q, (snapshot) => callback(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<Conversation, "id">) }))));
}

export function subscribeToMessages(conversationId: string, callback: (items: ChatMessage[]) => void): Unsubscribe {
  const db = getFirebaseDb();
  const messagesRef = collection(db, "conversations", conversationId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"));
  return onSnapshot(q, (snapshot) => callback(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<ChatMessage, "id">) }))));
}

export async function sendMessage(conversationId: string, senderId: string, text: string, replyToId?: string) {
  const cleanText = text.trim();
  if (!cleanText) return null;
  const db = getFirebaseDb();
  const messagesRef = collection(db, "conversations", conversationId, "messages");
  const created = await addDoc(messagesRef, { senderId, text: cleanText, replyToId: replyToId || null, reactions: {}, createdAt: serverTimestamp() });
  await updateDoc(doc(db, "conversations", conversationId), { lastMessageId: created.id, lastMessageText: cleanText, lastMessageAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return created.id;
}

export function mapFirestoreError(error: unknown) {
  const code = (error as { code?: string })?.code || "";
  const messages: Record<string, string> = {
    "auth/email-already-in-use": "That email is already registered. Try signing in instead.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/weak-password": "Password must contain at least 8 characters.",
    "auth/operation-not-allowed": "Email/password sign-in is not enabled in Firebase yet. Enable it under Authentication → Sign-in method → Email/Password.",
    "auth/unauthorized-domain": "This Nitra Chat domain is not authorized in Firebase Authentication. Add nitrachat.vercel.app under Authentication → Settings → Authorized domains.",
    "auth/app-not-authorized": "This web app is not authorized for the Firebase project. Check the Firebase web app configuration and API key.",
    "auth/configuration-not-found": "Firebase Authentication is not configured for this project. Check Authentication → Sign-in method in Firebase.",
    "auth/invalid-api-key": "Firebase is missing its web configuration. Check the NEXT_PUBLIC_FIREBASE_* variables in Vercel.",
    "auth/network-request-failed": "Firebase could not be reached. Check your internet connection and try again.",
    "auth/internal-error": "Firebase returned an internal authentication error. Check the Firebase project configuration and try again.",
    "auth/too-many-requests": "Firebase temporarily blocked more requests from this device. Wait a little and try again.",
    "auth/quota-exceeded": "Firebase authentication quota was exceeded. Try again later.",
    "auth/web-storage-unsupported": "This browser cannot store the Firebase session. Try Chrome or another browser with site storage enabled.",
    "auth/not-signed-in": "Your Firebase session is missing. Sign out and sign in again, then try adding the friend.",
    "auth/session-mismatch": "Your Nitra session is out of sync with Firebase. Sign out and sign in again, then try adding the friend.",
    "permission-denied": "Firebase Authentication worked, but Firestore denied the request. Publish the Firestore rules for this project.",
    "failed-precondition": "Firestore needs an index or configuration update. Check the Firestore console.",
    "unavailable": "Firebase is temporarily unavailable. Please try again in a moment.",
  };
  if (code && messages[code]) return messages[code];
  const message = (error as { message?: string })?.message;
  if (message?.toLowerCase().includes("missing or insufficient permissions")) return "Firebase denied this action. Check the published Firestore rules.";
  if (code) return `Firebase error (${code}). Check the Firebase Authentication and Firestore configuration.`;
  if (message) return message;
  return "Something went wrong. Please try again.";
}
