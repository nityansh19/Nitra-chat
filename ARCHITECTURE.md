# Nitra Chat Architecture

## Purpose

Nitra Chat separates the polished communication UI from the backend services that will eventually power real-time messaging.

The goal is to keep the interface stable while authentication, persistence, presence, notifications, and media storage are connected in phases.

## High-level flow

```text
Next.js application
       │
       ├── Authentication layer
       │      └── Firebase Authentication
       │
       ├── Conversation data
       │      └── Cloud Firestore
       │             ├── users
       │             ├── conversations
       │             └── messages
       │
       └── Media
              └── Storage provider to be selected
```

## Frontend responsibilities

The frontend currently owns:

- Navigation and workspace layout
- Conversation selection and filtering
- Search and command UI
- Message composition
- Reactions and message actions
- GIF/emoji interactions
- Profile and authentication screens
- Responsive desktop/mobile behavior
- Loading, feedback, and contextual interaction states

## Backend responsibilities

The backend migration should provide:

- Authenticated user identity
- Persistent conversations and messages
- Real-time message updates
- Presence and typing state
- Persistent reactions and read state
- Notification delivery
- Secure media metadata and storage

## Data direction

Keep the main model simple:

```text
User
  └── participates in → Conversation
                          └── contains → Message
                                           ├── reactions
                                           ├── reply reference
                                           └── read state
```

Avoid storing UI-only state in shared backend documents unless it must persist across devices.

## Migration order

1. Firebase Authentication
2. User profiles
3. Conversations
4. Real-time messages
5. Reactions, replies, and unread state
6. Presence and typing
7. Notifications
8. Media storage
9. Offline/error hardening
10. Production security rules

## Design constraint

Backend work should not force unnecessary redesigns. New data capabilities should plug into the existing workspace and preserve the current interaction hierarchy wherever possible.
