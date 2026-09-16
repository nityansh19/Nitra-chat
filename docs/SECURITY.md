# Nitra Chat Security Notes

## Client boundaries

- Never place Firebase admin credentials or private service keys in the client bundle.
- Keep `.env.local` out of source control.
- Treat every client-supplied identifier as untrusted.

## Authentication

- Use Firebase Authentication as the source of signed-in identity.
- Do not trust a user ID sent only in request data.
- Re-check authorization before reading or mutating user-owned resources.

## Firestore

- Deny access by default in security rules.
- Scope conversation and message access to conversation members.
- Validate writable fields and reject unexpected ownership changes.
- Test rules against unauthenticated and unrelated users before production deployment.

## Messaging safety

- Escape or safely render user-generated text.
- Validate attachment metadata before accepting uploads.
- Apply reasonable file-type and size limits when media storage is added.
- Avoid exposing internal errors or configuration values to the UI.

## Release check

Review authentication rules, Firestore rules, environment variables, and dependency alerts before every production release involving backend changes.
