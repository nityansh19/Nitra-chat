# Nitra Chat

A premium, futuristic real-time communication workspace built from scratch with Next.js, TypeScript, Tailwind CSS, Motion, and Lucide.

## Current phase

**Phase 5 — Database foundation & visible Nitra network**

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
- Sign-out from the profile workspace
- Responsive profile experience

### Phase 5 additions
- MongoDB connection layer with connection caching for Next.js
- Database-backed `User`, `Conversation`, and `Message` models
- User identity fields for Nitra ID, profile data, privacy settings, and secure password hashes
- Conversation participant relationships and last-message reference
- Message replies, reactions, edit/delete timestamps, and conversation indexes
- `GET /api/health` database connectivity check
- `POST /api/users/register` database-backed account creation
- Password hashing with bcrypt before persistence
- `GET /api/users/search?q=` database-backed Nitra user search
- New `/connections` workspace for a visible database-backed discovery flow
- Search by Nitra ID, display name, email, or phone
- User profile preview and database status surface

## Run locally

```bash
npm install
npm run dev
```

For Phase 5 database features, copy `.env.example` to `.env.local` and set `MONGODB_URI` to your MongoDB connection string before using the API routes.

## Phase 5 API

- `GET /api/health` — verifies that Nitra Chat can connect to MongoDB.
- `POST /api/users/register` — creates a database user from `name`, `email`, `phone`, and `password`.
- `GET /api/users/search?q=` — searches persisted users by Nitra ID, name, email, or phone.

The visible Phase 5 workflow is available at `/connections`.

## Roadmap

1. Frontend foundation — complete
2. Interactive workspace — complete
3. Authentication & Nitra identity frontend — complete
4. Profiles & Nitra identity workspace — complete
5. Database foundation & visible Nitra network — **complete**
6. REST API layer — next
7. WebSocket real-time messaging
8. Presence, typing, reactions, and message actions — UI prototype complete; backend integration later
9. Attachments and media
10. Offline/error/loading states
11. Production polish and deployment

> Phase 3/4 local auth remains available for the frontend prototype. Phase 5 introduces the database foundation and visible database-backed search, but it does **not** yet provide production session management, login API, authorization, or real-time synchronization. Those are intentionally separated into the next backend phases.
