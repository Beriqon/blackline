import type { Metadata } from "next";
import Image from "next/image";

import { SectionReveal } from "@/components/section-reveal";
import { VipFeaturedVenuesGrid } from "@/components/vip-featured-venues-grid";
import {
  vipFeaturedVenues,
  vipNightlifeHero,
  vipNightlifeIntro,
  vipTableRequestHints,
  vipTransport,
} from "@/lib/vip-nightlife-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "VIP nightlife",
  description:
    "VIP tables and preferred entry at Miami's top nightclubs and beach clubs — coordinated with Blackline Miami.",
};

const PHONE_E164 = "17866840345";
const PHONE_DISPLAY = "+1 (786) 684-0345";
const TEL_HREF = `tel:+${PHONE_E164}`;
const WHATSAPP_HREF = `https://wa.me/${PHONE_E164}`;
const INSTAGRAM_HREF = "https://www.instagram.com/blackline_concierge/";

const btnPrimary =
  "inline-flex min-h-12 items-center justify-center gap-2.5 border border-gold/40 bg-gold px-8 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#0b0b0b] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold-secondary hover:bg-gold-secondary hover:shadow-[0_0_0_1px_rgba(224,195,138,0.4),0_14px_48px_rgba(198,164,108,0.2)] active:translate-y-0";

