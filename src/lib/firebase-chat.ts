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
import { db } from "./firebase";

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

const usersRef = collection(db, "users");
const conversationsRef = collection(db, "conversations");

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(db, "users", uid));
  if (!snapshot.exists()) return null;
  return { uid: snapshot.id, ...(snapshot.data() as Omit<UserProfile, "uid">) };
}

export async function createUserProfile(profile: UserProfile) {
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
  const { uid: _uid, ...safePatch } = patch;
  await updateDoc(doc(db, "users", uid), { ...safePatch, updatedAt: serverTimestamp() });
}

export async function searchUsers(search: string, currentUid?: string): Promise<UserProfile[]> {
  const normalized = search.trim().toLowerCase();
  if (!normalized) return [];

  const fields = ["nitraId", "email", "name", "phone"] as const;
  const results = new Map<string, UserProfile>();

  for (const field of fields) {
    const snapshot = await getDocs(
      query(
        usersRef,
        where(field, ">=", normalized),
        where(field, "<=", normalized + "\uf8ff"),
        limit(10),
      ),
    );
    snapshot.forEach((item) => {
      if (item.id === currentUid) return;
      results.set(item.id, { uid: item.id, ...(item.data() as Omit<UserProfile, "uid">) });
    });
  }

  return [...results.values()].slice(0, 20);
}

export async function findOrCreateDirectConversation(uid: string, otherUid: string) {
  const existing = await getDocs(
    query(
      conversationsRef,
      where("type", "==", "direct"),
      where("participantIds", "array-contains", uid),
      limit(50),
    ),
  );
  const match = existing.docs.find((item) => {
    const participants = (item.data().participantIds || []) as string[];
    return participants.length === 2 && participants.includes(otherUid);
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
  const q = query(
    conversationsRef,
    where("participantIds", "array-contains", uid),
    orderBy("updatedAt", "desc"),
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<Conversation, "id">) })));
  });
}

export function subscribeToMessages(conversationId: string, callback: (items: ChatMessage[]) => void): Unsubscribe {
  const messagesRef = collection(db, "conversations", conversationId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<ChatMessage, "id">) })));
  });
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string,
  replyToId?: string,
) {
  const cleanText = text.trim();
  if (!cleanText) return null;

  const messagesRef = collection(db, "conversations", conversationId, "messages");
  const created = await addDoc(messagesRef, {
    senderId,
    text: cleanText,
    replyToId: replyToId || null,
    reactions: {},
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessageId: created.id,
    lastMessageText: cleanText,
    lastMessageAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return created.id;
}

export function mapFirestoreError(error: unknown) {
  const code = (error as { code?: string })?.code;
  const messages: Record<string, string> = {
    "auth/email-already-in-use": "That email is already registered.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/weak-password": "Password must contain at least 8 characters.",
    "permission-denied": "Firebase denied this action. Check Firestore rules.",
  };
  return (code && messages[code]) || "Something went wrong. Please try again.";
}
