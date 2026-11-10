import { NextResponse } from "next/server";
import { quoteCheckout } from "@/lib/checkout-quote";
export async function POST(request: Request) {
  try {
    const { order } = await quoteCheckout(await request.json());
    return NextResponse.json({ lines: order.lines, knownTotalCents: order.knownTotalCents, depositCents: order.depositCents, remainingCents: order.remainingCents });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not check prices." }, { status: 400 });
  }
}
