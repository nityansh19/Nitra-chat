# Nitra Chat

A premium, futuristic real-time communication workspace built from scratch with Next.js, TypeScript, Tailwind CSS, Motion, and Lucide.

## Current phase

**Phase 6 — Backend server & REST API layer**

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

### Phase 5 additions
- MongoDB connection layer with connection caching
- Database-backed `User`, `Conversation`, and `Message` models
- Secure password hashing with bcrypt
- Database-backed user discovery
- `/connections` discovery workspace
- Profile data model and customization foundation

### Phase 6 additions — backend server
- JWT-based authenticated sessions in an HTTP-only cookie
- Registration now creates a session automatically
- `POST /api/auth/login` for email/phone authentication
- `POST /api/auth/logout` for session termination
- `GET /api/auth/me` for the current authenticated user
- `GET/PATCH /api/users/me` for authenticated profile retrieval and updates
- Profile picture persistence through the profile API
- Privacy settings persistence through the profile API
- Authenticated user search; the current user is excluded from results
- `GET /api/conversations` for the user's conversation list
- `POST /api/conversations` to create/find a direct conversation by Nitra ID
- `GET /api/conversations/:conversationId/messages` for message history
- `POST /api/conversations/:conversationId/messages` to send messages
- Reply-to-message support in the message API
- `PATCH/DELETE /api/conversations/:conversationId/messages/:messageId` for owned-message editing/deletion
- Conversation participant authorization checks
- Message ownership authorization checks
- MongoDB indexes for conversation/message queries

## Run locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and set:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret_at_least_32_characters
```

Restart the dev server after changing environment variables.

## REST API

### Authentication
- `POST /api/auth/login` — authenticate with email or phone + password.
- `POST /api/auth/logout` — clear the HTTP-only session cookie.
- `GET /api/auth/me` — return the current authenticated user.

### Profile
- `GET /api/users/me` — load the authenticated user's profile.
- `PATCH /api/users/me` — update name, bio, status, avatar, and privacy settings.

### Network
- `GET /api/users/search?q=` — authenticated Nitra user discovery.

### Conversations
- `GET /api/conversations` — list conversations for the authenticated user.
- `POST /api/conversations` — create/find a direct conversation using a Nitra ID.

### Messages
- `GET /api/conversations/:conversationId/messages` — load message history.
- `POST /api/conversations/:conversationId/messages` — send a message.
- `PATCH /api/conversations/:conversationId/messages/:messageId` — edit/delete an owned message.
- `DELETE /api/conversations/:conversationId/messages/:messageId` — soft-delete an owned message.

## Roadmap

1. Frontend foundation — complete
2. Interactive workspace — complete
3. Authentication & Nitra identity frontend — complete
4. Profiles & Nitra identity workspace — complete
5. Database foundation, Nitra network & profiles — complete
6. Backend server & REST API layer — **complete**
7. WebSocket real-time messaging — next
8. Presence, typing, reactions, and message actions — backend integration
9. Attachments and media
10. Offline/error/loading states
11. Production polish and deployment

> Phase 6 establishes the authenticated server/API layer. The frontend still contains prototype/local state in some areas and will be migrated to these APIs as the real-time architecture is built. WebSockets are intentionally reserved for the next phase.
