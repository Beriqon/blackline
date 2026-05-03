import type { Metadata } from "next";
import Link from "next/link";

import { CONTACT_TRIP_BUILDER_HREF } from "@/lib/contact-hrefs";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Payment cancelled",
  robots: { index: false, follow: false },
};

const btnPrimary =
  "inline-flex min-h-11 items-center justify-center border border-gold/40 bg-gold px-8 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#0b0b0b] transition-all hover:bg-gold-secondary";
const btnGhost =
  "inline-flex min-h-11 items-center justify-center border border-gold/25 bg-transparent px-8 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-cream transition-colors hover:border-gold/45 hover:text-gold-secondary";

export default function PaymentCancelPage() {
  return (
    <section className="border-b border-gold/10 bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-lg px-4 text-center sm:px-6">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.42em] text-gold/90">
          Checkout
        </p>
        <h1 className="mt-5 font-serif text-3xl tracking-tight text-cream sm:text-4xl">
          Payment not completed
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-cream/65">
          You closed Stripe checkout or the session expired. Nothing was
          charged. Your bag is still in this browser — open it anytime to try
          again.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/" className={cn(btnPrimary, "w-full sm:w-auto")}>
            Home
          </Link>
          <Link href={CONTACT_TRIP_BUILDER_HREF} className={cn(btnGhost, "w-full sm:w-auto")}>
            Contact us
          </Link>
        </div>
      </div>
    </section>
  );
}
