# Login fix notes for the site owner

The sign-in flow is a **Supabase magic link (OTP)**: the visitor enters an email, Supabase
sends a one-time link, and opening that link creates a Supabase session in the browser that
opened it. The app then attaches that session's access token to every `/api/trpc` call.

Production logs showed `/api/trpc/auth.me` always returning `200` with a `null` user and only
`"[Auth] Missing session cookie"` warnings — meaning **no browser ever completed the email-link
step**, not a server-side token verification failure. Code-side robustness has been added
(return-visit feedback, URL cleanup, friendly failure copy, resend actions, rate-limit
handling); the remaining checks below live in the **Supabase and Vercel dashboards** and
cannot be fixed from code.

## 1. Supabase dashboard → Authentication → URL Configuration

This is the most likely root cause. If the email link's redirect target is not on the
allow-list, Supabase refuses the redirect and the browser lands on an error page instead of
your site.

- **Site URL** should be `https://creatorhubplus.vercel.app`.
- **Redirect URLs** must include, at minimum:
  - `https://creatorhubplus.vercel.app` (production)
  - `https://creatorhubplus-git-main-wmdigitalos.vercel.app` (the main preview deployment)
  - any other preview domains you regularly open email links from
- The client requests `emailRedirectTo: window.location.origin`, so every domain users
  actually click links from needs its own entry on this list.

## 2. Understand the PKCE "same browser" rule (not a bug)

The project uses the default **PKCE flow** (`supabase-js` 2.112.4, `detectSessionInUrl: true`).
A random *code verifier* is stored **only in the browser that requested the email**. The link
is bound to that browser:

- Opening the link in a **different browser** (e.g. requested in Chrome, opened in Edge), a
  **different device**, or a **mail-client in-app browser** that hands the URL to another
  browser will always fail with a verifier mismatch. This cannot be fixed in code.
- Advise users to open the link in the same browser they signed in from. The sign-in dialog
  now says this explicitly, and a failed return visit shows:
  *"Your sign-in link has expired or was opened in a different browser. Request a new link
  below."* with a **Send a new link** button that reopens the sign-in dialog.
- If more robustness is wanted later, switch the email template to the **magic-link
  one-tap-confirm** (`{{ .Token }}` / `/auth/verify?token_hash=...`) flow, which is not
  verifier-bound — this is a deliberate follow-up decision, not part of this fix.

## 3. Vercel Deployment Protection swallows magic-link returns

Preview deployments are protected by default. A protected preview URL first shows the
**Vercel login wall**, so the `?code=...` redirect never reaches the app and the PKCE exchange
fails.

- For any preview domain you intend to test sign-ins on, disable **Deployment Protection**
  (Project → Settings → Deployment Protection → allow that domain / disable "Vercel
  Authentication" for previews).
- When in doubt, test sign-in on the **production domain**, which is not protected.

## 4. Email deliverability and rate limits

Supabase's **built-in SMTP** is heavily rate-limited (roughly 2 emails/hour by default) and
often lands in spam.

- If the email never arrives: check **spam/junk**, then check Supabase → Authentication →
  **Emails** logs for rate-limit errors. The dialog now surfaces
  `over_email_send_rate_limit` with a visible resend countdown.
- Long term: configure **custom SMTP** (Authentication → Providers → Email / SMTP settings)
  with a domain that has SPF/DKIM set up, then customise the email templates.
- Confirm **Email provider** is enabled and **"Confirm email"** behaves as expected
  (`mailer_autoconfirm` should stay **false** for OTP sign-in).

## 5. Server-side environment variables (Vercel)

Token verification on the server needs both variables in **Project → Settings →
Environment Variables** (Production, Preview, Development):

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only secret — never expose to the browser)

The API now logs their boolean presence once at cold start:

```
[Auth Config] SUPABASE_URL configured: true; SUPABASE_SERVICE_ROLE_KEY configured: true
```

If either flag is `false`, `auth.me` can only ever return `null` — fix the env vars first.
Note the client-side build separately needs `VITE_SUPABASE_URL` and
`VITE_SUPABASE_PUBLISHABLE_KEY`.

## 6. Quick verification checklist

1. From the production domain, request a link for a real inbox.
2. The email arrives (check spam if not) **in the same browser** → click it.
3. You should land back on the site, see *"You're signed in."*, and the address bar should no
   longer contain `?code=...`.
4. `auth.me` should return the user; the Personal centre / Workspace open without a sign-in
   prompt.
5. Repeat with a link opened in a *different* browser: you should see the friendly failure
   toast with a working **Send a new link** button.
