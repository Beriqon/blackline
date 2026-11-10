import {stripeMode,stripeIntegration} from "./stripe-mode";
import "server-only";
import type Stripe from "stripe";
import { orderDatabase, type CheckoutOrder } from "./checkout-orders";
export async function fulfillTestSession(session: Stripe.Checkout.Session, eventId: string) {
  if (session.livemode !== (stripeMode()==="live") || session.metadata?.integration !== stripeIntegration()) return;
  if (session.payment_status !== "paid") return;
  if (!session.metadata.order_id || session.client_reference_id !== session.metadata.order_id) throw new Error("Order reference mismatch.");
  const order = await orderDatabase<CheckoutOrder | null>("get", { sessionId: session.id });
  if (!order || order.id !== session.metadata.order_id) throw new Error("Order reference mismatch.");
  await orderDatabase("paid", { sessionId: session.id, amountCents: session.amount_total, currency: session.currency, eventId });
}