const btnOutlineStrong =
  "inline-flex min-h-12 items-center justify-center gap-2.5 border-2 border-gold/50 bg-transparent px-8 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.2em] text-gold transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold hover:bg-gold/10 hover:text-gold-secondary hover:shadow-[0_0_40px_rgba(198,164,108,0.14)] active:translate-y-0";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export default function VipNightlifePage() {
  return (
    <>
      <section className="relative min-h-[min(56vh,600px)] overflow-hidden border-b border-gold/10 bg-background">
        <div className="absolute inset-0 overflow-hidden">
          <div className="hero-bg-drift relative h-full w-full">
            <Image
              src="https://images.unsplash.com/photo-1571266028243-e741f154e58e?auto=format&fit=crop&q=88&w=2400"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center brightness-[0.55] contrast-[1.05] saturate-[0.85]"
            />
          </div>
          <div className="absolute inset-0 bg-[#0b0b0b]/78" aria-hidden />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b]/95 via-[#0b0b0b]/45 to-[#0b0b0b]/25" aria-hidden />
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b]/90 via-[#0b0b0b]/55 to-transparent"
            aria-hidden
          />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[min(56vh,600px)] max-w-7xl items-end px-4 pb-14 pt-28 sm:px-6 sm:pb-16 sm:pt-32 lg:px-10 lg:pb-20">
          <div className="max-w-[min(40rem,100%)]">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.42em] text-gold">
              {vipNightlifeHero.eyebrow}
            </p>
            <div className="mt-5 h-px w-14 bg-gold/35" aria-hidden />
            <h1 className="hero-headline-in mt-6 font-serif text-[1.85rem] leading-[1.12] tracking-tight text-cream sm:text-4xl md:text-[2.65rem] lg:text-[2.95rem]">
              {vipNightlifeHero.headline}
            </h1>
            <p className="mt-5 max-w-2xl text-[0.95rem] leading-[1.65] text-cream/75 sm:text-base">
              {vipNightlifeHero.lead}
            </p>
            <div className="hero-cta-in mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(btnPrimary, "sm:min-w-[220px]")}
              >
                <WhatsAppIcon className="size-5 shrink-0 text-[#0b0b0b]" />
                Book on WhatsApp
              </a>
              <a href="#venues" className={btnOutlineStrong}>
                View venues
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal
        id="venues"
        className="border-b border-gold/10 bg-background py-16 sm:py-20 lg:py-24"
        aria-labelledby="venues-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-3xl lg:text-left">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.5em] text-gold/90">
              VIP venues
            </p>
            <div
              className="mx-auto mt-4 h-px w-14 bg-gold/30 lg:mx-0"
              aria-hidden
            />
            <h2
              id="venues-heading"
              className="mt-5 font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]"
            >
              Nightclubs first — beach clubs when you want day-to-night
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-cream/55 sm:text-[0.9375rem]">
              We focus on luxury Miami nightclubs for tables and entry; when you
              want pool-deck or sand-between-the-toes energy, we line up beach
              club access with the same coordination. Lineup shifts by season —
              ask us what&apos;s strongest for your dates.
            </p>
            <p className="mt-3 max-w-2xl text-[0.7rem] leading-relaxed text-cream/42 sm:text-xs">
              Open any venue for a short write-up and extra mood shots — stock
              placeholders for now; we can swap in your licensed venue
              photography anytime.
            </p>
          </div>

          <VipFeaturedVenuesGrid venues={vipFeaturedVenues} />
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal className="border-b border-gold/10 bg-charcoal py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="max-w-3xl text-left">
            <p className="text-[0.62rem] font-medium uppercase tracking-[0.5em] text-gold/90">
              Why book through us
            </p>
            <div className="mt-3 h-px w-12 bg-gold/30" aria-hidden />
            <h2 className="mt-3 font-serif text-xl tracking-tight text-cream sm:text-2xl">
              Solid plans. Real relationships.
            </h2>
            <div className="mt-4 space-y-3 text-[0.8125rem] leading-[1.55] text-cream/58 sm:text-sm sm:leading-relaxed">
              {vipNightlifeIntro.map((p, i) => (
                <p key={`intro-${i}`}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal className="border-b border-gold/10 bg-background py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-14">
            <div>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.48em] text-gold/95">
                Move as a group
              </p>
              <div className="mt-4 h-px w-14 bg-gold/35" aria-hidden />
              <h2 className="mt-6 font-serif text-2xl tracking-tight text-cream sm:text-3xl">
                {vipTransport.title}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-cream/58 sm:text-[0.9375rem]">
                {vipTransport.lead}
              </p>
              <p className="mt-6 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-gold/80">
                {vipTransport.minimum}
              </p>
            </div>

            <ul
              className="relative border border-gold/12 bg-[#0a0a0a]/85 p-6 shadow-[inset_0_1px_0_0_rgba(198,164,108,0.06)] sm:p-8"
              role="list"
            >
              <div
                className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent sm:inset-x-8"
                aria-hidden
              />
              {vipTransport.options.map((line) => (
                <li
                  key={line}
                  className="border-t border-gold/[0.09] py-4 first:border-t-0 first:pt-0 first:pb-4"
                >
                  <div className="flex gap-3.5">
                    <span
                      className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-gold/50 shadow-[0_0_0_3px_rgba(198,164,108,0.08)]"
                      aria-hidden
                    />
                    <span className="text-[0.9375rem] leading-snug tracking-wide text-cream/80">
                      {line}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal className="relative overflow-hidden border-b border-gold/10 bg-charcoal py-16 sm:py-20 lg:py-24">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-15%,rgba(198,164,108,0.065),transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:max-w-2xl lg:text-left">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.48em] text-gold/95">
              VIP table request
            </p>
            <div
              className="mx-auto mt-5 h-px w-16 bg-gradient-to-r from-transparent via-gold/45 to-transparent lg:mx-0 lg:from-gold/35 lg:via-gold/45 lg:to-transparent lg:w-20"
              aria-hidden
            />
            <h2 className="mt-8 font-serif text-[1.75rem] leading-[1.15] tracking-tight text-cream sm:text-3xl md:text-[2.1rem]">
              Tell us what you&apos;re planning
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-cream/52 sm:text-[0.9375rem] lg:mx-0">
              We don&apos;t use a web form — message or call and we&apos;ll
              reply as soon as we can. Include the details below so we can move
              faster.
            </p>
          </div>

          <ul
            className="relative mx-auto mt-12 max-w-2xl space-y-0 border border-gold/12 bg-[#0a0a0a]/80 px-6 py-2 shadow-[inset_0_1px_0_0_rgba(198,164,108,0.06)] sm:px-8 sm:py-3 lg:mx-0"
            role="list"
          >
            {vipTableRequestHints.map((item) => (
              <li
                key={item}
                className="border-t border-gold/[0.09] py-5 first:border-t-0 first:pt-5"
              >
                <div className="flex gap-3.5">
                  <span
                    className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-gold/50 shadow-[0_0_0_3px_rgba(198,164,108,0.08)]"
                    aria-hidden
                  />
                  <span className="text-[0.9375rem] font-normal leading-snug tracking-wide text-cream/78">
                    {item}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-12 flex flex-col items-stretch gap-3 sm:mt-14 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 lg:justify-start">
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(btnPrimary, "justify-center sm:min-w-[240px]")}
            >
              <WhatsAppIcon className="size-5 shrink-0 text-[#0b0b0b]" />
              WhatsApp
            </a>
            <a
              href={INSTAGRAM_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className={btnOutlineStrong}
            >
              <InstagramGlyph className="size-[1.15rem] shrink-0" />
              Instagram
            </a>
            <a href={TEL_HREF} className={btnOutlineStrong}>
              <PhoneIcon className="size-[1.15rem] shrink-0" />
              Call {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </SectionReveal>
    </>
  );
}
