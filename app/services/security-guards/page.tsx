import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SecurityAddToCartInline } from "@/components/security-add-to-cart-inline";
import { SectionReveal } from "@/components/section-reveal";
import { CONTACT_TRIP_BUILDER_HREF } from "@/lib/contact-hrefs";
import { SECURITY_GUARD_RATE_CARDS } from "@/lib/security-guards-data";
import { SERVICE_LINKS } from "@/lib/nav";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Security guards",
  description:
    "Licensed armed and unarmed bodyguards for Miami events, venues, and private travel — hourly rates with minimum booking through Blackline.",
};

const btnPrimary =
  "inline-flex min-h-11 items-center justify-center border border-gold/40 bg-gold px-8 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#0b0b0b] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold-secondary hover:bg-gold-secondary hover:shadow-[0_0_0_1px_rgba(224,195,138,0.4),0_14px_48px_rgba(198,164,108,0.2)] active:translate-y-0";

const btnOutlineStrong =
  "inline-flex min-h-12 items-center justify-center border-2 border-gold/50 bg-transparent px-8 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.2em] text-gold transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold hover:bg-gold/10 hover:text-gold-secondary hover:shadow-[0_0_40px_rgba(198,164,108,0.14)] active:translate-y-0";

const cardClass =
  "group relative flex flex-col border border-gold/12 bg-[#0a0a0a]/90 p-8 shadow-[inset_0_1px_0_0_rgba(198,164,108,0.06),0_24px_64px_-24px_rgba(0,0,0,0.65)] transition-[border-color] duration-500 ease-out hover:border-gold/22 sm:p-10";

const pairWithServices = SERVICE_LINKS.filter(
  (s) => s.href !== "/services/security-guards",
);

export default function SecurityGuardsPage() {
  return (
    <>
      <section className="relative min-h-[min(56vh,600px)] overflow-hidden border-b border-gold/10 bg-background">
        <div className="absolute inset-0 overflow-hidden">
          <div className="hero-bg-drift relative h-full w-full">
            <Image
              src="https://images.unsplash.com/photo-1541976600-713941381a34?auto=format&fit=crop&q=88&w=2400"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-[center_38%] brightness-[0.52] contrast-[1.06] saturate-[0.88]"
            />
          </div>
          <div className="absolute inset-0 bg-[#0b0b0b]/76" aria-hidden />
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b]/92 via-[#0b0b0b]/5 to-transparent"
            aria-hidden
          />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[min(56vh,600px)] max-w-7xl items-end px-4 pb-14 pt-28 sm:px-6 sm:pb-16 sm:pt-32 lg:px-10 lg:pb-20">
          <div className="max-w-[min(40rem,100%)]">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.42em] text-gold">
              Personal protection
            </p>
            <div className="mt-5 h-px w-14 bg-gold/35" aria-hidden />
            <h1 className="hero-headline-in mt-6 font-serif text-[1.85rem] leading-[1.12] tracking-tight text-cream sm:text-4xl md:text-[2.65rem] lg:text-[2.95rem]">
              Security guards
            </h1>
            <p className="mt-5 max-w-2xl text-[0.95rem] leading-[1.65] text-cream/75 sm:text-base">
              Armed and unarmed bodyguards for Miami — nights out, private
              events, estate stays, and high-traffic days when you want
              professional coverage on your schedule. We book through the same
              concierge team as your cars, yachts, and tables.
            </p>
            <div className="hero-cta-in mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Link href={CONTACT_TRIP_BUILDER_HREF} className={cn(btnPrimary, "sm:min-w-[200px]")}>
                Request coverage
              </Link>
              <a href="#rates" className={btnOutlineStrong}>
                View rates
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal
        id="rates"
        className="scroll-mt-[5.5rem] border-b border-gold/10 bg-charcoal py-16 sm:py-20 lg:py-24"
        aria-labelledby="rates-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-3xl lg:text-left">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.5em] text-gold/90">
              Hourly rates
            </p>
            <div
              className="mx-auto mt-4 h-px w-14 bg-gold/30 lg:mx-0"
              aria-hidden
            />
            <h2
              id="rates-heading"
              className="mt-5 font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]"
            >
              Unarmed and armed bodyguards
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-cream/60 sm:text-[0.9375rem]">
              Choose the level of protection that fits your itinerary and venue
              requirements. All bookings run a minimum of four hours per guard.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-8">
            {SECURITY_GUARD_RATE_CARDS.map((r) => (
              <article
                key={r.id}
                className={cn(cardClass, "scroll-mt-[5.5rem]")}
                aria-labelledby={`${r.id}-title`}
              >
                <div
                  className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent sm:inset-x-8"
                  aria-hidden
                />
                <p className="text-[0.62rem] font-medium uppercase tracking-[0.38em] text-gold/75">
                  {r.eyebrow}
                </p>
                <h3
                  id={`${r.id}-title`}
                  className="mt-4 font-serif text-xl tracking-tight text-cream sm:text-[1.45rem]"
                >
                  {r.title}
                </h3>
                <div className="mt-6 flex flex-wrap items-baseline gap-3 border-b border-gold/10 pb-6">
                  <span className="font-serif text-3xl tabular-nums tracking-tight text-gold-secondary sm:text-[2.15rem]">
                    {r.price}
                  </span>
                  <span className="text-[0.8125rem] font-medium uppercase tracking-[0.2em] text-cream/45">
                    {r.minimum}
                  </span>
                </div>
                <ul className="mt-6 space-y-4" role="list">
                  {r.lines.map((line) => (
                    <li key={line} className="flex gap-3.5">
                      <span
                        className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-gold/50 shadow-[0_0_0_3px_rgba(198,164,108,0.08)]"
                        aria-hidden
                      />
                      <span className="text-[0.875rem] leading-snug text-cream/78 sm:text-[0.9375rem]">
                        {line}
                      </span>
                    </li>
                  ))}
                </ul>
                <SecurityAddToCartInline
                  item={{
                    category: r.category,
                    id: r.id,
                    title: r.cartTitle,
                    subtitle: r.minimum,
                    priceHint: `${r.price} (per guard)`,
                    href: "/services/security-guards#rates",
                  }}
                />
              </article>
            ))}
          </div>
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal className="border-b border-gold/10 bg-background py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-3xl lg:text-left">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.5em] text-gold/90">
              Pair with your trip
            </p>
            <div
              className="mx-auto mt-4 h-px w-14 bg-gold/30 lg:mx-0"
              aria-hidden
            />
            <h2 className="mt-5 font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]">
              Layer protection onto any Blackline booking
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-cream/60 sm:text-[0.9375rem]">
              Security is quoted alongside the experiences you already hold with
              us — same thread, aligned timing.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {pairWithServices.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="group flex items-center justify-between gap-4 border border-gold/12 bg-[#0a0a0a]/80 px-5 py-4 transition-[border-color,box-shadow] duration-300 ease-out hover:border-gold/28 hover:shadow-[0_0_0_1px_rgba(198,164,108,0.08)]"
              >
                <span className="text-sm font-medium tracking-wide text-cream/90">
                  {s.label}
                </span>
                <span
                  className="shrink-0 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-gold/80 transition group-hover:text-gold-secondary"
                  aria-hidden
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </SectionReveal>
    </>
  );
}
