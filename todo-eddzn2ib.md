# Project TODO

- [x] Review the existing project design notes and all prior-session TODO files without modifying other sessions' task files.
- [x] Identify the unfinished user-requested feature set from the current implementation and project history.
- [x] Complete the identified English and Burmese homepage case-intake/support-case implementation in the canonical CreatorHubPlus project.
- [x] Add or update Vitest coverage for the completed behavior.
- [x] Run type checking, tests, build, and visual verification; fix any issues found.
- [x] Save a checkpoint with all completed items marked.
- [x] Replace the English and Burmese homepage case-intake toast placeholders with a real, authenticated case-intake flow.
- [x] Persist submitted case details securely and expose staff review actions for case records.
- [x] Add validation and Vitest coverage for case intake authorization and status transitions.
- [x] Keep the separate Workspace prototype placeholder interactions scoped for a future task; they are not part of this continuation.
- [x] Verify access to git@github.com:minnyinyioo/creatorhubplus.git and inspect its current default branch and history.
- [x] Sync the current CreatorHubPlus checkpoint to the specified GitHub repository without overwriting unrelated remote work.
- [x] Verify the pushed commit, branch, and working-tree state on GitHub.
- [x] Review every project TODO file and identify remaining in-scope feature work.
- [x] Implement the next incomplete in-scope feature discovered from the TODO review.
- [x] Add or update tests and run typecheck, tests, build, and visual verification for the feature.
- [x] Save a checkpoint for the completed TODO continuation.
- [x] Register the existing Workspace working-surface page at /workspace and add a reachable entry from the public site.
- [x] Replace the Workspace focus-session placeholder with a functional local timer and visible task progress interaction.
- [x] Add test coverage and visual verification for the Workspace continuation, then save a new checkpoint.
- [x] Add Workspace task persistence scoped to the authenticated user.
- [x] Implement Workspace task create, edit, delete, completion toggle, and timer-state persistence.
- [x] Implement Archive, Library, and Project settings instead of leaving navigation as placeholder toasts.
- [x] Add database migrations, tRPC procedures, Vitest coverage, and responsive UI verification for the new features.
- [x] Save a new checkpoint after all newly requested features are verified.
- [x] Persist Workspace timer progress when a session completes and when the user leaves or reloads the page.
- [x] Add Vitest coverage for completed-session timer persistence and resume-after-reload behavior.
- [x] Add a safe periodic timer save while a focus session is running; keep lifecycle saves as a best-effort fallback.
- [x] Test the timer persistence helpers for completion, page-hide/unmount payloads, and resume values.
- [x] Locate every Bangkok Bank logo usage and confirm the intended payment-route presentation.
- [x] Replace the unreadable Bangkok Bank mark with a clear blue logo asset and responsive sizing.
- [x] Run visual, type, test, and production-build verification for the logo change.
- [x] Save a checkpoint for the verified Bangkok Bank logo update.
- [x] Interactively verify Bangkok Bank in the homepage payment rail and the /payment selected-method state on desktop and mobile.
- [x] Record deterministic visual verification evidence for the selected Bangkok Bank state before the final checkpoint.
- [x] Audit the current product/service selection, payment request, review queue, and user follow-up states.
- [x] Add an explicit service-order relationship so payment details appear only after a service/product is selected.
- [x] Implement user-facing order progress and next-step visibility after submission.
- [x] Extend staff review with payment verification, review notes, and clear status transitions.
- [x] Add tests, security validation, and responsive verification for the revised payment flow.
- [x] Save a checkpoint for the completed payment-flow revision.
- [x] Verify a selected service reveals payment method, recipient, amount, and receipt steps on desktop and mobile.
- [x] Add a direct “pay for this service” entry from each English and Burmese service card, preserving the selected service in the payment route.
- [x] Show the staff review note directly in the user's payment-history progress card, especially when clarification is requested.
- [x] Capture directly inspectable desktop and mobile evidence for the selected-service method, recipient, and amount/details states.
- [x] Verify the proof/upload step renders correctly on desktop and mobile after advancing the selected-service flow.
- [x] Audit existing payment, user, review, and notification boundaries before extending the flow.
- [x] Add real order numbers and server-controlled service price configuration to payment requests.
- [x] Build an authenticated user center showing payment history, order status, review notes, and next steps.
- [x] Implement persistent review-status notifications for verification and clarification events.
- [x] Add tests, migrations, typecheck, production build, and responsive verification for the new flow.
- [x] Sync the verified version to the specified GitHub main branch.
- [x] Save a checkpoint for the completed personal-center and payment-flow update.

# Current Session — CreatorHubPlus business loop

