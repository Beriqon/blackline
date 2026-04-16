import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { listQuoteRequests } from "@/lib/quote-requests-store";

export const runtime = "nodejs";

const OWNER_COOKIE = "blackline-owner-access";

function isOwnerUnlocked(cookieValue: string | undefined) {
  const expected = process.env.OWNER_BOOKING_CODE?.trim();
  return !!expected && cookieValue === expected;
}

export async function GET() {
  const cookieStore = await cookies();
  if (!isOwnerUnlocked(cookieStore.get(OWNER_COOKIE)?.value)) {
    return NextResponse.json({ error: "Owner access required." }, { status: 401 });
  }

  const quoteRequests = await listQuoteRequests();
  quoteRequests.sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));

  return NextResponse.json({ quoteRequests });
}

