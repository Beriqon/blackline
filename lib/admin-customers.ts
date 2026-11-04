import {cachedRows,saveRows} from "./workspace-store";
import type { AdminBooking } from "./admin-demo-data";

export const CUSTOMER_KEY = "blackline-customers-v1";
export const CUSTOMER_STATUSES = ["Lead", "Active", "VIP", "Archived"] as const;
export type AdminCustomer = {
  id: string; name: string; email: string; phone: string; company: string;
  source: AdminBooking["source"]; status: typeof CUSTOMER_STATUSES[number];
  preferences: string; notes: string; followUp: string; lastContact: string;
  bookingIds: string[];
};
export const normalizeEmail = (value: string) => value.trim().toLowerCase();
export const normalizePhone = (value: string) => value.replace(/\D/g, "").replace(/^00/, "");
export function blankCustomer(): AdminCustomer {
  return { id: crypto.randomUUID(), name: "", email: "", phone: "", company: "", source: "WhatsApp", status: "Lead", preferences: "", notes: "", followUp: "", lastContact: "", bookingIds: [] };
}
export function readCustomers(): AdminCustomer[] {return cachedRows<AdminCustomer>("customers");}
export async function saveCustomers(customers:AdminCustomer[]) {await saveRows("customers",customers);}
export function matchesBooking(customer: AdminCustomer, booking: AdminBooking) {
  return customer.bookingIds.includes(booking.id) || (!!normalizeEmail(customer.email) && normalizeEmail(customer.email) === normalizeEmail(booking.email)) || (!!normalizePhone(customer.phone) && normalizePhone(customer.phone) === normalizePhone(booking.phone));
}
export function customerDirectory(saved: AdminCustomer[], bookings: AdminBooking[]): AdminCustomer[] {
  const result = saved.map(c => ({ ...c, bookingIds: [...c.bookingIds] }));
  for (const b of bookings) {
    const existing = result.find(c => matchesBooking(c, b));
    if (existing) { if (!existing.bookingIds.includes(b.id)) existing.bookingIds.push(b.id); }
    else result.push({ id: "booking-" + b.id, name: b.name, email: b.email, phone: b.phone, company: "", source: b.source, status: "Active", preferences: "", notes: "", followUp: "", lastContact: "", bookingIds: [b.id] });
  }
  return result;
}
