import { supabaseAdmin } from "./supabase";

const BUCKET = "creatorhubplus-private";

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

function requireStorage() {
  if (!supabaseAdmin) throw new Error("Supabase Storage is not configured");
  return supabaseAdmin.storage.from(BUCKET);
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));
  const { error } = await requireStorage().upload(key, data, {
    contentType,
    upsert: false,
    cacheControl: "3600",
  });
  if (error) throw new Error(`Supabase Storage upload failed: ${error.message}`);
  return { key, url: `/manus-storage/${key}` };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: `/manus-storage/${key}` };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const key = normalizeKey(relKey);
  const { data, error } = await requireStorage().createSignedUrl(key, 60 * 15);
  if (error || !data?.signedUrl) {
    throw new Error(`Supabase Storage signed URL failed: ${error?.message ?? "empty URL"}`);
  }
  return data.signedUrl;
}
