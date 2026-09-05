# Nitra Chat

A premium, futuristic real-time communication workspace built from scratch with Next.js, TypeScript, Tailwind CSS, Motion, Lucide, and Firebase.

## Current phase

**Firebase migration — foundation ready**

The project is moving from the earlier MongoDB/JWT prototype to Firebase so the realtime communication stack can be built around Firebase Authentication + Cloud Firestore.

### Phase 0/1 foundation
- Premium dark-first communication workspace
- Three-layer desktop layout: navigation rail, conversations, active chat
- Optional conversation details panel
- Responsive mobile conversation drawer
- Animated message entrance and typing state

### Phase 2 additions
- Conversation switching with per-chat local message state
- Unread counts clear when a conversation is opened
- Command palette with `Cmd/Ctrl + K` and `Esc`
- Search conversations from the command palette
- Functional new-message action
- Message actions and local reactions
- Emoji picker
- Automatic scroll-to-latest-message
- Simulated reply/typing feedback
- Interactive call/video/info/attachment controls with feedback toasts
- Empty search state and keyboard-focus accessibility polish
- Reduced-motion support

### Phase 3 additions
- Premium login and registration screens
- Registration with display name, email, phone number, password, and confirmation
- Frontend validation and automatic Nitra ID generation
- Local demo identity/session persistence
- Personalized workspace identity and sign-out interaction

### Phase 4 additions
- Dedicated `/profile` identity workspace
- Premium profile header with Nitra ID and live status
- Editable display name, bio, and status
- Copy-Nitra-ID interaction
- Email and phone identity summary
- Privacy controls UI
- Profile picture upload and profile customization UI

### Previous backend prototype
- MongoDB connection layer and Mongoose models were used as the first backend prototype
- JWT HTTP-only sessions, REST APIs, and database-backed search were implemented during the prototype stage
- The frontend still contained prototype/local state in some areas

### Firebase foundation — current
- Firebase project: `nitra-chat-3fd77`
- Firebase Web SDK added to the application
- Firebase Authentication client initialized
- Cloud Firestore client initialized
- Firestore data-access layer added for users, conversations, and messages
- Realtime Firestore subscriptions prepared for conversations and messages
- Direct-conversation creation/find logic prepared
- User search prepared for Nitra ID, name, email, and phone
- Message sending prepared with reply support and conversation metadata updates
- Firestore security rules included under `firebase/firestore.rules`
- Firestore composite index configuration included under `firebase/firestore.indexes.json`
- Firebase CLI deployment configuration included in `firebase.json`
- Local environment files are ignored by Git

## Firebase setup

The Firebase project is already created and the Cloud Firestore database has been created.

Enable **Authentication → Sign-in method → Email/Password** in the Firebase Console before testing authentication.

Copy `.env.example` to `.env.local` if you want to override the Firebase Web configuration with environment variables. The checked-in client configuration is not a service-account credential; Firebase Web API configuration is designed to be used by browser clients.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nitra-chat-3fd77
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

Then install dependencies and run the app:

```bash
npm install
npm run dev
```

### Storage note

Firebase Cloud Storage is **not enabled** because the current project is on the no-cost Spark plan and the Firebase Console is requiring the Blaze billing plan for Storage. Nitra Chat will therefore keep Storage out of the critical path for now. Profile/media storage will be added later only when a suitable no-cost storage strategy is chosen.

## Firebase data model

```text
users/{uid}
  name
  email
  phone
  nitraId
  initials
  bio
  status
  avatarUrl
  role
  location
  website
  privacy
  createdAt
  updatedAt

conversations/{conversationId}
  type
  title
  participantIds
  lastMessageId
  lastMessageText
  lastMessageAt
  createdAt
  updatedAt

conversations/{conversationId}/messages/{messageId}
  senderId
  text
  replyToId
  reactions
  editedAt
  deletedAt
  createdAt
```

## Roadmap

1. Frontend foundation — complete
2. Interactive workspace — complete
3. Authentication & Nitra identity frontend — complete
4. Profiles & Nitra identity workspace — complete
5. MongoDB backend prototype — complete as prototype
6. Firebase project + Firestore foundation — **complete**
7. Firebase Authentication migration — next
8. Firebase-backed profiles and user discovery
9. Realtime conversations and messages
10. Presence, typing, reactions, replies, editing and deletion
11. Offline/loading/error states
12. Media strategy without making paid Storage a requirement
13. Production polish and Vercel deployment

> The Firebase data layer is now prepared, but the existing UI is not yet fully migrated to Firebase. The next implementation step is replacing the demo/localStorage authentication flow with Firebase Authentication and wiring the workspace to Firestore.
