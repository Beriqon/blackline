import type { Metadata } from "next";
import Link from "next/link";

import { finalizeStripeSession } from "@/lib/bookings-store";
import { getStripe } from "@/lib/stripe-client";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Payment successful",
  robots: { index: false, follow: false },
};

const btn =
  "inline-flex min-h-11 items-center justify-center border border-gold/40 bg-gold px-8 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#0b0b0b] transition-all hover:bg-gold-secondary";

type Props = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const { session_id: sessionId } = await searchParams;
  let statusMessage =
    "Your card payment was submitted securely through Stripe. Our team will match it to your selection and follow up if anything else is needed.";

  if (sessionId) {
    const stripe = getStripe();
    if (stripe) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === "paid") {
          const nextStatus =
            session.metadata?.payment_type === "deposit" ? "deposit_paid" : "paid";
          await finalizeStripeSession({
            stripeSessionId: session.id,
            status: nextStatus,
          });
          statusMessage =
            nextStatus === "deposit_paid"
              ? "Your deposit has been received and the selected booking window is now held for you."
              : "Your booking payment has been received and the selected booking window is now confirmed.";
        }
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <section className="border-b border-gold/10 bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-lg px-4 text-center sm:px-6">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.42em] text-gold/90">
          Payment
        </p>
        <h1 className="mt-5 font-serif text-3xl tracking-tight text-cream sm:text-4xl">
          Thank you
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-cream/65">
          {statusMessage}
        </p>
        {sessionId ? (
          <p className="mt-6 font-mono text-[0.7rem] text-cream/45">
            Session: {sessionId}
          </p>
        ) : null}
        <Link href="/" className={cn(btn, "mt-10 inline-flex")}>
          Back to home
        </Link>
        <p className="mt-8 text-[0.72rem] text-cream/38">
          Questions?{" "}
          <Link
            href="/contact"
            className="text-gold-secondary underline-offset-4 hover:underline"
          >
            Contact
          </Link>
        </p>
      </div>
    </section>
  );
}
