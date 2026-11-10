import type { AdminProduct } from "./admin-demo-data";
import type { CartLine } from "./cart-types";

export type OrderLine = {
  inventory?:{resourceId:string;startIso:string;endIso:string;service:string;itemId:string};
  imageSrc?: string;
  cartKey?: string;
  productId: string; title: string; description: string;
  totalCents: number | null; status: "priced" | "price_follows";
};

export function depositCents(totalCents: number) {
  if (!Number.isSafeInteger(totalCents) || totalCents < 0) throw new Error("Invalid price.");
  return Math.round(totalCents * 30 / 100);
}

export function findCartProduct(item: CartLine, products: readonly AdminProduct[]) {
  const service = item.bookingSelection?.category === "yacht" ? "yachts"
    : item.bookingSelection?.category === "exotic-car" ? item.bookingSelection.service ?? "exotic-cars"
    : /^\/services\/([a-z-]+)/.exec(item.href ?? "")?.[1];
  return products.find(p => p.status === "visible" && p.service === service &&
    (p.id === item.id || p.id === `catalog:${service}:${item.id}`));
}

// Starting rates and estimates are not agreed prices, even if a number is shown.
export function experienceTotalCents(item: CartLine, product: AdminProduct): number | null {
  if (product.service !== "jetskis-jetcars" || !item.experienceSelection) return null;
  if (product.unit === "on request" || !Number.isFinite(product.price) || product.price <= 0 ||
    /\b(from|starting|estimate|request)\b|\$[\d,]+\s*\+|\$[\d,]+\s*[–-]\s*\$?\d/i.test(product.rates ?? "")) return null;
  const { date, hours, units } = item.experienceSelection;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) ||
    !Number.isInteger(hours) || hours < 1 || hours > 12 ||
    !Number.isInteger(units) || units < 1 || units > 20) throw new Error("Choose a valid activity date, duration and number of units.");
  if (product.unit !== "per hour" && product.unit !== "per experience") return null;
  // Tiered experiences need their own selection logic; do not charge the first tier.
  if (product.unit === "per experience" && (product.rates ?? "").split("\n").filter(Boolean).length > 1) return null;
  return Math.round(product.price * 100) * units * (product.unit === "per hour" ? hours : 1);
}
