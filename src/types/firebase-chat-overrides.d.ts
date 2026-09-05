import type { UserProfile } from "@/lib/firebase-chat";

declare module "@/lib/firebase-chat" {
  export function getUserProfile(uid: string): Promise<UserProfile>;
}
