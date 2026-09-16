# Nitra Chat Testing Guide

## Core flows

Before shipping a change, verify:

- Sign-in and registration screens render correctly.
- Conversation switching works without stale content.
- Search and `Cmd/Ctrl + K` open and close reliably.
- Composer interactions, reactions, saved messages, and message actions still work.
- Mobile drawers, overlays, and context panels do not trap the user.

## Responsive checks

Test at minimum:

- Narrow mobile width
- Tablet-sized layout
- Standard desktop width
- Large desktop width

Check overflow, fixed panels, sticky elements, and long message content.

## Accessibility checks

- All interactive controls are reachable by keyboard.
- Focus is visible.
- Modals and overlays can be dismissed predictably.
- Reduced-motion behavior remains usable.
- Icon-only actions have accessible labels or tooltips.

## Backend migration checks

When replacing prototype state with Firebase data, compare the new behavior against the existing frontend interaction before removing fallback logic. Verify loading, offline, permission-denied, and empty states separately.