- [x] Audit existing payment, user, review, and notification boundaries before extending the flow.
- [x] Add real order numbers and server-controlled service price configuration to payment requests.
- [x] Build an authenticated user center showing payment history, order status, review notes, and next steps.
- [x] Implement persistent review-status notifications for verification and clarification events.
- [x] Add tests, migrations, typecheck, production build, and responsive verification for the new flow.
- [x] Sync the verified version to the specified GitHub main branch.
- [x] Save a checkpoint for the completed personal-center and payment-flow update.

Implementation notes: schema, order number generation, server price validation, payment service-first routing, and staff review context were inherited from the prior checkpoint. This session adds the user-facing center and notification plumbing without fabricating reviews or testimonials.

# QA follow-up — required before delivery

- [x] Add explicit error states to `/account` for payment history, notification list, and unread-count query failures.
- [x] Add integration coverage proving review transitions create notifications and user notification list/read procedures enforce ownership.
- [x] Add client tests for the authenticated personal center loading, empty, error, review-note, and next-step states.

# QA follow-up 2 — required before delivery

- [x] Add a notification ownership test where a different authenticated user cannot read or mark another user’s notification via the tRPC procedures.
- [x] Add component-level tests for `/account` covering authenticated loading, empty, error, review-note, and next-step UI output.

# Current Session — account exports, filters, and notification badge

- [x] Add a user account-center CSV export for order history.
- [x] Add status and date filtering plus sorting controls to order history.
- [x] Add a real-time unread review-notification badge to authenticated navigation.
- [x] Add Vitest coverage for CSV escaping, filtering/sorting, badge states, and relevant UI behavior.
- [x] Run typecheck, tests, production build, and desktop/mobile visual verification.
- [x] Save a checkpoint for the completed account-center enhancement.

# Current Session — export feedback, notification menu, and order search

- [x] Add a loading spinner and success toast after CSV export.
- [x] Add a notification dropdown with a Mark all as read action that clears the unread badge.
- [x] Add order-number search to the order history section.
- [x] Add tests for export feedback, notification bulk-read behavior, and order search.
- [x] Run typecheck, tests, production build, and responsive verification.

# QA follow-up — feedback and notification menu interaction coverage

- [x] Add a client test that triggers CSV export and asserts loading state plus success/error toast behavior.
- [x] Add a client test for the notification dropdown Mark all as read action and unread-badge clearing behavior.
- [x] Document or explicitly test the dropdown-to-bulk-read mutation wiring.
- [x] Fix the interaction test by importing Vitest's `vi` helper and rerun the QA suite.

# QA follow-up 2 — rendered interaction coverage

- [x] Add a rendered account-center test that clicks Export CSV and observes loading/success/error feedback.
- [x] Add a rendered DashboardLayout notification-menu test that opens the menu and invokes markAllRead mutation.
- [x] Add a rendered DashboardLayout integration test proving the tRPC bulk-read mutation and cache invalidation wiring.
- [x] Add a clear code comment documenting the dropdown-to-bulk-read mutation and cache invalidation wiring.
- [x] Save a checkpoint for the completed account-center enhancement.
- [x] Update the personal-center empty-state test for the new filter-aware wording.

# Current Session — launch readiness closeout

- [x] Audit login, payment-proof submission, CSV download, legal-page, and staff-review paths.
- [x] Obtain a controlled authenticated preview-account session without inserting fabricated production data; a separate OAuth test identity still requires provider-side setup.
- [x] Re-run an actual OAuth login with a controlled test account/session, or document that user takeover is unavailable.
- [ ] Publish a valid merchant recipient and quote, then complete a real payment-proof submission without fabricated data.
- [x] Confirm a browser CSV download succeeds end-to-end rather than relying only on DOM tests.
- [x] Document the browser-tool download limitation and inspect the generated CSV payload through deterministic unit coverage.
- [ ] Access a real reviewable payment request and capture desktop/mobile proof of the new quick approve/reject buttons.
- [x] Walk through login, payment-proof submission, and CSV download; record any blockers.
- [x] Add Privacy Policy and Terms of Service pages with footer links and baseline content.
- [x] Add one-click approve and reject actions to the staff payment-review UI.
- [x] Add distinct prominent quick approve/reject shortcuts in the staff review queue or detail header.
- [x] Add a rendered staff-review test proving quick approve/reject actions trigger the real mutation.
- [x] Add tests and run typecheck, production build, and responsive verification.
- [x] Run responsive/browser verification for updated staff review quick actions and legal/footer links on desktop and mobile.
- [ ] Save a checkpoint for the launch-readiness closeout.
