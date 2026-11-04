import {publicDatabase,bookingDatabase} from "./supabase-server";
import {publishedProduct} from "./catalog-server";
import {getExoticCarById} from "./bookings";
import {getYachtBySlug} from "./yachts-data";
import "server-only";


import {
  computeBookingQuote,
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

async function readStore():Promise<{bookings:BookingRecord[]}>{return {bookings:await bookingDatabase<BookingRecord[]>("list_checkout")};}
async function persistBooking(booking:BookingRecord){await bookingDatabase("save_checkout",booking);}
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
  const {data,error}=await publicDatabase().rpc("blackline_availability",{category:args.category,item_id:args.itemId});if(error)throw new Error(error.message);return data as AvailabilityWindow[];
}

export async function assertAvailability(selection: BookingSelection, live?: import("./yachts-data").Yacht | import("./exotic-cars-data").ExoticCar): Promise<void> {
  const { startIso, endIso } = selectionToRange(selection, live);
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
  customerPhone?: string;
  source: BookingSource;
  status: BookingStatus;
  paymentMode: BookingPaymentMode;
  paymentType?: BookingPaymentType;
  holdMinutes?: number;
}): Promise<BookingRecord> {
  const selection=args.selection;
  const service=selection.category==="yacht"?"yachts":selection.service==="chauffeur-services"?"chauffeur-services":"exotic-cars";
  const live=selection.category==="yacht"?await publishedProduct(service,selection.itemId,getYachtBySlug(selection.itemId)):await publishedProduct(service,selection.itemId,getExoticCarById(selection.itemId));
  if(!live)throw new Error("This product is not currently available.");
  await assertAvailability(args.selection,live);
  const range=selectionToRange(args.selection,live);
  const quote = computeBookingQuote(args.selection,live);
  if(!quote.payableOnline && args.paymentMode==="stripe")throw new Error("Please request a quote for this product.");
  const nowIso = new Date().toISOString();
  const holdUntilIso =
    args.status === "pending"
      ? new Date(Date.now() + (args.holdMinutes ?? 30) * 60 * 1000).toISOString()
      : undefined;
  const record: BookingRecord = {
    id: createId("bk"),
    category: args.selection.category,
    service,
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
    customerPhone: args.customerPhone?.trim()??"",
    source: args.source,
    selection: args.selection,
    createdAtIso: nowIso,
    updatedAtIso: nowIso,
    holdUntilIso,
  };
  await persistBooking(record);
  return record;
}

export async function attachStripeSession(args:{bookingIds:string[];stripeSessionId:string}){await bookingDatabase("attach_session",args);}
export async function finalizeStripeSession(args:{stripeSessionId:string;status:Extract<BookingStatus,"deposit_paid"|"paid">}){await bookingDatabase("finalize_session",args);}
export async function cancelExpiredPendingBookings(){await bookingDatabase("expire_checkout");}
export async function updateBookingRecord(args:{bookingId:string;status?:BookingStatus;customerName?:string;customerEmail?:string;source?:BookingSource}){
 const booking=(await listBookings()).find(b=>b.id===args.bookingId);if(!booking)throw new Error("Booking not found.");
 const updated={...booking,status:args.status??booking.status,customerName:args.customerName?.trim()||booking.customerName,customerEmail:args.customerEmail?.trim()||booking.customerEmail,source:args.source??booking.source,updatedAtIso:new Date().toISOString()};
 await persistBooking(updated);return updated;
}
export async function deleteBookingRecord(bookingId:string){await bookingDatabase("delete_checkout",{id:bookingId});}
