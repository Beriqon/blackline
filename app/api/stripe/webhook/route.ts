import {stripeMode,stripeIntegration} from "@/lib/stripe-mode";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe-client";
import { fulfillTestSession } from "@/lib/stripe-fulfillment";
import { orderDatabase } from "@/lib/checkout-orders";
import {fulfillBalanceSession} from '@/lib/balance-fulfillment';
import {balanceDatabase} from '@/lib/balance-server';
export const runtime = "nodejs";
export async function POST(request: Request) {
  const stripe = getStripe(), secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ error: "Payment webhook is not configured." }, { status: 503 });
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(await request.text(), signature, secret); }
  catch { return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 }); }
  if (event.livemode !== (stripeMode()==="live")) return NextResponse.json({ error: "Wrong payment environment." }, { status: 400 });
  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      await fulfillTestSession(event.data.object, event.id);
      if(event.data.object.metadata?.integration===stripeIntegration(true))await fulfillBalanceSession(event.data.object,event.id);
    } else if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object;
      if (session.metadata?.integration === stripeIntegration()) await orderDatabase("expire", { sessionId: session.id });
      if(session.metadata?.integration===stripeIntegration(true))await balanceDatabase('expire',{sessionId:session.id});
    }
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Payment could not be recorded. Retry required." }, { status: 500 });
  }
}
