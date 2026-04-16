import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { BookingSource } from "@/lib/bookings";
import type {
  QuoteRequestRecord,
  QuoteRequestStatus,
} from "@/lib/quote-requests-store";
import {
  deleteQuoteRequest,
  updateQuoteRequest,
} from "@/lib/quote-requests-store";

export const runtime = "nodejs";

const OWNER_COOKIE = "blackline-owner-access";

function isOwnerUnlocked(cookieValue: string | undefined) {
  const expected = process.env.OWNER_BOOKING_CODE?.trim();
  return !!expected && cookieValue === expected;
}

type PatchBody = {
  quoteRequestId?: string;
  status?: QuoteRequestStatus;
  customerName?: string;
  customerEmail?: string;
  source?: BookingSource;
  message?: string;
  summary?: string;
};

type DeleteBody = {
  quoteRequestId?: string;
};

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  if (!isOwnerUnlocked(cookieStore.get(OWNER_COOKIE)?.value)) {
    return NextResponse.json({ error: "Owner access required." }, { status: 401 });
  }

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.quoteRequestId) {
    return NextResponse.json({ error: "quoteRequestId is required." }, { status: 400 });
  }

  try {
    const quoteRequest: QuoteRequestRecord = await updateQuoteRequest(
      body as Required<PatchBody>,
    );
    return NextResponse.json({ quoteRequest });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update quote request." },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  if (!isOwnerUnlocked(cookieStore.get(OWNER_COOKIE)?.value)) {
    return NextResponse.json({ error: "Owner access required." }, { status: 401 });
  }

  let body: DeleteBody;
  try {
    body = (await request.json()) as DeleteBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.quoteRequestId) {
    return NextResponse.json({ error: "quoteRequestId is required." }, { status: 400 });
  }

  try {
    await deleteQuoteRequest(body.quoteRequestId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not delete quote request." },
      { status: 400 },
    );
  }
}

