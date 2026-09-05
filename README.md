# Nitra Chat

A premium, futuristic real-time communication workspace built from scratch with Next.js, TypeScript, Tailwind CSS, Motion, and Lucide.

## Current phase

**Phase 3 — Authentication & Nitra identity frontend**

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
- Premium login screen with animated glass/depth treatment
- Registration flow for display name, email, phone number, password, and confirmation
- Frontend validation for email, phone, password, and required fields
- Automatic Nitra ID generation such as `@nityansh_4821`
- Local demo account/session persistence with `localStorage`
- Login flow that restores the saved demo identity
- Personalized workspace identity, avatar initials, and Nitra ID
- Sign-out interaction
- Clear frontend-only messaging so real authentication is not confused with production security
- Responsive authentication layout for desktop and mobile

## Run locally

```bash
npm install
npm run dev
```

Then open the local Next.js development server shown in your terminal.

## Roadmap

1. Frontend foundation — complete
2. Interactive workspace — complete
3. Authentication & Nitra identity frontend — **complete**
4. Database-backed users, profiles, conversations, and messages
5. REST API layer
6. WebSocket real-time messaging
7. Presence, typing, reactions, and message actions — UI prototype complete; backend integration later
8. Attachments and media
9. Offline/error/loading states
10. Production polish and deployment

> Mock/local state is intentional through the frontend prototyping phases. Phase 3 does **not** send real emails/SMS or provide secure authentication. The local identity layer will be replaced by real auth, database, REST, and WebSocket services in the backend phases.
