import type { CheckoutOrder } from "./checkout-orders";
import type {ZelleStatus} from "./zelle-types";

export type ConfirmationStatus = "review" | "confirmed" | "processing" | "awaiting_payment" | "expired";
export type OrderConfirmation = {
  order: Omit<CheckoutOrder,"testMode"> & {testMode:boolean};
  zelle?:{status:ZelleStatus;holdUntilIso:string;submittedAtIso?:string;reviewNote?:string};
  status: ConfirmationStatus;
  paidCents: number;
  outstandingCents: number;
  paymentMethod: string | null;
  pictures: Record<string, string>;
  balancePayment?:{status:string;amountCents:number;submittedAtIso?:string;reviewNote?:string};
};

export const confirmationMoney = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

// Allocate an order-level payment without introducing rounding discrepancies.
// Quote-only services never receive a payment allocation.
export function confirmationLineAmounts(order: Pick<CheckoutOrder,"lines">, paidCents: number) {
  const total = order.lines.reduce((sum, line) => sum + (line.totalCents ?? 0), 0);
  if (!Number.isSafeInteger(paidCents) || paidCents < 0 || paidCents > total) throw new Error("Invalid paid amount.");
  const shares = order.lines.map((line, index) => {
    const value = total && line.totalCents !== null ? paidCents * line.totalCents / total : 0;
    return { index, paid: Math.floor(value), fraction: value - Math.floor(value) };
  });
  let remainder = paidCents - shares.reduce((sum, share) => sum + share.paid, 0);
  for (const share of [...shares].filter(s => order.lines[s.index].totalCents !== null).sort((a, b) => b.fraction - a.fraction || a.index - b.index)) {
    if (remainder-- > 0) share.paid += 1;
  }
  return order.lines.map((line, index) => ({ ...line, paidCents: line.totalCents === null ? null : shares[index].paid, remainingCents: line.totalCents === null ? null : line.totalCents - shares[index].paid }));
}

export function confirmationDate(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" }).format(date);
}
