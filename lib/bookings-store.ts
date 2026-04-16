import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  bookingRecordToWindow,
  computeBookingQuote,
  isBookingRecordActive,
  overlapsRange,
  selectionToRange,
  type AvailabilityWindow,
  type BookingPaymentMode,
  type BookingPaymentType,
  type BookingRecord,
  type BookingSelection,
  type BookingSource,
  type BookingStatus,
} from "@/lib/bookings";

type BookingStorePayload = {
  bookings: BookingRecord[];
};

const STORE_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(STORE_DIR, "bookings.json");

async function ensureStore(): Promise<void> {
  await mkdir(STORE_DIR, { recursive: true });
}

async function readStore(): Promise<BookingStorePayload> {
  await ensureStore();
  try {
    const raw = await readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<BookingStorePayload>;
    return {
      bookings: Array.isArray(parsed.bookings) ? parsed.bookings : [],
    };
  } catch {
    return { bookings: [] };
  }
}

async function writeStore(payload: BookingStorePayload): Promise<void> {
  await ensureStore();
  await writeFile(STORE_FILE, JSON.stringify(payload, null, 2), "utf8");
}

function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export async function listBookings(): Promise<BookingRecord[]> {
  const payload = await readStore();
  return payload.bookings;
}

export async function listActiveBookingWindows(args: {
  category: "exotic-car" | "yacht";
  itemId: string;
}): Promise<AvailabilityWindow[]> {
  const payload = await readStore();
  return payload.bookings
    .filter(
      (booking) =>
        booking.category === args.category &&
        booking.itemId === args.itemId &&
        isBookingRecordActive(booking),
    )
    .map(bookingRecordToWindow)
    .sort((a, b) => a.startIso.localeCompare(b.startIso));
}

export async function assertAvailability(selection: BookingSelection): Promise<void> {
  const { startIso, endIso } = selectionToRange(selection);
  const windows = await listActiveBookingWindows({
    category: selection.category,
    itemId: selection.itemId,
  });
  const conflict = windows.find((window) =>
    overlapsRange(startIso, endIso, window.startIso, window.endIso),
  );
  if (conflict) {
    throw new Error(`This slot is no longer available (${conflict.label}).`);
  }
}

export async function createBookingRecord(args: {
  selection: BookingSelection;
  customerName: string;
  customerEmail: string;
  source: BookingSource;
  status: BookingStatus;
  paymentMode: BookingPaymentMode;
  paymentType?: BookingPaymentType;
  holdMinutes?: number;
}): Promise<BookingRecord> {
  await assertAvailability(args.selection);
  const payload = await readStore();
  const range = selectionToRange(args.selection);
  const quote = computeBookingQuote(args.selection);
  const nowIso = new Date().toISOString();
  const holdUntilIso =
    args.status === "pending"
      ? new Date(Date.now() + (args.holdMinutes ?? 30) * 60 * 1000).toISOString()
      : undefined;
  const record: BookingRecord = {
    id: createId("bk"),
    category: args.selection.category,
    itemId: args.selection.itemId,
    startIso: range.startIso,
    endIso: range.endIso,
    bookingMode: range.bookingMode,
    totalUsd: quote.totalUsd,
    depositUsd: quote.depositUsd,
    status: args.status,
    paymentMode: args.paymentMode,
    paymentType: args.paymentType,
    customerName: args.customerName.trim(),
    customerEmail: args.customerEmail.trim(),
    source: args.source,
    selection: args.selection,
    createdAtIso: nowIso,
    updatedAtIso: nowIso,
    holdUntilIso,
  };
  payload.bookings.push(record);
  await writeStore(payload);
  return record;
}

export async function attachStripeSession(args: {
  bookingIds: string[];
  stripeSessionId: string;
}) {
  const payload = await readStore();
  const next = payload.bookings.map((booking) =>
    args.bookingIds.includes(booking.id)
      ? {
          ...booking,
          stripeSessionId: args.stripeSessionId,
          updatedAtIso: new Date().toISOString(),
        }
      : booking,
  );
  await writeStore({ bookings: next });
}

export async function finalizeStripeSession(args: {
  stripeSessionId: string;
  status: Extract<BookingStatus, "deposit_paid" | "paid">;
}) {
  const payload = await readStore();
  let changed = false;
  const next = payload.bookings.map((booking) => {
    if (booking.stripeSessionId !== args.stripeSessionId) return booking;
    changed = true;
    return {
      ...booking,
      status: args.status,
      holdUntilIso: undefined,
      updatedAtIso: new Date().toISOString(),
    };
  });
  if (changed) {
    await writeStore({ bookings: next });
  }
}

export async function cancelExpiredPendingBookings() {
  const payload = await readStore();
  const now = Date.now();
  let changed = false;
  const next = payload.bookings.map((booking) => {
    if (booking.status !== "pending" || !booking.holdUntilIso) return booking;
    if (new Date(booking.holdUntilIso).getTime() > now) return booking;
    changed = true;
    return {
      ...booking,
      status: "cancelled" as const,
      updatedAtIso: new Date().toISOString(),
    };
  });
  if (changed) {
    await writeStore({ bookings: next });
  }
}

export async function updateBookingRecord(args: {
  bookingId: string;
  status?: BookingStatus;
  customerName?: string;
  customerEmail?: string;
  source?: BookingSource;
}) {
  const payload = await readStore();
  let updated: BookingRecord | null = null;
  const next = payload.bookings.map((booking) => {
    if (booking.id !== args.bookingId) return booking;
    updated = {
      ...booking,
      status: args.status ?? booking.status,
      customerName: args.customerName?.trim() || booking.customerName,
      customerEmail: args.customerEmail?.trim() || booking.customerEmail,
      source: args.source ?? booking.source,
      holdUntilIso:
        args.status && args.status !== "pending" ? undefined : booking.holdUntilIso,
      updatedAtIso: new Date().toISOString(),
    };
    return updated;
  });
  if (!updated) {
    throw new Error("Booking not found.");
  }
  await writeStore({ bookings: next });
  return updated;
}

export async function deleteBookingRecord(bookingId: string) {
  const payload = await readStore();
  const exists = payload.bookings.some((booking) => booking.id === bookingId);
  if (!exists) {
    throw new Error("Booking not found.");
  }
  await writeStore({
    bookings: payload.bookings.filter((booking) => booking.id !== bookingId),
  });
}
