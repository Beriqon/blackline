import { NextResponse } from "next/server";

import type { BookingSource } from "@/lib/bookings";
import type {
  QuoteRequestItem,
  QuoteRequestStatus,
} from "@/lib/quote-requests-store";
import { createQuoteRequest } from "@/lib/quote-requests-store";

export const runtime = "nodejs";

type Body = {
  customerName?: string;
  customerEmail?: string;
  source?: BookingSource;
  message?: string;
  summary?: string;
  items?: QuoteRequestItem[];
  status?: QuoteRequestStatus;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const message = (body.message ?? "").trim();
  if (!message || message.length>8000 || (body.customerEmail?.length??0)>254 || (body.items?.length??0)>50) {
    return NextResponse.json({ error: "message is required." }, { status: 400 });
  }

  const customerName = (body.customerName ?? "").trim() || "Customer";
  const customerEmail = (body.customerEmail ?? "").trim();
  const source = body.source ?? "website";

  try {
    const quoteRequest = await createQuoteRequest({
      customerName,
      customerEmail,
      source,
      message,
      summary: body.summary,
      items: body.items,
      status: "pending",
    });

    return NextResponse.json({ quoteRequest });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not create quote request.",
      },
      { status: 400 },
    );
  }
}

