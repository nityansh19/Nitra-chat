# Nitra Chat

Nitra Chat is a premium communication workspace built around focused conversations, expressive messaging, and a polished multi-panel interface.

## Current status

**Frontend experience complete for the current phase. Backend migration is the next major step.**

The repository already includes the full interaction model, Firebase project foundation, responsive layouts, and the UI states needed to connect the product to real-time services.

## Core experience

### Conversations

- Conversation switching and filtering
- Search across conversations and message text
- Unread and read-state visuals
- Pin, mute, archive, save, copy, and delete interactions
- Message reactions and contextual actions
- Auto-scroll and simulated typing/reply feedback

### Communication tools

- Emoji picker
- GIF picker and GIF search UI
- Attachment affordance
- Voice-note preview flow
- Call and video-call affordances
- Toast feedback and contextual states

### Workspace UX

- Desktop navigation rail, conversation list, active chat, and context panel
- Responsive mobile conversation drawer
- Command/search overlay with `Cmd/Ctrl + K`
- Keyboard-focus and reduced-motion support
- Login, registration, and profile interfaces
- Dark-first visual system with layered depth and purposeful motion

## Tech stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Motion
- Lucide React
- Firebase SDK
- Firestore foundation

## Planned backend architecture

```text
Next.js UI
   │
   ├── Firebase Authentication
   │
   ├── Cloud Firestore
   │      ├── users
   │      ├── conversations
   │      └── message subcollections
   │
   └── Media/storage provider
```

Cloud Storage is not enabled on the current Firebase Spark setup, so attachment and profile-media controls remain UI affordances until a storage provider is selected.

## Run locally

```bash
npm install
npm run dev
```

Create `.env.local` from `.env.example` and add the Firebase Web App configuration.

Never commit `.env.local`, API secrets, or private credentials.

## Development roadmap

### Completed

1. Frontend visual foundation
2. Responsive workspace
3. Conversation and message interactions
4. Authentication/profile UI
5. Firebase and database foundation
6. Search, command palette, reactions, GIFs, and expressive messaging UI

### Next

1. Migrate authentication to Firebase Authentication
2. Persist users, conversations, messages, and message actions in Firestore
3. Add real-time presence, typing, unread state, and notifications
4. Select and integrate media storage
5. Add robust loading, offline, and error states
6. Finalize security rules and production deployment

## Product direction

Nitra is intentionally designed as a communication workspace rather than a generic chat clone. New features should improve clarity, speed, or conversation quality without making the interface feel crowded.
