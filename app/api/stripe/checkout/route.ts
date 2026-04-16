import { NextResponse } from "next/server";

import type { CartAddonsState, CartLine } from "@/lib/cart-types";
import { createBookingRecord, attachStripeSession, cancelExpiredPendingBookings } from "@/lib/bookings-store";
import { buildCheckoutMetadata } from "@/lib/stripe-cart-metadata";
import { computeSecurityGuardsAddonTotalUsd } from "@/lib/security-guards-pricing";
import { getAppBaseUrl, getStripe } from "@/lib/stripe-client";

const MIN_USD = 50;
const MAX_USD = 500_000;

type Body = {
  paymentType?: "full" | "deposit";
  items?: CartLine[];
  addons?: CartAddonsState;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
};

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      {
        error:
          "Payments are not configured. Set STRIPE_SECRET_KEY in the server environment.",
      },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const items = Array.isArray(body.items) ? body.items : [];
  await cancelExpiredPendingBookings();
  const defaultAddons = {
    femaleHosts: false,
    femaleHostsCount: 1,
    photoshoot: false,
    securityArmed: false,
    securityUnarmed: false,
  };
  const addons = body.addons ? { ...defaultAddons, ...body.addons } : defaultAddons;

  if (items.length === 0) {
    return NextResponse.json(
      { error: "Your selection is empty." },
      { status: 400 },
    );
  }

  const paymentType =
    body.paymentType === "deposit" ? "deposit" : "full";

  const unsupported = items.find(
    (item) =>
      (item.category !== "exotic-car" && item.category !== "yacht") ||
      !item.bookingSelection ||
      !item.bookingQuote?.payableOnline,
  );
  if (unsupported) {
    return NextResponse.json(
      {
        error:
          "Only cars and yachts with a complete booking selection and published online price can be paid online.",
      },
      { status: 400 },
    );
  }

  const customerName = body.customerName?.trim() || "Website guest";
  const customerEmail = body.customerEmail?.trim() || "guest@blackline.local";
  const customerPhone = body.customerPhone?.trim() || "";

  let createdBookingIds: string[] = [];
  let amountUsd = 0;
  try {
    const created = await Promise.all(
      items.map((item) =>
        createBookingRecord({
          selection: item.bookingSelection!,
          customerName,
          customerEmail,
          source: "website",
          status: "pending",
          paymentMode: "stripe",
          paymentType,
        }),
      ),
    );
    createdBookingIds = created.map((booking) => booking.id);
    amountUsd = created.reduce(
      (sum, booking) =>
        sum +
        (paymentType === "deposit"
          ? booking.depositUsd ?? 0
          : booking.totalUsd),
      0,
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not reserve that time slot.",
      },
      { status: 400 },
    );
  }

  const securityAddonsTotalUsd = computeSecurityGuardsAddonTotalUsd(addons);
  const securityAddonsChargeUsd =
    paymentType === "deposit"
      ? Math.round(securityAddonsTotalUsd * 0.3)
      : securityAddonsTotalUsd;
  amountUsd += securityAddonsChargeUsd;

  if (amountUsd < MIN_USD || amountUsd > MAX_USD) {
    return NextResponse.json(
      {
        error: `Amount must be between $${MIN_USD.toLocaleString("en-US")} and $${MAX_USD.toLocaleString("en-US")}.`,
      },
      { status: 400 },
    );
  }

  const cents = Math.round(amountUsd * 100);

  const base = getAppBaseUrl();
  const description =
    paymentType === "deposit"
      ? `Deposit (30%) — ${items.length} line item(s)`
      : `Payment — ${items.length} line item(s)`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: cents,
            product_data: {
              name: "Blackline Concierge",
              description: description.slice(0, 500),
            },
          },
        },
      ],
      success_url: `${base}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/payment/cancel`,
      metadata: buildCheckoutMetadata({
        items,
        addons,
        paymentType,
        bookingIds: createdBookingIds,
        customerPhone,
      }),
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 502 },
      );
    }

    await attachStripeSession({
      bookingIds: createdBookingIds,
      stripeSessionId: session.id,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[stripe checkout]", e);
    return NextResponse.json(
      { error: "Could not start checkout. Try again or contact us." },
      { status: 502 },
    );
  }
}
