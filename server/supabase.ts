import { createClient, type User as SupabaseAuthUser } from "@supabase/supabase-js";
import type { User } from "../drizzle/schema";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

function mapUser(row: Record<string, unknown>): User {
  return {
    id: Number(row.id),
    openId: String(row.openId ?? ""),
    name: (row.name as string | null) ?? null,
    email: (row.email as string | null) ?? null,
    loginMethod: (row.loginMethod as string | null) ?? null,
    role: (row.role as User["role"]) ?? "user",
    createdAt: new Date(String(row.createdAt)),
    updatedAt: new Date(String(row.updatedAt)),
    lastSignedIn: new Date(String(row.lastSignedIn)),
  };
}

export async function verifySupabaseAccessToken(accessToken: string) {
  if (!supabaseAdmin) throw new Error("Supabase server credentials are not configured");
  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (error || !data.user) throw new Error("Invalid Supabase access token");
  return data.user;
}

export async function getCreatorHubUser(authUser: SupabaseAuthUser): Promise<User | null> {
  if (!supabaseAdmin) return null;
  const byAuth = await supabaseAdmin.from("users").select("*").eq("authUserId", authUser.id).maybeSingle();
  if (byAuth.error) throw byAuth.error;
  if (byAuth.data) return mapUser(byAuth.data);

  if (!authUser.email) return null;
  const byEmail = await supabaseAdmin.from("users").select("*").eq("email", authUser.email).maybeSingle();
  if (byEmail.error) throw byEmail.error;
  if (!byEmail.data) return null;

  const linked = await supabaseAdmin.from("users").update({ authUserId: authUser.id, loginMethod: "supabase_magic_link", lastSignedIn: new Date().toISOString() }).eq("id", byEmail.data.id).select("*").single();
  if (linked.error) throw linked.error;
  return mapUser(linked.data);
}
