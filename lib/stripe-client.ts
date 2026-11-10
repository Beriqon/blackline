import Stripe from "stripe";
import {stripeMode,liveStripeEnabled} from './stripe-mode';

let stripeSingleton: Stripe | null = null;

export async function getBookingProduct(stripe: Stripe): Promise<string> {
  const id = `blackline_booking_${stripeMode()}_v1`;
  const description="Payment for priced Blackline services. Additional quotes are excluded.";
  try {
    const product = await stripe.products.retrieve(id);
    if (product.deleted || !product.active) throw new Error("Booking product is unavailable.");
    if(product.description!==description)await stripe.products.update(id,{description});
    return product.id;
  } catch (error) {
    if (!(error instanceof Stripe.errors.StripeInvalidRequestError) || error.code !== "resource_missing") throw error;
  }
  try {
    return (await stripe.products.create({ id, name: "Blackline booking", description }, { idempotencyKey: `blackline-booking-product-${stripeMode()}-v2` })).id;
  } catch (error) {
    if (!(error instanceof Stripe.errors.StripeInvalidRequestError)) throw error;
    const product = await stripe.products.retrieve(id);
    if (product.deleted || !product.active) throw error;
    return product.id;
  }
}

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  if (!liveStripeEnabled()||!new RegExp(`^(sk|rk)_${stripeMode()}_`).test(key)) return null;
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(key, {
      apiVersion: "2026-03-25.dahlia",
    });
  }
  return stripeSingleton;
}

export function getAppBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  if (process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL.replace(/^https?:\/\//, "")}`;
  return "http://localhost:3000";
}
