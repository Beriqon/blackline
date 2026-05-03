import type { BookingQuote, BookingSelection } from "@/lib/bookings";

export type CartCategory =
  | "exotic-car"
  | "yacht"
  | "private-jet"
  | "fishing"
  | "jetski"
  | "jetcar"
  | "kayak"
  | "paddleboard"
  | "parasailing"
  | "security-armed"
  | "security-unarmed"
  | "other";

/** Optional add-ons for the whole request (any categories). */
export type CartAddonsState = {
  femaleHosts: boolean;
  /** Only used when femaleHosts is true; clamped 1–8 in UI. */
  femaleHostsCount: number;
  photoshoot: boolean;
  securityArmed: boolean;
  securityUnarmed: boolean;
};

export const DEFAULT_CART_ADDONS: CartAddonsState = {
  femaleHosts: false,
  femaleHostsCount: 1,
  photoshoot: false,
  securityArmed: false,
  securityUnarmed: false,
};

export type CartLineInput = {
  category: CartCategory;
  /** Stable product id from your data (car id, yacht id, jet id, etc.). */
  id: string;
  title: string;
  subtitle?: string;
  /** e.g. "$1,200 / day" — informational only */
  priceHint?: string;
  href: string;
  bookingSelection?: BookingSelection;
  bookingQuote?: BookingQuote;
};

export type CartLine = CartLineInput & {
  key: string;
  quantity: number;
  addedAt: number;
};

export function cartLineKey(
  category: CartCategory,
  id: string,
  bookingKey?: string,
): string {
  return `${category}:${id}:${bookingKey ?? "default"}`;
}

/** One booking line per id — no stacked quantities for these concierge lines. */
export function isSingleUnitInventory(category: CartCategory): boolean {
  void category;
  return true;
}

export function formatCartLinesForMessage(lines: readonly CartLine[]): string {
  if (lines.length === 0) return "";
  return lines
    .map((line, i) => {
      const single = isSingleUnitInventory(line.category);
      const q =
        !single && line.quantity > 1 ? ` ×${line.quantity}` : "";
      const sub = line.subtitle ? ` — ${line.subtitle}` : "";
      const price = line.priceHint ? ` (${line.priceHint})` : "";
      const booking = line.bookingSelection
        ? ` [${line.bookingQuote?.description ?? "Booked selection"}]`
        : "";
      return `${i + 1}. ${line.title}${sub}${price}${booking}${q}`;
    })
    .join("\n");
}

export function formatCartAddonsForMessage(addons: CartAddonsState): string {
  const parts: string[] = [];
  if (addons.femaleHosts) {
    const n = Math.min(8, Math.max(1, Math.floor(addons.femaleHostsCount) || 1));
    parts.push(
      `Female hostess add-on: yes (${n} host${n === 1 ? "" : "esses"})`,
    );
  } else {
    parts.push("Female hostess add-on: no");
  }
  parts.push(`Photo / video shoot add-on: ${addons.photoshoot ? "yes" : "no"}`);
  parts.push(`Security (armed) guard add-on: ${addons.securityArmed ? "yes" : "no"}`);
  parts.push(
    `Security (unarmed) guard add-on: ${addons.securityUnarmed ? "yes" : "no"}`,
  );
  return parts.join("\n");
}
