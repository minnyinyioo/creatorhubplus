/**
 * One-off helper: set (or reset) a CreatorHubPlus account password via the
 * Supabase admin API. Run it once per account, then sign in with Password mode.
 *
 * Usage (PowerShell):
 *   $env:SUPABASE_URL="https://<project>.supabase.co"
 *   $env:SUPABASE_SERVICE_ROLE_KEY="<service_role key from Supabase dashboard>"
 *   pnpm tsx scripts/set-password.ts you@example.com "YourNewPassword123!"
 *
 * The key is read from the environment only and is never printed.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.argv[2];
const newPassword = process.argv[3];

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  process.exit(1);
}
if (!email || !newPassword) {
  console.error("Usage: set-password.ts <email> <new-password>");
  process.exit(1);
}
if (newPassword.length < 8) {
  console.error("Password must be at least 8 characters long.");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: users, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (listError) {
  console.error("Failed to list users:", listError.message);
  process.exit(1);
}

const target = users.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
if (!target) {
  console.error(`No Supabase auth user found with email "${email}".`);
  console.error("Hint: the account must sign in once via magic link before it exists in auth.users.");
  process.exit(1);
}

const { error: updateError } = await admin.auth.admin.updateUserById(target.id, { password: newPassword });
if (updateError) {
  console.error("Failed to set password:", updateError.message);
  process.exit(1);
}

console.log(`Password set for ${target.email} (${target.id}). You can now sign in with Password mode.`);