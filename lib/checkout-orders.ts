import "server-only";
import type { BookingRecord } from "./bookings";
import type { OrderLine } from "./checkout-pricing";
import { publicDatabase } from "./supabase-server";
import {stripeMode} from './stripe-mode';

export type CheckoutOrder = {
  id: string; testMode: boolean; status: "pending" | "deposit_paid" | "expired" | "payment_review";
  customerName: string; customerEmail: string; customerPhone: string;
  lines: OrderLine[]; knownTotalCents: number; depositCents: number;
  remainingCents: number; bookingIds: string[]; createdAtIso: string;
  stripeSessionId?: string;
  paymentType?:"deposit"|"full"; amountDueCents?:number;
  amountPaidCents?:number; balancePaidAtIso?:string;
  paymentHistory?:{amountCents:number;method:string;paidAtIso:string;reference:string}[];
};

export async function orderDatabase<T>(operation: string, payload: unknown): Promise<T> {
  const token = process.env.BLACKLINE_BOOKING_TOKEN;
  if (!token) throw new Error("Booking database is not configured.");
  const { data, error } = await publicDatabase().rpc(stripeMode()==='live'?"blackline_checkout_live":"blackline_checkout_order", { token, operation, payload });
  if (error) throw new Error(error.message);
  return data as T;
}

export async function saveCheckoutOrder(order: CheckoutOrder, bookings: BookingRecord[]) {
  return orderDatabase("create", { order, bookings });
}
