import { NextRequest, NextResponse } from "next/server";

import { cancelExpiredPendingBookings, listActiveBookingWindows } from "@/lib/bookings-store";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  await cancelExpiredPendingBookings();

  const category = request.nextUrl.searchParams.get("category");
  const itemId = request.nextUrl.searchParams.get("itemId");

  if (
    (category !== "exotic-car" && category !== "yacht") ||
    !itemId
  ) {
    return NextResponse.json(
      { error: "category and itemId are required." },
      { status: 400 },
    );
  }

  const windows = await listActiveBookingWindows({
    category,
    itemId,
  });

  return NextResponse.json({ windows });
}
