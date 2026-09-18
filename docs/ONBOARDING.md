# Nitra Chat Onboarding

This guide gives new contributors the shortest path from clone to productive work.

## Start here

1. Read the root README for product scope.
2. Read `ARCHITECTURE.md` for the system layout.
3. Copy `.env.example` to a local environment file and provide only the values required for the feature you are testing.
4. Install dependencies and run the development server.
5. Confirm authentication and one basic conversation flow before changing code.

## Before opening a change

- Keep UI behavior consistent with the existing interaction patterns.
- Avoid mixing unrelated refactors with feature work.
- Never commit credentials or production Firebase values.
- Run linting and manually test the affected chat flow.

## Suggested first tasks

Good first contributions include accessibility fixes, empty/loading states, small component cleanup, documentation, and focused bug fixes.

For security-sensitive work, read `docs/SECURITY.md`. For verification guidance, read `docs/TESTING.md`.
