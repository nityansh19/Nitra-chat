# Nitra Chat

A premium, futuristic real-time communication workspace built from scratch with Next.js, TypeScript, Tailwind CSS, Motion, and Lucide.

## Current phase

**Phase 4 — Profiles & Nitra identity workspace**

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
- Clear frontend-only messaging around authentication limitations

### Phase 4 additions
- Dedicated `/profile` identity workspace
- Premium profile header with Nitra ID and live status
- Editable display name, bio, and status
- Nitra ID displayed as a locked identity handle
- Copy-Nitra-ID interaction
- Email and phone identity summary
- Privacy controls UI for profile visibility, activity status, and read receipts
- Phase 4 architecture notes for future backend rules
- Sign-out from the profile workspace
- Responsive profile experience

## Run locally

```bash
npm install
npm run dev
```

Then open the local Next.js development server shown in your terminal. The Phase 4 profile page is available at `/profile` after signing into the frontend demo.

## Roadmap

1. Frontend foundation — complete
2. Interactive workspace — complete
3. Authentication & Nitra identity frontend — complete
4. Profiles & Nitra identity workspace — **complete**
5. Database-backed users, profiles, conversations, and messages
6. REST API layer
7. WebSocket real-time messaging
8. Presence, typing, reactions, and message actions — UI prototype complete; backend integration later
9. Attachments and media
10. Offline/error/loading states
11. Production polish and deployment

> Mock/local state is intentional through the frontend prototyping phases. Phase 3/4 do **not** send real emails/SMS or provide secure authentication. The local identity layer will be replaced by real auth, database, REST, and WebSocket services in the backend phases.
