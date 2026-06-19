# Firestore Security Specification

This specification documents the rigorous Attribute-Based Access Control (ABAC) and Zero-Trust constraints applied to the "Mala Catcher" Firestore collections.

## 1. Data Invariants
1. A user profile document under `/users/{userId}` can only be read, created, or updated by the authenticated user whose `request.auth.uid == userId`.
2. A daily stats entry under `/users/{userId}/dailyStats/{dateStr}` can only be read, created, or updated by the owner of the parent user profile.
3. Every user's record must include a verified user email validation if enabled.
4. Input strings (like `name`) must be size-capped to prevent resource abuse.

## 2. The "Dirty Dozen" Threat Payloads
To secure our data, we explicitly design rules to reject the following 12 malicious payloads:
1. **Unauthenticated Profile Read**: Anonymous/un-signed-in user attempting to get `/users/seeker123`.
2. **Identity Spoofing on Create**: Authenticated user `userA` attempting to write a profile document `/users/userB` with `uid = "userB"`.
3. **Ghost Field Write**: Authenticated user trying to append random keys like `isAdmin: true` or `cheat: true` to `/users/userA`.
4. **Incorrect ID Injection**: Writing a 1.5KB string containing junk characters as the `{userId}`.
5. **Orphaned Stats Write**: A user writing directly to another user's daily stats path (`/users/victimId/dailyStats/2026-06-19`).
6. **Sub-collection Hijacking**: Authenticated user trying to modify `/users/userA/dailyStats` elements that do not match the owner.
7. **Negative Values**: Writing user profile document with negative `-5` target counts.
8. **Invalid Types**: Setting boolean variable `diaryChauvihar` to a large string payload or a number.
9. **Timestamp Spoofing**: Attempting to set client-side timestamp as `updatedAt` instead of `request.time`.
10. **Email Verification Bypass**: Writing data when `request.auth.token.email_verified` is not true (if email auth is used).
11. **Huge Name Payload Denial of Wallet**: Writing a 1MB string into the `name` field.
12. **Blanket Query Read**: Doing a blanket fetch on the entire `/users` collection without proper filters.

## 3. Test Runner Verifications
Each of the payloads above returns `PERMISSION_DENIED` during actual rule evaluation.
