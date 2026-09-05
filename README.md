# Nitra Chat

A premium, futuristic real-time communication workspace built from scratch with Next.js, TypeScript, Tailwind CSS, Motion, and Lucide.

## Current phase

**Phase 0 — Frontend foundation**

- Premium dark-first communication workspace
- Three-layer desktop layout: navigation rail, conversations, active chat
- Optional conversation details panel
- Responsive mobile conversation drawer
- Animated message entrance and typing state
- Functional local message composer
- Conversation search/filtering
- Message read-state styling
- Presence indicators
- Responsive UI designed to transform rather than simply shrink

## Run locally

```bash
npm install
npm run dev
```

Then open the local Next.js development server shown in your terminal.

## Roadmap

1. Frontend foundation — current
2. Component architecture + command palette
3. Authentication and user profiles
4. Database-backed conversations and messages
5. REST API layer
6. WebSocket real-time messaging
7. Presence, typing, reactions, message actions
8. Attachments and media
9. Offline/error/loading states
10. Production polish and deployment

> Mock data is intentional in the current phase. The UI/data boundary will be kept clean so the mock layer can be replaced by real REST + WebSocket services.
