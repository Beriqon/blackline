import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SectionReveal } from "@/components/section-reveal";
import { SERVICE_LINKS } from "@/lib/nav";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description:
    "Blackline Concierge coordinates Miami luxury end to end — yachts, private jets, exotic cars, villas, VIP nightlife, and more. One team, one line of communication.",
};

const btnPrimary =
  "inline-flex min-h-12 items-center justify-center border border-gold/40 bg-gold px-8 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#0b0b0b] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold-secondary hover:bg-gold-secondary hover:shadow-[0_0_0_1px_rgba(224,195,138,0.4),0_14px_48px_rgba(198,164,108,0.2)] active:translate-y-0";

const btnGhost =
  "inline-flex min-h-12 items-center justify-center border border-gold/25 bg-transparent px-8 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.18em] text-cream transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold/55 hover:text-gold-secondary hover:shadow-[0_0_36px_rgba(198,164,108,0.12)] active:translate-y-0";

const principles = [
  {
    title: "One team on comms",
    body: "Ground, water, air, and nights out — we route everything through a single concierge thread so you are not chasing five different vendors mid-trip.",
  },
  {
    title: "Built around your dates",
    body: "Share when you land, how many guests, and what matters most. We shape the itinerary and swap elements until it fits — nothing is one-size-fits-all.",
  },
  {
    title: "Discretion by default",
    body: "From chauffeured transfers to table reservations, we keep coordination tight and professional — so you can focus on the experience, not the logistics.",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <section className="relative min-h-[min(52vh,560px)] overflow-hidden border-b border-gold/10 bg-background">
        <div className="absolute inset-0 overflow-hidden">
          <div className="hero-bg-drift relative h-full w-full">
            <Image
              src="https://images.unsplash.com/photo-1669815503102-7c417112b3eb?auto=format&fit=crop&q=88&w=2400"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-[center_42%] brightness-[0.82] contrast-[1.08] saturate-[0.92]"
            />
          </div>
          <div className="absolute inset-0 bg-[#0b0b0b]/74" aria-hidden />
          <div className="absolute inset-0 bg-charcoal/18" aria-hidden />
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b]/90 via-[#0b0b0b]/45 to-transparent"
            aria-hidden
          />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[min(52vh,560px)] max-w-7xl items-center px-4 py-14 sm:px-6 sm:py-16 lg:px-10">
          <div className="w-full max-w-[min(40rem,100%)] text-left">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.42em] text-gold">
              About
            </p>
            <div className="mt-5 h-px w-14 bg-gold/35" aria-hidden />
            <h1 className="hero-headline-in mt-6 font-serif text-[2.2rem] leading-[1.12] tracking-tight text-cream sm:text-5xl md:text-[3rem] lg:text-[3.35rem]">
              Miami luxury, coordinated end to end.
            </h1>
            <p className="mt-4 max-w-2xl text-[0.95rem] leading-[1.65] text-cream/72 sm:text-base">
              Blackline Concierge is a Miami-based team that plans and runs
              high-touch trips — from wheels and water to stays and VIP
              nightlife — so you spend less time coordinating and more time in
              the moment.
            </p>
          </div>
        </div>
      </section>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal
        className="border-b border-gold/10 bg-charcoal py-14 sm:py-16 lg:py-20"
        aria-labelledby="about-story-heading"
      >
        <div className="mx-auto max-w-7xl px-4 text-left sm:px-6 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.48em] text-gold/90">
              Who we are
            </p>
            <div className="mt-4 h-px w-12 bg-gold/30" aria-hidden />
            <h2
              id="about-story-heading"
              className="mt-6 font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]"
            >
              One concierge. Every moving part.
            </h2>
            <div className="mt-8 space-y-5 text-sm leading-relaxed text-cream/58 sm:text-[0.9375rem]">
              <p>
                Visitors come to Miami for the cars, the yachts, the villas, and
                the nights out — but pulling it together usually means juggling
                separate contacts, timing, and last-minute changes. We built
                Blackline around the opposite idea:{" "}
                <span className="text-cream/78">
                  one trusted team that speaks to everyone on your behalf
                </span>
                , keeps the plan coherent, and adjusts when your group does.
              </p>
              <p>
                Whether you need a self-drive exotic, a crewed charter, a private
                residence, aviation, or a table when the room is hard to book, we
                route requests through a single line — text or call — so you
                always know who is handling what.
              </p>
            </div>
          </div>
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal
        className="border-b border-gold/10 bg-background py-14 sm:py-16 lg:py-20"
        aria-labelledby="about-services-heading"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.48em] text-gold/90">
            What we coordinate
          </p>
          <div className="mt-4 h-px w-12 bg-gold/30" aria-hidden />
          <h2
            id="about-services-heading"
            className="mt-6 max-w-2xl font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]"
          >
            Services under one roof
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-cream/52 sm:text-[0.9375rem]">
            Explore each offering in detail — or tell us your occasion and
            we&apos;ll propose the right mix.
          </p>

          <ul
            className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4"
            role="list"
          >
            {SERVICE_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex items-center justify-between gap-3 border border-gold/12 bg-[#0a0a0a]/85 px-4 py-3.5 text-sm text-cream/88 transition-[border-color,background-color] duration-300 hover:border-gold/28 hover:bg-[#0d0d0d] sm:px-5 sm:py-4"
                >
                  <span className="font-medium tracking-wide">{item.label}</span>
                  <span
                    className="text-gold/45 transition-colors group-hover:text-gold-secondary"
                    aria-hidden
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-4 border-t border-gold/10 pt-10">
            <Link href="/services" className={btnGhost}>
              All services
            </Link>
            <Link href="/packages" className={btnGhost}>
              View packages
            </Link>
          </div>
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal className="border-b border-gold/10 bg-charcoal py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.48em] text-gold/90">
            How we work
          </p>
          <div className="mt-4 h-px w-12 bg-gold/30" aria-hidden />
          <h2 className="mt-6 font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]">
            Principles that shape every itinerary
          </h2>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3 lg:gap-12">
            {principles.map((p) => (
              <article
                key={p.title}
                className="border-l border-gold/22 pl-6 sm:pl-7"
              >
                <h3 className="font-serif text-lg tracking-tight text-cream sm:text-[1.15rem]">
                  {p.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-cream/52 sm:text-[0.9375rem]">
                  {p.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal className="border-b border-gold/10 bg-background py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.48em] text-gold/90">
            Miami
          </p>
          <div className="mt-4 h-px w-12 bg-gold/30" aria-hidden />
          <h2 className="mt-6 font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]">
            Rooted in the city we operate in
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-cream/58 sm:text-[0.9375rem]">
            We focus on Miami and South Florida — the marinas, airports, venues,
            and seasonal rhythms — so routing, timing, and backup plans reflect
            how the city actually moves. When plans shift, we&apos;re already
            thinking about the next best option on the ground.
          </p>
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal className="relative overflow-hidden border-b border-gold/10 bg-[#070707] py-16 sm:py-20 lg:py-24">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(198,164,108,0.08),transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-[1.65rem] leading-snug tracking-tight text-cream sm:text-3xl md:text-[2.1rem]">
            Ready to plan your stay?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-cream/55 sm:text-[0.9375rem]">
            Share your dates and what you want to experience — we&apos;ll reply
            with next steps and a tailored outline.
          </p>
          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link href="/contact" className={cn(btnPrimary, "sm:min-w-[220px]")}>
              Contact us
            </Link>
            <Link href="/experiences" className={btnGhost}>
              Experiences gallery
            </Link>
          </div>
        </div>
      </SectionReveal>
    </>
  );
}
