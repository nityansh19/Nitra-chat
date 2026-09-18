# Nitra Chat State Model

Nitra should keep state ownership predictable so chat interactions remain easy to debug.

## State categories

### Remote state
Conversation records, messages, user data, and shared workspace data belong to the backend data layer. Components should consume normalized data rather than duplicate it.

### Session state
Authentication state, active user identity, and connection readiness should have one authoritative source.

### UI state
Open panels, selected tabs, draft text, menus, and temporary interaction state should stay close to the component that owns the interaction.

## Rules

- Do not store the same value in multiple state owners without a synchronization reason.
- Derived values should be calculated from source state instead of copied.
- Message sending should expose pending, success, and failure states.
- A failed remote write must not leave the interface pretending the action succeeded.
- Reset temporary UI state when its parent conversation or user changes.

## Debugging order

When a screen looks stale, check session identity, remote subscription/data fetch, derived selectors, then local component state.
