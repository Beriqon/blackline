import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Phone } from "lucide-react";

import { SectionReveal } from "@/components/section-reveal";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "ATV — Book now",
  description:
    "Off-road ATV rides with Blackline are available to book and ride now. Full service details on this page are still coming—reach us on Instagram, WhatsApp, or phone to reserve.",
};

const PHONE_E164 = "17866840345";
const PHONE_DISPLAY = "+1 (786) 684-0345";
const TEL_HREF = `tel:+${PHONE_E164}`;
const WHATSAPP_HREF = `https://wa.me/${PHONE_E164}?text=${encodeURIComponent(
  "Hi Blackline — I'd like to book an ATV experience. Can you share availability?",
)}`;
const INSTAGRAM_HREF = "https://www.instagram.com/blackline_concierge/";

const ATV_PHOTOS = [
  {
    src: "/atv/atv1.webp",
    alt: "ATV ride on an off-road trail",
  },
  {
    src: "/atv/atv2.webp",
    alt: "ATV in motion across rough terrain",
  },
  {
    src: "/atv/atv3.webp",
    alt: "ATV preview — Blackline off-road experience",
  },
] as const;

const btnPrimary =
  "inline-flex min-h-12 items-center justify-center gap-2.5 border border-gold/40 bg-gold px-7 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#0b0b0b] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold-secondary hover:bg-gold-secondary hover:shadow-[0_0_0_1px_rgba(224,195,138,0.4),0_14px_48px_rgba(198,164,108,0.2)] active:translate-y-0";

const btnGhost =
  "inline-flex min-h-12 items-center justify-center gap-2.5 border border-gold/35 bg-transparent px-7 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.2em] text-cream transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold/65 hover:text-gold-secondary hover:shadow-[0_0_36px_rgba(198,164,108,0.14)] active:translate-y-0";

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

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l.6.955-1.003 3.667 3.382-.881zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413z"/>
    </svg>
  );
}

