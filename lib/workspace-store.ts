"use client";
import { supabaseBrowser } from "./supabase-browser";
type Stored = { id: string; data: unknown; updated_at: string };
const cache = new Map<string, Stored[]>();
export async function loadRows<T>(table: string): Promise<T[]> {
  const { data, error } = await supabaseBrowser().from(table).select("id,data,updated_at").order("id");
  if (error) throw new Error(error.message);
  cache.set(table, (data ?? []) as Stored[]); return ((data ?? []) as Stored[]).map(row => row.data as T);
}
export function cachedRows<T>(table: string): T[] { return (cache.get(table) ?? []).map(row => row.data as T); }
export async function saveRow(table: string, id: string, data: unknown) {
  const existing = cache.get(table)?.find(row => row.id === id);
  const query = existing ? supabaseBrowser().from(table).update({ data }).eq("id", id).eq("updated_at", existing.updated_at) : supabaseBrowser().from(table).insert({ id, data });
  const result = await query.select("id,data,updated_at").single();
  if (result.error) throw new Error(result.error.code === "PGRST116" ? "This item changed in another session. Reload before saving again." : result.error.message);
  cache.set(table, [...(cache.get(table) ?? []).filter(row => row.id !== id), result.data]);
  window.dispatchEvent(new Event("blackline-database-updated"));
}
export async function removeRow(table: string, id: string) {
  const existing = cache.get(table)?.find(row => row.id === id);
  let query = supabaseBrowser().from(table).delete().eq("id", id);
  if (existing) query = query.eq("updated_at", existing.updated_at);
  const { data, error } = await query.select("id");
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error("This item changed or was removed. Reload before trying again.");
  cache.set(table, (cache.get(table) ?? []).filter(row => row.id !== id));
}
export async function saveRows<T extends { id: string }>(table: string, next: T[]) {
  const previous = [...(cache.get(table) ?? [])];
  for (const item of next) { const old = previous.find(row => row.id === item.id); if (!old || JSON.stringify(old.data) !== JSON.stringify(item)) await saveRow(table, item.id, item); }
  for (const old of previous) if (!next.some(item => item.id === old.id)) await removeRow(table, old.id);
}
export async function loadSetting<T>(id: string, fallback: T): Promise<T> {
  const { data, error } = await supabaseBrowser().from("site_settings").select("id,data,updated_at").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (data) cache.set("site_settings", [...(cache.get("site_settings") ?? []).filter(row => row.id !== id), data]);
  return (data?.data as T) ?? fallback;
}
export async function uploadPhoto(input: File | string): Promise<string> {
  if (typeof input === "string" && !input.startsWith("data:")) {
    if (!input.startsWith("/") && !/^https:\/\//.test(input)) throw new Error("Use a local image path or HTTPS image URL.");
    return input;
  }
  const blob = typeof input === "string" ? await (await fetch(input)).blob() : input;
  const types: Record<string,string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif", "image/gif": "gif" };
  if (!types[blob.type] || blob.size > 10 * 1024 * 1024) throw new Error("Choose an image under 10 MB.");
  const path = `${crypto.randomUUID()}.${types[blob.type]}`;
  const { error } = await supabaseBrowser().storage.from("website-media").upload(path, blob, { contentType: blob.type, upsert: false });
  if (error) throw new Error(error.message);
  return supabaseBrowser().storage.from("website-media").getPublicUrl(path).data.publicUrl;
}
