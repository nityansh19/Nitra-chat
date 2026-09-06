import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pagePath = path.join(root, "src", "app", "page.tsx");
const chatPath = path.join(root, "src", "lib", "firebase-chat.ts");

function patchFile(filePath, transform) {
  const before = fs.readFileSync(filePath, "utf8");
  const after = transform(before);
  if (after !== before) fs.writeFileSync(filePath, after);
}

patchFile(chatPath, (source) => {
  let s = source;
  s = s.replace(
    'export type Conversation = { id: string; type: "direct" | "group"; title?: string; participantIds: string[]; lastMessageId?: string; lastMessageText?: string; lastMessageAt?: unknown; updatedAt?: unknown };',
    'export type Conversation = { id: string; type: "direct" | "group"; title?: string; participantIds: string[]; lastMessageId?: string; lastMessageText?: string; lastMessageAt?: unknown; updatedAt?: unknown; readBy?: Record<string, unknown> };',
  );

  if (!s.includes("export async function markConversationRead(")) {
    const start = s.indexOf("export function subscribeToMessages(");
    const end = s.indexOf("export async function sendMessage(", start);
    if (start < 0 || end < 0) throw new Error("Could not locate Firebase message listener.");
    const replacement = `export function subscribeToMessages(conversationId: string, callback: (items: ChatMessage[]) => void): Unsubscribe {
  return onSnapshot(
    query(collection(getFirebaseDb(), "conversations", conversationId, "messages"), orderBy("createdAt", "asc")),
    (snapshot) => callback(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<ChatMessage, "id">) }))),
  );
}

export async function markConversationRead(conversationId: string, uid: string) {
  const authUser = getFirebaseAuth().currentUser;
  if (!authUser || authUser.uid !== uid) return;
  try {
    await updateDoc(doc(getFirebaseDb(), "conversations", conversationId), {
      [\`readBy.\${uid}\`]: serverTimestamp(),
    });
  } catch {
    // The UI still clears its local badge. A later conversation snapshot will retry.
  }
}

`;
    s = s.slice(0, start) + replacement + s.slice(end);
  }
  return s;
});

patchFile(pagePath, (source) => {
  let p = source;

  p = p.replace(
    'findOrCreateDirectConversation, getUserProfile, mapFirestoreError, sendMessage as sendFirebaseMessage, subscribeToConversations, subscribeToMessages',
    'findOrCreateDirectConversation, getUserProfile, mapFirestoreError, markConversationRead, sendMessage as sendFirebaseMessage, subscribeToConversations, subscribeToMessages',
  );

  p = p.replace(
    'type Chat = { id: string; contact: Contact; messages: Message[]; pinned?: boolean; muted?: boolean; archived?: boolean; unread: number; lastTime: string; firebaseConversationId?: string };',
    'type Chat = { id: string; contact: Contact; messages: Message[]; pinned?: boolean; muted?: boolean; archived?: boolean; unread: number; lastTime: string; firebaseConversationId?: string; readBy?: Record<string, unknown> };',
  );

  p = p.replace(
    '{mine && <CheckCheck size={11} />}',
    '{mine && <CheckCheck size={11} className={message.read ? "text-sky-400" : "text-white/30"} />}',
  );

  p = p.replace(
    'firebaseConversationId: item.conversation.id',
    'firebaseConversationId: item.conversation.id, readBy: item.conversation.readBy || {}',
  );

  if (!p.includes("function firebaseTimestampMillis(value: unknown)")) {
    const marker = "function hashMessageId(value: string) {";
    const helper = `function firebaseTimestampMillis(value: unknown) {
  if (value && typeof value === "object" && "toMillis" in value && typeof (value as { toMillis?: () => number }).toMillis === "function") return (value as { toMillis: () => number }).toMillis();
  if (value instanceof Date) return value.getTime();
  return typeof value === "number" ? value : 0;
}

`;
    p = p.replace(marker, helper + marker);
  }

  const oldMap = `const messages: Message[] = firebaseMessages.map((m) => ({
            id: hashMessageId(m.id),
            from: m.senderId === user.uid ? "me" : "them",
            text: m.text,
            time: formatFirebaseTime(m.createdAt),
            read: Boolean(m.readAt),
          }));
          const last = messages.at(-1);
          return { ...current, messages, lastTime: last?.time || current.lastTime, unread: activeId === current.id ? 0 : messages.filter((m) => m.from === "them" && !m.read).length };`;

  const newMap = `const messages: Message[] = firebaseMessages.map((m) => {
            const mine = m.senderId === user.uid;
            const readerId = mine ? current.contact.id : user.uid;
            const readAt = current.readBy?.[readerId];
            const createdAt = firebaseTimestampMillis(m.createdAt);
            const watermark = firebaseTimestampMillis(readAt);
            const read = createdAt > 0 && watermark > 0 && createdAt <= watermark;
            return {
              id: hashMessageId(m.id),
              from: mine ? "me" : "them",
              text: m.text,
              time: formatFirebaseTime(m.createdAt),
              read,
            };
          });
          const last = messages.at(-1);
          const unread = activeId === current.id ? 0 : messages.filter((m) => m.from === "them" && !m.read).length;
          return { ...current, messages, lastTime: last?.time || current.lastTime, unread };`;

  if (p.includes(oldMap)) p = p.replace(oldMap, newMap);

  if (!p.includes("markConversationRead(active.firebaseConversationId")) {
    const marker = "  const active = chats.find(c => c.id === activeId) || null;";
    const effect = `  const active = chats.find(c => c.id === activeId) || null;

  useEffect(() => {
    if (!user?.uid || !active?.firebaseConversationId) return;
    void markConversationRead(active.firebaseConversationId, user.uid);
  }, [user?.uid, active?.firebaseConversationId]);`;
    if (!p.includes(marker)) throw new Error("Could not locate active chat state.");
    p = p.replace(marker, effect);
  }

  return p;
});

console.log("Nitra read receipts patched.");
