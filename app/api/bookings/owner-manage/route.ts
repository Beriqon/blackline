import {requireAdmin} from "@/lib/supabase-server";
import { NextResponse } from "next/server";

import type { BookingSource, BookingStatus } from "@/lib/bookings";
import {
  deleteBookingRecord,
  updateBookingRecord,
} from "@/lib/bookings-store";

export const runtime = "nodejs";



type PatchBody = {
  bookingId?: string;
  status?: BookingStatus;
  customerName?: string;
  customerEmail?: string;
  source?: BookingSource;
};

type DeleteBody = {
  bookingId?: string;
};

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Owner access required." }, { status: 401 });
  }

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.bookingId) {
    return NextResponse.json({ error: "bookingId is required." }, { status: 400 });
  }

  try {
    const booking = await updateBookingRecord(body as Required<PatchBody>);
    return NextResponse.json({ booking });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update booking." },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Owner access required." }, { status: 401 });
  }

  let body: DeleteBody;
  try {
    body = (await request.json()) as DeleteBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.bookingId) {
    return NextResponse.json({ error: "bookingId is required." }, { status: 400 });
  }

  try {
    await deleteBookingRecord(body.bookingId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not delete booking." },
      { status: 400 },
    );
  }
}
