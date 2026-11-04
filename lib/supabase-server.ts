import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
export function publicDatabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (url, init) => fetch(url, { ...init, cache: "no-store" }) } });
}
export async function serverDatabase() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { cookies: { getAll: () => store.getAll(), setAll(values) { try { values.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* Server Component: refresh is persisted by the next authenticated request. */ } } } });
}
export async function requireAdmin() {
  const db = await serverDatabase();
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) return false;
  const { data } = await db.from("admin_members").select("email").eq("email", user.email?.toLowerCase() ?? "").maybeSingle();
  return !!data;
}
export async function bookingDatabase<T>(operation: string, payload: unknown = {}): Promise<T> {
  const token = process.env.BLACKLINE_BOOKING_TOKEN;
  if (!token) throw new Error("Booking database is not configured.");
  const { data, error } = await publicDatabase().rpc("blackline_server_request", { token, operation, payload });
  if (error) throw new Error(error.message);
  return data as T;
}
