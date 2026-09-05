# Nitra Chat

A premium, futuristic real-time communication workspace built from scratch with Next.js, TypeScript, Tailwind CSS, Motion, and Lucide.

## Current phase

**Phase 2 — Interactive workspace**

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
- Message actions menu
- Reply-to-message composer state
- Local reactions
- Delete-your-message interaction
- Emoji picker
- Automatic scroll-to-latest-message
- Simulated reply/typing feedback for realistic prototyping
- Interactive call/video/info/attachment controls with feedback toasts
- Empty search state
- Keyboard-focus accessibility polish
- Reduced-motion support
- Responsive mobile behavior preserved

## Run locally

```bash
npm install
npm run dev
```

Then open the local Next.js development server shown in your terminal.

## Roadmap

1. Frontend foundation — complete
2. Interactive workspace — **complete**
3. Authentication and user profiles
4. Database-backed conversations and messages
5. REST API layer
6. WebSocket real-time messaging
7. Presence, typing, reactions, and message actions — UI prototype complete; backend integration later
8. Attachments and media
9. Offline/error/loading states
10. Production polish and deployment

> Mock/local state is intentional through the frontend prototyping phases. The UI/data boundary will be replaced by real REST + WebSocket services in the backend phases.