export default function AtvPage() {
  return (
    <>
      <section className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden border-b border-gold/10 bg-background">
        <div className="absolute inset-0 -z-10">
          <div className="hero-bg-drift relative h-full w-full">
            <Image
              src={ATV_PHOTOS[0].src}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center brightness-[0.42] contrast-[1.1] saturate-[0.85]"
            />
          </div>
          <div className="absolute inset-0 bg-[#0b0b0b]/72" aria-hidden />
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#0b0b0b]/55 via-[#0b0b0b]/35 to-[#0b0b0b]/85"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_45%,rgba(198,164,108,0.10),transparent_70%)]"
            aria-hidden
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-24 text-center sm:px-6 sm:py-28 lg:px-10 lg:py-32">
          <p className="inline-flex items-center gap-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.5em] text-gold">
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold shadow-[0_0_0_4px_rgba(198,164,108,0.18)]"
              aria-hidden
            />
            Rides available now
          </p>

          <div
            className="mx-auto mt-6 h-px w-16 bg-gradient-to-r from-transparent via-gold/55 to-transparent"
            aria-hidden
          />

          <h1 className="hero-headline-in mt-8 font-serif text-[3rem] leading-[0.95] tracking-tight text-cream sm:text-[4.25rem] md:text-[5.5rem] lg:text-[6.75rem]">
            ATV
          </h1>

          <p className="mt-6 font-serif text-xl italic tracking-tight text-gold-secondary sm:text-2xl md:text-[1.75rem]">
            Book & ride today
          </p>

          <p className="mx-auto mt-8 max-w-2xl text-[0.95rem] leading-[1.7] text-cream/72 sm:text-base md:text-[1.05rem]">
            You can book and head out on off-road ATV experiences with Blackline
            right now through our concierge. What&apos;s still coming is the full
            online breakdown—routes, rates, and richer info on this page—so
            reach out to lock in a ride and plan it with the rest of your Miami
            itinerary.
          </p>

          <div className="mt-10 inline-flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="#book-now"
              className={cn(btnPrimary, "sm:min-w-[220px]")}
            >
              Book through concierge
            </Link>
            <Link href="/services" className={btnGhost}>
              Other services
            </Link>
          </div>

          <p className="mt-12 text-[0.7rem] font-medium uppercase tracking-[0.32em] text-cream/40">
            Scroll for more info ↓
          </p>
        </div>
      </section>

      <SectionReveal
        id="book-now"
        className="scroll-mt-[5.5rem] border-b border-gold/10 bg-charcoal py-20 sm:py-24 lg:py-28"
        aria-labelledby="book-now-heading"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-16">
            <div className="order-2 lg:order-1">
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.5em] text-gold/90">
                More info
              </p>
              <div className="mt-4 h-px w-14 bg-gold/35" aria-hidden />
              <h2
                id="book-now-heading"
                className="mt-6 font-serif text-3xl leading-[1.05] tracking-tight text-cream sm:text-[2.4rem] md:text-[2.75rem]"
              >
                Book ATV today — through our concierge
              </h2>
              <p className="mt-5 text-[0.95rem] leading-[1.7] text-cream/68 sm:text-base">
                Rides are available to reserve and ride today through concierge.
                Self-serve checkout and the full breakdown on this page will land
                as we publish everything—until then our team locks in dates, group
                sizes, and your itinerary with the same response time and one
                Miami thread.
              </p>

              <ul
                className="mt-8 space-y-3.5 border-y border-gold/10 py-7"
                role="list"
              >
                {[
                  "Reach out via Instagram, WhatsApp, or phone",
                  "Tell us your date, group size, and ride window",
                  "We confirm operator, route, and timing for you",
                  "Pair with chauffeur transfer, villas, yachts, or nightlife",
                ].map((line) => (
                  <li key={line} className="flex gap-3.5">
                    <span
                      className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-gold/55 shadow-[0_0_0_3px_rgba(198,164,108,0.08)]"
                      aria-hidden
                    />
                    <span className="text-[0.9rem] leading-snug text-cream/78 sm:text-[0.9375rem]">
                      {line}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-3.5">
                <a
                  href={INSTAGRAM_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(btnPrimary, "sm:min-w-[200px]")}
                >
                  <InstagramGlyph className="size-[1.05rem]" />
                  Instagram
                </a>
                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(btnGhost, "sm:min-w-[200px]")}
                >
                  <WhatsAppGlyph className="size-[1.05rem]" />
                  WhatsApp
                </a>
                <a
                  href={TEL_HREF}
                  className={cn(btnGhost, "sm:min-w-[200px]")}
                >
                  <Phone className="size-[1rem]" strokeWidth={1.85} aria-hidden />
                  Call us
                </a>
              </div>

              <p className="mt-6 text-[0.78rem] tracking-wide text-cream/45">
                Direct line:{" "}
                <a
                  href={TEL_HREF}
                  className="text-cream/75 underline-offset-4 transition-colors hover:text-gold-secondary hover:underline"
                >
                  {PHONE_DISPLAY}
                </a>
              </p>
            </div>

            <div className="order-1 lg:order-2 lg:sticky lg:top-24">
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <div className="relative col-span-2 aspect-[16/10] overflow-hidden border border-gold/12 bg-[#0a0a0a]">
                  <Image
                    src={ATV_PHOTOS[1].src}
                    alt={ATV_PHOTOS[1].alt}
                    fill
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b0b0b]/55 via-transparent to-transparent"
                    aria-hidden
                  />
                </div>
                <div className="relative aspect-square overflow-hidden border border-gold/12 bg-[#0a0a0a]">
                  <Image
                    src={ATV_PHOTOS[0].src}
                    alt={ATV_PHOTOS[0].alt}
                    fill
                    sizes="(min-width: 1024px) 22vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
                  />
                </div>
                <div className="relative aspect-square overflow-hidden border border-gold/12 bg-[#0a0a0a]">
                  <Image
                    src={ATV_PHOTOS[2].src}
                    alt={ATV_PHOTOS[2].alt}
                    fill
                    sizes="(min-width: 1024px) 22vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            className="mt-20 border-t border-gold/10 pt-14 sm:mt-24 sm:pt-16"
            aria-labelledby="riders-heading"
          >
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.5em] text-gold/90">
                Group sizes
              </p>
              <div
                className="mx-auto mt-4 h-px w-14 bg-gold/35"
                aria-hidden
              />
              <h3
                id="riders-heading"
                className="mt-6 font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]"
              >
                How many riders per vehicle?
              </h3>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-cream/60 sm:text-[0.9375rem]">
                Choose the configuration that fits your group — solo, duo, or
                squad. Final vehicle count is confirmed when you book.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {[
                {
                  eyebrow: "Solo / Duo",
                  vehicle: "ATV",
                  count: "1–2",
                  countLabel: "riders",
                  description: "1–2 riders per ATV — share or ride solo.",
                },
                {
                  eyebrow: "Squad",
                  vehicle: "UTV · 2 seats",
                  count: "2",
                  countLabel: "riders",
                  description: "2 riders per UTV — side-by-side seating.",
                },
                {
                  eyebrow: "Squad",
                  vehicle: "UTV · 3–4 seats",
                  count: "3–4",
                  countLabel: "riders",
                  description: "3–4 riders per UTV — bigger groups together.",
                },
              ].map((option) => (
                <article
                  key={`${option.eyebrow}-${option.vehicle}`}
                  className="group relative flex flex-col border border-gold/12 bg-[#0a0a0a]/85 p-6 shadow-[inset_0_1px_0_0_rgba(198,164,108,0.06),0_24px_64px_-32px_rgba(0,0,0,0.65)] transition-[border-color,transform] duration-500 ease-out hover:-translate-y-0.5 hover:border-gold/28 sm:p-7"
                >
                  <div
                    className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent sm:inset-x-7"
                    aria-hidden
                  />
                  <p className="text-[0.62rem] font-medium uppercase tracking-[0.38em] text-gold/75">
                    {option.eyebrow}
                  </p>
                  <p className="mt-3 font-serif text-lg tracking-tight text-cream sm:text-xl">
                    {option.vehicle}
                  </p>
                  <div className="mt-6 flex items-baseline gap-2 border-t border-gold/10 pt-6">
                    <span className="font-serif text-4xl tabular-nums tracking-tight text-gold-secondary sm:text-[2.5rem]">
                      {option.count}
                    </span>
                    <span className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-cream/50">
                      {option.countLabel}
                    </span>
                  </div>
                  <p className="mt-4 text-[0.875rem] leading-snug text-cream/65 sm:text-[0.9rem]">
                    {option.description}
                  </p>
                </article>
              ))}
            </div>

            <p className="mx-auto mt-8 max-w-xl text-center text-[0.78rem] tracking-wide text-cream/45">
              Tell us your group size when you message — we&apos;ll confirm
              the right ATV/UTV mix.
            </p>
          </div>
        </div>
      </SectionReveal>
    </>
  );
}
