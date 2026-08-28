# CreatorHubPlus Supabase + Vercel Migration Plan

## Scope and safety boundary

This plan replaces the current Manus OAuth, MySQL/Drizzle, Forge object storage, and long-running Express host with **Supabase Auth**, **Supabase Postgres**, **private Supabase Storage buckets**, and **Vercel static hosting plus Node.js Functions**. The public English pages, payment request flow, account centre, staff review, recipient publishing, Workspace, legal pages, Cookie preferences, and all login gates remain in scope. No live records, login flow, or upload route will be removed until the Supabase equivalent has been deployed and tested.

The preferred login is **email magic link or OTP**. It preserves a low-friction experience without asking CreatorHubPlus to collect or store customer passwords. Social login can be enabled later inside Supabase Auth only after the owner confirms each provider and its redirect URLs. Supabase Auth issues JWTs and integrates with Row Level Security (RLS), which will enforce record access at the database layer.[1]

## Current-to-target mapping

| Current dependency | Target implementation | Migration rule |
|---|---|---|
| Manus OAuth user with numeric `users.id` | Supabase `auth.users` plus `public.profiles.id uuid` | Use the Supabase Auth UUID as the canonical user ID. Preserve legacy numeric IDs in a temporary import map only. |
| MySQL/Drizzle tables | Supabase Postgres migrations under `supabase/migrations/` | Convert all `userId` and `reviewedByUserId` columns to `uuid` foreign keys referencing `profiles(id)`. Convert dates to `timestamptz`. |
| Forge-backed receipt and invoice files | Private Supabase Storage buckets `receipts`, `invoices`, and `recipient-qr` | Do not make receipts or invoices public. Generate signed URLs only after server-side ownership or staff authorization checks. |
| Manus `protectedProcedure` / admin procedure | Supabase JWT verification in the Vercel API plus RLS policies | Client-visible reads use RLS. Sensitive write, review, invoice and signed-download actions stay in server functions. |
| Express static serving and SPA fallback | Vite static output plus Vercel rewrites and `api/[...path].ts` | Route `/api/*` to the Vercel Function first; route all remaining paths to the Vite `index.html` SPA entry. |

## Postgres model and authorization

Every business table will use a UUID `user_id` pointing at `public.profiles(id)`. The target tables are `profiles`, `payment_requests`, `payment_service_catalog`, `payment_notifications`, `invoices`, `merchant_recipients`, `support_cases`, `workspace_tasks`, `workspace_library_items`, and `workspace_settings`.

Publicly readable operational data is limited to **active payment service catalog entries** and **active merchant-recipient details required to initiate a payment**. Payment records, cases, notifications, invoices, receipts, Workspace records, and inactive recipient configurations must never be public.

| Resource | Customer permissions | Staff/admin permissions | Server-only action |
|---|---|---|---|
| Profile | Read own profile | Read when needed for review | Change roles |
| Payment request and receipt | Create and read own; cannot verify/reject | Read and update review state | Upload receipt, generate receipt link, issue invoice |
| Support case | Create and read own | Read and update case status | None beyond validation |
| Invoice | Read own metadata; signed download after ownership check | Read for review | Generate PDF and signed download link |
| Merchant recipient | Read active rows needed for payment | Full create/update/publish | Store private QR files |
| Workspace data | Full access to own rows | No default staff access | None |

RLS is enabled on every exposed table. Grants will be revoked from `anon`; `authenticated` will receive only the precise operations it needs. Ownership policies use `(select auth.uid()) = user_id`; staff access relies on an `is_admin()` security-definer helper over the protected `profiles.role` field. Role data must not come from editable `user_metadata`; Supabase documents `app_metadata` as the appropriate JWT location when token-based role checks are needed.[2]

## Private storage rules

Use paths beginning with the authenticated user UUID, for example `receipts/<user-id>/<file-id>.pdf`. RLS on `storage.objects` must permit authenticated users to insert only into their own folder, while downloads are provided by a Vercel Function after an ownership or admin check. Supabase Storage requires explicit policies for uploads, and its service-role key bypasses RLS; it must remain only in Vercel server-side environment variables.[3]

Receipt validation remains unchanged: one file per request; PNG, JPG, WEBP, or PDF only; maximum 10 MB; authentication required before processing. The API will reject passwords, PINs, CVV values, complete payment credentials, or any attempt to bypass verification.

## Data migration procedure

1. Freeze new writes in a brief maintenance window only after the new Supabase path is ready.
2. Export MySQL tables and private object metadata. Do not expose receipt or invoice links during export.
3. Create Supabase Auth users only from consented email identities. Build an encrypted import mapping from legacy numeric IDs to new UUIDs.
4. Import rows with rewritten UUID foreign keys; copy files into private buckets under new owner paths; rewrite storage-key metadata.
5. Reconcile counts and sample relationships for every table, then test an existing user, administrator, receipt upload, invoice link, recipient publication, and Workspace item.
6. Keep the legacy service read-only until the new system has passed production validation and the owner approves retirement.

All schema and policy changes are committed as Supabase SQL migrations. Do not make the remote database schema diverge through ad-hoc dashboard edits once migrations are in use.[4]

## Vercel and GitHub target architecture

The Vite application will build to static assets. A Vercel Node.js Function will host the existing typed API contract behind `/api/*`; a catch-all SPA rewrite will make `/payment`, `/account`, `/staff/review`, `/staff/recipients`, `/workspace`, `/privacy`, and `/terms` work on direct load. Vercel Functions scale to zero and must not rely on in-memory user state or long-running processes.[5]

| Layer | GitHub responsibility | Vercel responsibility | Required secret |
|---|---|---|---|
| Frontend | Source, tests, Vite build | Static output and SPA rewrites | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| API | Versioned Vercel Function source | Execute `/api/*` server routes | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| Database | `supabase/migrations/*.sql` | None directly | `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD` for controlled CI migrations only |
| Object storage | Storage path and policy migrations | Signed URL creation through API | Server service-role key only |

GitHub will run `pnpm check`, `pnpm test`, and `pnpm build` on pull requests. Vercel production deployment follows a merge to the protected default branch; no credential is committed to Git. Vercel preview deployments must use a Supabase project with matching redirect URLs before production is changed.[5]

## Required owner decisions before implementation

1. Confirm **email magic link** as the initial login method, or name each social provider to enable.
2. Provide the Supabase project URL, publishable/anonymous key, and service-role key through secure project secrets; never send them in public text or commit them.
3. Confirm whether there are existing MySQL users, payment records, receipts, invoices, cases, or Workspace entries that need migration, or whether a clean Supabase launch is acceptable.
4. Confirm a Vercel project/account connection and the production domain to register in Supabase Auth redirect URLs.

## References

[1]: https://supabase.com/docs/guides/auth "Supabase Auth"
[2]: https://supabase.com/docs/guides/database/postgres/row-level-security "Supabase Row Level Security"
[3]: https://supabase.com/docs/guides/storage/security/access-control "Supabase Storage Access Control"
[4]: https://supabase.com/docs/guides/deployment/database-migrations "Supabase Database Migrations"
[5]: https://vercel.com/docs/frameworks/frontend/vite "Vite on Vercel"
