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

export type UserProfile = { uid: string; name: string; email: string; phone?: string; nitraId: string; initials: string; bio?: string; status?: string; avatarUrl?: string; role?: string; location?: string; website?: string; privacy?: Record<string, boolean> };
export type Conversation = { id: string; type: "direct" | "group"; title?: string; participantIds: string[]; lastMessageId?: string; lastMessageText?: string; lastMessageAt?: unknown; updatedAt?: unknown };
export type ChatMessage = { id: string; senderId: string; text: string; replyToId?: string; reactions?: Record<string, string[]>; editedAt?: unknown; deletedAt?: unknown; createdAt?: unknown };
export type FriendRequestStatus = "pending" | "accepted" | "declined" | "cancelled";
export type FriendRequest = { id: string; senderId: string; receiverId: string; status: FriendRequestStatus; createdAt?: unknown; updatedAt?: unknown };

function getUsersRef() { return collection(getFirebaseDb(), "users"); }
function getConversationsRef() { return collection(getFirebaseDb(), "conversations"); }
function getFriendRequestsRef() { return collection(getFirebaseDb(), "friendRequests"); }

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(getFirebaseDb(), "users", uid));
  if (!snapshot.exists()) return null;
  return { uid: snapshot.id, ...(snapshot.data() as Omit<UserProfile, "uid">) };
}

export async function createUserProfile(profile: UserProfile) {
  await setDoc(doc(getFirebaseDb(), "users", profile.uid), {
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
  await updateDoc(doc(getFirebaseDb(), "users", uid), { ...safePatch, updatedAt: serverTimestamp() });
}

export async function searchUsers(search: string, currentUid?: string): Promise<UserProfile[]> {
  const normalized = search.trim().toLowerCase();
  if (!normalized) return [];
  const results = new Map<string, UserProfile>();
  for (const field of ["nitraId", "email", "name", "phone"] as const) {
    const snapshot = await getDocs(query(
      getUsersRef(),
      where(field, ">=", normalized),
      where(field, "<=", normalized + "\uf8ff"),
      limit(10),
    ));
    snapshot.forEach((item) => {
      if (item.id !== currentUid) results.set(item.id, { uid: item.id, ...(item.data() as Omit<UserProfile, "uid">) });
    });
  }
  return [...results.values()].slice(0, 20);
}

export async function getFriendRequestBetween(uid: string, otherUid: string): Promise<FriendRequest | null> {
  const a = await getDocs(query(getFriendRequestsRef(), where("senderId", "==", uid), where("receiverId", "==", otherUid), limit(10)));
  const b = await getDocs(query(getFriendRequestsRef(), where("senderId", "==", otherUid), where("receiverId", "==", uid), limit(10)));
  return [...a.docs, ...b.docs]
    .map((item) => ({ id: item.id, ...(item.data() as Omit<FriendRequest, "id">) }))
    .find((item) => item.status === "pending" || item.status === "accepted") || null;
}

export async function sendFriendRequest(senderId: string, receiverId: string) {
  const authUser = getFirebaseAuth().currentUser;
  if (!authUser) throw Object.assign(new Error("You are not signed in to Firebase."), { code: "auth/not-signed-in" });
  if (authUser.uid !== senderId) throw Object.assign(new Error("Your Nitra session is out of sync. Please sign in again."), { code: "auth/session-mismatch" });
  if (senderId === receiverId) throw new Error("You cannot add yourself.");

  const existing = await getFriendRequestBetween(senderId, receiverId);
  if (existing?.status === "accepted" || existing?.status === "pending") return existing.id;

  return (await addDoc(getFriendRequestsRef(), {
    senderId,
    receiverId,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })).id;
}

export async function updateFriendRequest(requestId: string, status: "accepted" | "declined" | "cancelled") {
  await updateDoc(doc(getFirebaseDb(), "friendRequests", requestId), { status, updatedAt: serverTimestamp() });
}

export function subscribeToFriendRequests(uid: string, callback: (items: FriendRequest[]) => void): Unsubscribe {
  const ref = getFriendRequestsRef();
  let incoming: FriendRequest[] = [];
  let outgoing: FriendRequest[] = [];
  const emit = () => callback([...incoming, ...outgoing]);

  const unsubscribeIncoming = onSnapshot(
    query(ref, where("receiverId", "==", uid), where("status", "==", "pending")),
    (snapshot) => {
      incoming = snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<FriendRequest, "id">) }));
      emit();
    },
  );
  const unsubscribeOutgoing = onSnapshot(
    query(ref, where("senderId", "==", uid), where("status", "==", "pending")),
    (snapshot) => {
      outgoing = snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<FriendRequest, "id">) }));
      emit();
    },
  );
  return () => { unsubscribeIncoming(); unsubscribeOutgoing(); };
}

