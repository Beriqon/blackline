import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

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

type QuoteRequestStorePayload = {
  quoteRequests: QuoteRequestRecord[];
};

const STORE_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(STORE_DIR, "quote-requests.json");

async function ensureStore(): Promise<void> {
  await mkdir(STORE_DIR, { recursive: true });
}

async function readStore(): Promise<QuoteRequestStorePayload> {
  await ensureStore();
  try {
    const raw = await readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<QuoteRequestStorePayload>;
    return {
      quoteRequests: Array.isArray(parsed.quoteRequests)
        ? parsed.quoteRequests
        : [],
    };
  } catch {
    return { quoteRequests: [] };
  }
}

async function writeStore(payload: QuoteRequestStorePayload): Promise<void> {
  await ensureStore();
  await writeFile(STORE_FILE, JSON.stringify(payload, null, 2), "utf8");
}

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
  await writeStore(payload);
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

  const next = payload.quoteRequests.map((req) => {
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
  await writeStore({ quoteRequests: next });
  return updated;
}

export async function deleteQuoteRequest(quoteRequestId: string): Promise<void> {
  const payload = await readStore();
  const exists = payload.quoteRequests.some((r) => r.id === quoteRequestId);
  if (!exists) throw new Error("Quote request not found.");
  await writeStore({
    quoteRequests: payload.quoteRequests.filter((r) => r.id !== quoteRequestId),
  });
}

