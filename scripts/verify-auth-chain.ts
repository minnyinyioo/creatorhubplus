/**
 * Verify the FULL production auth chain from your local machine.
 *
 * What it does:
 *   1. Sets a fresh temporary password for the account via the admin API
 *      (so a known-good credential always exists, regardless of what the
 *      production env currently holds).
 *   2. Signs in with that password to get a real Supabase access token.
 *   3. Calls the PRODUCTION /api/trpc/auth.me with that token.
 *   4. Reports whether production recognized the user.
 *
 *   - auth.me returns the admin user  -> production env (SUPABASE_URL /
 *     SUPABASE_SERVICE_ROLE_KEY) is CORRECT. Use the printed password to log in.
 *   - auth.me returns null            -> production env values are wrong
 *     (wrong URL / stale key). Fix them in Vercel, Redeploy, re-run.
 *
 * Usage (PowerShell):
 *   $env:SUPABASE_URL="https://kfvenkrmmrmwqlemxesx.supabase.co"
 *   $env:SUPABASE_SERVICE_ROLE_KEY="<full service role key>"
 *   corepack pnpm tsx scripts/verify-auth-chain.ts minnyinyioo616@gmail.com
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.argv[2];

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  process.exit(1);
}
if (!email) {
  console.error("Usage: verify-auth-chain.ts <email>");
  process.exit(1);
}

const PRODUCTION = "https://creatorhubplus.vercel.app";
const tempPassword = `CreatorHub-${Math.random().toString(36).slice(2, 10)}-X9`;

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 1. Locate the auth user and set a fresh temporary password.
const { data: found, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (listError) {
  console.error("Failed to list users:", listError.message);
  process.exit(1);
}
const target = found.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
if (!target) {
  console.error(`No Supabase auth user found for "${email}".`);
  process.exit(1);
}

const { error: updateError } = await admin.auth.admin.updateUserById(target.id, { password: tempPassword });
if (updateError) {
  console.error("Failed to set temporary password:", updateError.message);
  process.exit(1);
}
console.log(`[1/3] Temporary password set for ${target.email} (${target.id})`);

// 2. Sign in with the password to obtain a real access token.
const { data: session, error: signInError } = await admin.auth.signInWithPassword({
  email,
  password: tempPassword,
});
if (signInError) {
  console.error("[2/3] Sign-in failed:", signInError.message);
  console.error(`Temporary password is: ${tempPassword} (use it if Supabase sign-in is fixed)`);
  process.exit(1);
}
console.log("[2/3] Supabase sign-in OK, got access token.");

// 3. Call production auth.me with the token.
const input = encodeURIComponent(JSON.stringify({ "0": { json: null, meta: { values: ["undefined"] } } }));
const url = `${PRODUCTION}/api/trpc/auth.me?batch=1&input=${input}`;
const res = await fetch(url, {
  headers: { Authorization: `Bearer ${session.session?.access_token ?? ""}` },
});
const body = await res.text();

console.log(`[3/3] Production auth.me HTTP ${res.status}: ${body}`);
const parsed = JSON.parse(body);
const user = parsed?.[0]?.result?.data?.json ?? null;

if (user) {
  console.log("\nRESULT: SUCCESS — production recognized the user.");
  console.log(`  id=${user.id} email=${user.email} role=${user.role}`);
  console.log(`\nLog in now at ${PRODUCTION} with:`);
  console.log(`  email: ${email}`);
  console.log(`  password: ${tempPassword}`);
  console.log("Then change the password in Supabase -> Authentication -> Users.");
} else {
  console.log("\nRESULT: FAILURE — production auth.me returned null with a VALID token.");
  console.log("This means the production env values are wrong or the deployment is stale.");
  console.log("1. Vercel -> Environments -> Production: verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY values.");
  console.log("2. Deployments -> latest -> Redeploy.");
  console.log("3. Re-run this script.");
  console.log(`\n(Temporary password remains valid for Supabase sign-in: ${tempPassword})`);
}