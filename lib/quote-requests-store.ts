import {bookingDatabase} from "./supabase-server";
import "server-only";


import type { BookingSource } from "@/lib/bookings";

export type QuoteRequestStatus = "pending" | "quoted" | "confirmed" | "cancelled";

export type QuoteRequestItem = {
  category: string;
  id: string;
  title: string;
  subtitle?: string;
};

export type QuoteRequestRecord = {
  id: string;
  createdAtIso: string;
  updatedAtIso: string;
  customerName: string;
  customerEmail: string;
  source: BookingSource;
  status: QuoteRequestStatus;
  message: string;
  summary?: string;
  items?: QuoteRequestItem[];
};

async function readStore():Promise<{quoteRequests:QuoteRequestRecord[]}>{return {quoteRequests:await bookingDatabase<QuoteRequestRecord[]>("list_quotes")};}
function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export async function listQuoteRequests(): Promise<QuoteRequestRecord[]> {
  const payload = await readStore();
  return payload.quoteRequests;
}

export async function createQuoteRequest(args: {
  customerName: string;
  customerEmail: string;
  source: BookingSource;
  message: string;
  summary?: string;
  items?: QuoteRequestItem[];
  status?: QuoteRequestStatus;
}): Promise<QuoteRequestRecord> {
  const payload = await readStore();
  const nowIso = new Date().toISOString();
  const record: QuoteRequestRecord = {
    id: createId("qr"),
    customerName: args.customerName.trim(),
    customerEmail: args.customerEmail.trim(),
    source: args.source,
    status: args.status ?? "pending",
    message: args.message.trim(),
    summary: args.summary?.trim() || undefined,
    items: args.items?.length ? args.items : undefined,
    createdAtIso: nowIso,
    updatedAtIso: nowIso,
  };
  payload.quoteRequests.push(record);
  await bookingDatabase("save_quote",record);
  return record;
}

export async function updateQuoteRequest(args: {
  quoteRequestId: string;
  status?: QuoteRequestStatus;
  customerName?: string;
  customerEmail?: string;
  source?: BookingSource;
  message?: string;
  summary?: string;
}): Promise<QuoteRequestRecord> {
  const payload = await readStore();
  let updated: QuoteRequestRecord | null = null;

  payload.quoteRequests.forEach((req) => {
    if (req.id !== args.quoteRequestId) return req;
    updated = {
      ...req,
      status: args.status ?? req.status,
      customerName: args.customerName?.trim() || req.customerName,
      customerEmail: args.customerEmail?.trim() || req.customerEmail,
      source: args.source ?? req.source,
      message: args.message?.trim() || req.message,
      summary:
        args.summary !== undefined ? args.summary.trim() || undefined : req.summary,
      updatedAtIso: new Date().toISOString(),
    };
    return updated;
  });

  if (!updated) throw new Error("Quote request not found.");
  await bookingDatabase("save_quote",updated);
  return updated;
}

export async function deleteQuoteRequest(quoteRequestId:string):Promise<void>{await bookingDatabase("delete_quote",{id:quoteRequestId});}
