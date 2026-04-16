import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { BookingSelection, BookingSource } from "@/lib/bookings";
import { computeBookingQuote } from "@/lib/bookings";
import { createBookingRecord } from "@/lib/bookings-store";

export const runtime = "nodejs";

const OWNER_COOKIE = "blackline-owner-access";

type Body = {
  selection?: BookingSelection;
  customerName?: string;
  customerEmail?: string;
  source?: BookingSource;
  markAs?: "owner_reserved" | "paid";
};

function isOwnerUnlocked(cookieValue: string | undefined) {
  const expected = process.env.OWNER_BOOKING_CODE?.trim();
  return !!expected && cookieValue === expected;
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (!isOwnerUnlocked(cookieStore.get(OWNER_COOKIE)?.value)) {
    return NextResponse.json({ error: "Owner access required." }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.selection) {
    return NextResponse.json(
      { error: "A booking selection is required." },
      { status: 400 },
    );
  }

  try {
    const quote = computeBookingQuote(body.selection);
    const booking = await createBookingRecord({
      selection: body.selection,
      customerName: body.customerName || "Manual booking",
      customerEmail: body.customerEmail || "owner@blackline.local",
      source: body.source ?? "manual",
      status: body.markAs ?? "owner_reserved",
      paymentMode: "skip_with_code",
    });

    return NextResponse.json({ booking, quote });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create booking." },
      { status: 400 },
    );
  }
}
