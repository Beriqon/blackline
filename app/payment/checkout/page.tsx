import {stripeMode,stripeIntegration,validStripeSessionId,stripePublishableKeyValid} from "@/lib/stripe-mode";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BlacklineCheckout } from "@/components/blackline-checkout";
import { orderDatabase, type CheckoutOrder } from "@/lib/checkout-orders";
import { getStripe } from "@/lib/stripe-client";
import { publicProducts } from "@/lib/catalog-server";
import { getLocale } from "@/lib/i18n/get-locale";

export const metadata: Metadata = { title: "Secure checkout", robots: { index: false, follow: false }, referrer: "no-referrer" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id: sessionId } = await searchParams;
  const locale = await getLocale();
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
  let order: CheckoutOrder | null = null;
  let clientSecret: string | null = null;
  let methods: string[] = [];
  let expiresAt: number | null = null;
  let completed = false;
  let issue: "missing" | "expired" | "unavailable" | null = !sessionId ? "missing" : "unavailable";
  const stripe = getStripe();
  if (stripe && typeof sessionId === "string" && validStripeSessionId(sessionId)) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.livemode === (stripeMode()==="live") && session.metadata?.integration === stripeIntegration()) {
        const saved = await orderDatabase<CheckoutOrder | null>("get", { sessionId });
        if (saved && saved.id === session.client_reference_id && (saved.amountDueCents??saved.depositCents) === session.amount_total && session.currency === "usd") {
          order = saved;
          completed = session.status === "complete" || ["deposit_paid","payment_review"].includes(saved.status);
          issue = session.status === "expired" || saved.status === "expired" ? "expired" : null;
          if (!issue && session.ui_mode === "elements" && session.client_secret && stripePublishableKeyValid()) {
            clientSecret = session.client_secret;
            methods = session.payment_method_types;
            expiresAt = session.expires_at;
          } else if (!issue) issue = "unavailable";
        }
      }
    } catch { /* Render a recoverable state without exposing account or customer data. */ }
  }
  if (completed) redirect(`/payment/success?session_id=${encodeURIComponent(sessionId!)}`);
  const products = order ? await publicProducts() : [];
  const pictures = Object.fromEntries(products.filter(p => order?.lines.some(line => line.productId === p.id)).map(p => [p.id, p.images.split("\n").find(Boolean) ?? ""]));
  return <BlacklineCheckout sessionId={sessionId??null} order={order} clientSecret={clientSecret} publishableKey={stripePublishableKeyValid() ? key??null : null} methods={methods} expiresAt={expiresAt} pictures={pictures} locale={locale === "es" ? "es" : "en"} issue={issue} />;
}
