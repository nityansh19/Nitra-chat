# Nitra Chat

A premium, futuristic communication workspace built with Next.js, TypeScript, Tailwind CSS, Motion, and Lucide. The product direction is intentionally closer to a focused communication workspace than a generic messaging clone.

## Current status

**Frontend experience — polished / ready for backend migration**

### Frontend foundation
- Premium dark-first visual system with restrained glass depth
- Three-layer desktop workspace: navigation rail, conversation list, active chat, optional context panel
- Responsive mobile conversation drawer and adaptive layouts
- Motion-based transitions for messages, overlays, panels, and feedback
- Reduced-motion support and keyboard-focus states
- Premium login / registration visual experience
- Dedicated profile workspace

### Messaging experience
- Conversation switching
- Search conversations and message text
- Command/search overlay with `Cmd/Ctrl + K`
- New conversation flow
- Empty, filtered, and contextual states
- Unread badges and read-state visuals
- Message hover actions
- Quick reactions and reaction pills
- Save message interaction
- Delete own-message interaction
- Pin / mute / archive conversation controls
- Copy Nitra ID interaction
- Context/details panel with message and saved counts
- Auto-scroll to latest messages
- Simulated typing/reply feedback for frontend prototyping

### Expressive communication
- Dedicated emoji picker with quick emoji grid
- GIF picker section with curated animated-style reaction cards
- GIF search/filter UI
- Emoji insertion into the composer
- GIF reaction sending flow
- Attachment affordance
- Voice-note affordance and recording preview state
- Call and video-call affordances
- Toast feedback for interactive actions

### UX polish
- Layered glass surfaces
- Soft ambient background lighting
- Gradient typography
- Hover elevation and micro-interactions
- Consistent icon buttons with labels/tooltips
- Empty states with clear next actions
- Keyboard shortcut modal
- Search overlay
- Mobile-first interaction adjustments
- Scrollbar and selection polish
- Noise texture for subtle depth

## Backend direction

The project has a Firebase foundation and a Firestore database has been created for the Nitra Chat project. The remaining migration is intentionally separated from the UI work so the polished frontend can be connected to real services without destabilizing the design.

Planned production architecture:

```text
Next.js UI
   │
   ├── Firebase Authentication
   │
   ├── Cloud Firestore
   │      ├── users
   │      ├── conversations
   │      └── messages subcollections
   │
   └── Media provider / storage solution
```

> Cloud Storage is not enabled on the current Firebase Spark setup. The frontend keeps attachment/profile-media controls as UI affordances until a storage provider is selected.

## Local development

```bash
npm install
npm run dev
```

Create `.env.local` from `.env.example` and add the Firebase Web App configuration for the Nitra Chat project.

Never commit `.env.local` or private credentials.

## Roadmap

1. Frontend foundation — complete
2. Interactive workspace — complete
3. Authentication & Nitra identity frontend — complete
4. Profiles & Nitra identity workspace — complete
5. Database foundation — complete
6. REST/API foundation — complete as legacy migration layer
7. **Frontend visual completion — complete**
8. Firebase Authentication migration — next
9. Firestore users, conversations and realtime messages
10. Reactions, replies, unread state and message actions with backend persistence
11. Presence / typing / notifications
12. Media and attachment storage provider
13. Offline, loading and error states
14. Production security rules and deployment polish

## Tech stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Motion
- Lucide React
- Firebase SDK
- Firestore

## Project

Built from scratch as Nitra Chat — a serious full-stack communication project with a premium product-focused UI and a backend architecture designed to evolve in phases.
