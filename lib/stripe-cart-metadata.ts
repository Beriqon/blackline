import type { CartAddonsState, CartLine } from "@/lib/cart-types";
import {
  formatCartAddonsForMessage,
  formatCartLinesForMessage,
} from "@/lib/cart-types";

/** Stripe allows up to 50 metadata keys, each max 500 chars. */
const MAX_KEYS = 45;
const CHUNK = 490;

export function buildCheckoutMetadata(args: {
  items: readonly CartLine[];
  addons: CartAddonsState;
  paymentType: "full" | "deposit";
  bookingIds?: readonly string[];
  customerPhone?: string;
}): Record<string, string> {
  const humanSummary = [
    formatCartLinesForMessage(args.items),
    formatCartAddonsForMessage(args.addons),
    args.customerPhone ? `Phone: ${args.customerPhone}` : "",
    `Payment: ${args.paymentType === "full" ? "Full" : "Deposit (30%)"}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const payload = JSON.stringify({
    v: 1,
    paymentType: args.paymentType,
    items: args.items,
    addons: args.addons,
    bookingIds: args.bookingIds ?? [],
    customerPhone: args.customerPhone ?? "",
  });

  const meta: Record<string, string> = {
    payment_type: args.paymentType,
    summary: humanSummary.slice(0, 500),
    booking_ids: (args.bookingIds ?? []).join(",").slice(0, 500),
    customer_phone: (args.customerPhone ?? "").slice(0, 500),
  };

  let offset = 0;
  let i = 0;
  while (offset < payload.length && i < MAX_KEYS) {
    meta[`data_${i}`] = payload.slice(offset, offset + CHUNK);
    offset += CHUNK;
    i += 1;
  }

  return meta;
}
