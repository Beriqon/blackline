import {stripeMode,stripeIntegration,validStripeSessionId} from "./stripe-mode";
import "server-only";
import { getStripe } from "./stripe-client";
import { orderDatabase, type CheckoutOrder } from "./checkout-orders";
import { fulfillTestSession } from "./stripe-fulfillment";
import { publicProducts } from "./catalog-server";
import type { OrderConfirmation } from "./order-confirmation-view";

export async function getOrderConfirmation(sessionId: string): Promise<OrderConfirmation | null> {
  if (!validStripeSessionId(sessionId)) return null;
  const stripe = getStripe();
  if (!stripe) return null;
  const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["payment_intent.payment_method"] });
  if (session.livemode !== (stripeMode()==="live") || session.metadata?.integration !== stripeIntegration()) return null;
  let order = await orderDatabase<CheckoutOrder | null>("get", { sessionId });
  if (!order || order.testMode !== (stripeMode()==="test") || order.id !== session.client_reference_id || order.id !== session.metadata.order_id || session.currency !== "usd" || session.amount_total !== (order.amountDueCents??order.depositCents)) return null;

  // Stripe's verified API response is authoritative. Reuse the same idempotent
  // fulfillment operation as the webhook to avoid a slow or missed return screen.
  const received = session.payment_status === "paid";
  if (received && !["deposit_paid","payment_review"].includes(order.status)) {
    try {
      await fulfillTestSession(session, `return:${session.id}`);
      order = await orderDatabase<CheckoutOrder>("get", { sessionId });
    } catch { /* Keep payment received distinct from booking confirmed. The webhook retries. */ }
  }
  if (!order) return null;
  const paidCents = received ? (order.amountPaidCents??order.amountDueCents??order.depositCents) : 0;
  let paymentMethod: string | null = null;
  const intent = typeof session.payment_intent === "object" ? session.payment_intent : null;
  const method = intent && typeof intent.payment_method === "object" ? intent.payment_method : null;
  if (method?.type === "card" && method.card) paymentMethod = `${method.card.brand.toUpperCase()} ending ${method.card.last4}`;
  else if (method) paymentMethod = ({ cashapp: "Cash App Pay", amazon_pay: "Amazon Pay", klarna: "Klarna", link: "Link", affirm: "Affirm" } as Record<string, string>)[method.type] ?? method.type.replaceAll("_", " ");
  let pictures: Record<string, string> = {};
  try {
    const products = await publicProducts();
    pictures = Object.fromEntries(order.lines.map(line => [line.productId, line.imageSrc || products.find(p => p.id === line.productId)?.images.split("\n").find(Boolean) || ""]));
  } catch {
    pictures = Object.fromEntries(order.lines.map(line => [line.productId, line.imageSrc ?? ""]));
  }
  return { order, status: received ? order.status === "payment_review" ? "review" : order.status === "deposit_paid" ? "confirmed" : "processing" : session.status === "expired" ? "expired" : "awaiting_payment", paidCents, outstandingCents: order.knownTotalCents - paidCents, paymentMethod, pictures };
}
