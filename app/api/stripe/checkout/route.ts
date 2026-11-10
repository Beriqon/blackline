import {stripeMode,stripeIntegration,stripePublishableKeyValid} from "@/lib/stripe-mode";
import { NextResponse } from "next/server";
import { quoteCheckout, type CheckoutBody } from "@/lib/checkout-quote";
import { orderDatabase, saveCheckoutOrder } from "@/lib/checkout-orders";
import { getAppBaseUrl, getStripe, getBookingProduct } from "@/lib/stripe-client";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET || !stripePublishableKeyValid()) return NextResponse.json({ error: "Payments are temporarily unavailable. Please contact your concierge." }, { status: 503 });
  let body: CheckoutBody;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (!body || typeof body.customerName !== "string" || !body.customerName.trim() || typeof body.customerEmail !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customerEmail) || typeof body.customerPhone !== "string" || !/^\+\d{7,15}$/.test(body.customerPhone)) return NextResponse.json({ error: "Enter your name, email and international phone number." }, { status: 400 });
  let quote;
  try { quote = await quoteCheckout(body); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not price this selection." }, { status: 400 }); }
  const { order, bookings } = quote;
  const full=order.paymentType==="full",amountDue=order.amountDueCents??order.depositCents;
  if ((body.expectedAmountCents??body.expectedDepositCents) !== amountDue) return NextResponse.json({ error: "The current price has changed. Close and reopen your selection to review it before payment." }, { status: 409 });
  if (order.depositCents < 50) return NextResponse.json({ error: "This selection has no payable deposit. Request a quote instead." }, { status: 400 });
  let sessionId: string | undefined;
  let saved = false;
  let stage = "product";
  try {
    const product = await getBookingProduct(stripe);
    stage = "reservation";
    const stored=await saveCheckoutOrder(order, bookings) as typeof order|null;
    if(stored?.bookingIds)order.bookingIds=stored.bookingIds;
    saved = true;
    stage = "stripe_session";
    const session = await stripe.checkout.sessions.create({
      mode: "payment", ui_mode: "elements", client_reference_id: order.id,
      adaptive_pricing: { enabled: false },
      ...(!full?{excluded_payment_method_types:["klarna" as const],wallet_options:{link:{display:"never" as const}}}:{}),
      customer_email: order.customerEmail,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      line_items: [{ quantity: 1, price_data: { currency: "usd", unit_amount: amountDue, product } }],
      metadata: { order_id: order.id, payment_type: full?"full":"deposit", integration: stripeIntegration(), payment_policy:"full-klarna-v1" },
      payment_intent_data: { description: `${full?"Full payment":"30% deposit"} · ${order.id}`, metadata: { order_id: order.id } },
      return_url: `${getAppBaseUrl()}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    }, { idempotencyKey: `checkout:${order.id}` });
    sessionId = session.id;
    if (session.livemode !== (stripeMode()==="live") || !session.client_secret) throw new Error("Invalid checkout session.");
    stage = "attach_session";
    await orderDatabase("attach", { orderId: order.id, sessionId });
    return NextResponse.json({ url: `/payment/checkout?session_id=${encodeURIComponent(session.id)}`, orderId: order.id });
  } catch (error) {
    const inventoryConflict = stage === "reservation" && error instanceof Error && /slot is no longer available|already has .*reservation|already has .*booking|no longer available/i.test(error.message);
    console.error("[stripe checkout]", { stage, reason: inventoryConflict ? "inventory_conflict" : "checkout_failed" });
    try {
      if (sessionId) await stripe.checkout.sessions.expire(sessionId);
      if (saved) await orderDatabase("abort", { orderId: order.id });
    } catch { /* Keep inventory held if a payable session could not be expired. */ }
    if (inventoryConflict) return NextResponse.json({ code: "booking_unavailable", error: "This experience is already booked for the selected dates. Please choose different dates." }, { status: 409 });
    return NextResponse.json({ error: "Could not start checkout. Please try again or contact your concierge." }, { status: 502 });
  }
}