export function subscribeToFriends(uid: string, callback: (userIds: string[]) => void): Unsubscribe {
  const ref = getFriendRequestsRef();
  let incoming: FriendRequest[] = [];
  let outgoing: FriendRequest[] = [];
  const emit = () => {
    const ids = new Set<string>();
    incoming.filter((item) => item.status === "accepted").forEach((item) => ids.add(item.senderId));
    outgoing.filter((item) => item.status === "accepted").forEach((item) => ids.add(item.receiverId));
    callback([...ids]);
  };

  const unsubscribeIncoming = onSnapshot(query(ref, where("receiverId", "==", uid)), (snapshot) => {
    incoming = snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<FriendRequest, "id">) }));
    emit();
  });
  const unsubscribeOutgoing = onSnapshot(query(ref, where("senderId", "==", uid)), (snapshot) => {
    outgoing = snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<FriendRequest, "id">) }));
    emit();
  });
  return () => { unsubscribeIncoming(); unsubscribeOutgoing(); };
}

export async function findOrCreateDirectConversation(uid: string, otherUid: string) {
  const existing = await getDocs(query(getConversationsRef(), where("participantIds", "array-contains", uid), limit(50)));
  const match = existing.docs.find((item) => {
    const data = item.data();
    const participants = (data.participantIds || []) as string[];
    return data.type === "direct" && participants.length === 2 && participants.includes(otherUid);
  });
  if (match) return match.id;

  return (await addDoc(getConversationsRef(), {
    type: "direct",
    participantIds: [uid, otherUid],
    lastMessageText: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })).id;
}

function timestampMillis(value: unknown) {
  if (value && typeof value === "object" && "toMillis" in value && typeof (value as { toMillis?: () => number }).toMillis === "function") {
    return (value as { toMillis: () => number }).toMillis();
  }
  return 0;
}

export function subscribeToConversations(uid: string, callback: (items: Conversation[]) => void): Unsubscribe {
  // Do not use orderBy here. The participantIds query is the authorization
  // boundary, and client-side sorting avoids an unnecessary composite index.
  return onSnapshot(
    query(getConversationsRef(), where("participantIds", "array-contains", uid), limit(100)),
    (snapshot) => {
      const items = snapshot.docs
        .map((item) => ({ id: item.id, ...(item.data() as Omit<Conversation, "id">) }))
        .sort((a, b) => timestampMillis(b.updatedAt) - timestampMillis(a.updatedAt));
      callback(items);
    },
  );
}

export function subscribeToMessages(conversationId: string, callback: (items: ChatMessage[]) => void): Unsubscribe {
  return onSnapshot(
    query(collection(getFirebaseDb(), "conversations", conversationId, "messages"), orderBy("createdAt", "asc")),
    (snapshot) => callback(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<ChatMessage, "id">) }))),
  );
}

export async function sendMessage(conversationId: string, senderId: string, text: string, replyToId?: string) {
  const authUser = getFirebaseAuth().currentUser;
  if (!authUser) throw Object.assign(new Error("Your Firebase session is not ready. Please sign in again."), { code: "auth/not-signed-in" });
  if (authUser.uid !== senderId) throw Object.assign(new Error("Your Nitra session is out of sync with Firebase. Please sign in again."), { code: "auth/session-mismatch" });

  const cleanText = text.trim();
  if (!cleanText) return null;

  const conversation = await getDoc(doc(getFirebaseDb(), "conversations", conversationId));
  if (!conversation.exists()) throw Object.assign(new Error("This conversation no longer exists. Open the chat again."), { code: "chat/conversation-missing" });

  const participantIds = (conversation.data().participantIds || []) as string[];
  if (!participantIds.includes(authUser.uid)) {
    throw Object.assign(new Error("This conversation does not belong to your Firebase account. Open the chat again."), { code: "chat/not-participant" });
  }

  const created = await addDoc(collection(getFirebaseDb(), "conversations", conversationId, "messages"), {
    senderId: authUser.uid,
    text: cleanText,
    replyToId: replyToId || null,
    reactions: {},
    createdAt: serverTimestamp(),
  });

  // Message delivery is the critical operation. Conversation metadata is only
  // a convenience for sorting the inbox, so a metadata-rule failure must not
  // make an otherwise successful message look unsent to the user.
  try {
    await updateDoc(doc(getFirebaseDb(), "conversations", conversationId), {
      lastMessageId: created.id,
      lastMessageText: cleanText,
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch {
    // The realtime message listener still delivers the message. The next
    // conversation refresh will repair the inbox ordering when permissions are fixed.
  }

  return created.id;
}

export function mapFirestoreError(error: unknown) {
  const code = (error as { code?: string })?.code || "";
  const map: Record<string, string> = {
    "permission-denied": "Firestore denied this action. Make sure the published rules belong to project nitra-chat-3fd77.",
    "failed-precondition": "Firestore needs an index for this query. Check the Firebase console.",
    "auth/not-signed-in": "Your Firebase session is missing. Sign out and sign in again, then try again.",
    "auth/session-mismatch": "Your Nitra session is out of sync with Firebase. Sign out and sign in again, then try again.",
    "chat/conversation-missing": "This conversation no longer exists. Open the chat again.",
    "chat/not-participant": "This chat belongs to a different Firebase account. Open the chat again.",
  };
  return map[code] || ((error as { message?: string })?.message || "Something went wrong with Firebase.");
}
