import "server-only";
import { publicDatabase } from "./supabase-server";

export async function checkoutDiscount(input: unknown, subtotal: number) {
  if (input === undefined || input === "") return undefined;
  const code = typeof input === "string" ? input.trim().toUpperCase() : "";
  if (!/^[A-Z0-9][A-Z0-9_-]{2,29}$/.test(code)) throw Error("Enter a valid discount code.");
  if (!subtotal) throw Error("Discount codes apply to services priced online.");
  const token = process.env.BLACKLINE_BOOKING_TOKEN;
  if (!token) throw Error("Discount codes are temporarily unavailable.");
  const { data, error } = await publicDatabase().rpc("blackline_checkout_discount", { token, code }).maybeSingle<{kind: "percent" | "fixed"; amount: number}>();
  if (error) throw Error("Discount codes are temporarily unavailable.");
  if (!data) throw Error("This discount code is invalid or expired.");
  const amountCents = data.kind === "percent" ? Math.round(subtotal * data.amount / 100) : data.amount;
  if (amountCents <= 0 || amountCents >= subtotal) throw Error("This discount cannot be applied to this total.");
  return { code, amountCents };
}
