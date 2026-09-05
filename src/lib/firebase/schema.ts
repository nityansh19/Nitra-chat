import {
  collection,
  doc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "./client";

export type UserProfile = {
  uid: string;
  nitraId: string;
  name: string;
  email: string;
  phone?: string;
  initials: string;
  bio?: string;
  status?: string;
  avatarUrl?: string;
  role?: string;
  location?: string;
  website?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type Conversation = {
  id: string;
  type: "direct" | "group";
  title?: string;
  participantIds: string[];
  lastMessageId?: string;
  updatedAt?: Timestamp;
  createdAt?: Timestamp;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  replyToId?: string;
  reactions?: Record<string, string[]>;
  editedAt?: Timestamp;
  deletedAt?: Timestamp;
  createdAt?: Timestamp;
};

export const usersCollection = () => collection(firestore, "users");
export const userDocument = (uid: string) => doc(firestore, "users", uid);
export const conversationsCollection = () => collection(firestore, "conversations");
export const conversationDocument = (id: string) =>
  doc(firestore, "conversations", id);
export const messagesCollection = (conversationId: string) =>
  collection(firestore, "conversations", conversationId, "messages");

export const now = () => serverTimestamp();
