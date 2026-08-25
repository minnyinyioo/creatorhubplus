# Project TODO

- [x] Add an authenticated staff review dashboard for pending submissions.
- [x] Add server-side admin authorization for listing and reviewing submissions.
- [x] Add review actions for verify, reject, and request clarification with staff notes.
- [x] Persist review status, reviewer identity, timestamps, and clarification notes.
- [x] Replace temporary approved-recipient wording with configurable verified merchant account instructions.
- [x] Add optional QR asset metadata and a staff-facing recipient configuration surface.
- [x] Harden receipt uploads with protected multipart handling, size/type validation, and S3-backed storage.
- [x] Update the applicant upload UI to use multipart upload instead of base64 JSON.
- [x] Add Vitest coverage for authorization, review state transitions, and multipart validation helpers.
- [x] Run typecheck, tests, and visual verification for desktop and mobile layouts.
- [x] Save a checkpoint containing all completed changes.

## Change history

- [x] Initial project review for this task.
- [x] Restrict public merchant-recipient lookup to active published rows only.
- [x] Add explicit loading and error states for applicant-side merchant-recipient lookup.
- [x] Accept permanent internal storage paths as well as HTTPS URLs for optional QR assets.
