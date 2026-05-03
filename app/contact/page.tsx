import type { Metadata } from "next";
import Image from "next/image";

import { ContactTripBuilderScroll } from "@/components/contact-trip-builder-scroll";
import { CustomPackageWhatsApp } from "@/components/custom-package-whatsapp";
import { SectionReveal } from "@/components/section-reveal";
import { CONTACT_TRIP_BUILDER_SECTION_ID } from "@/lib/contact-hrefs";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach Blackline Miami by WhatsApp, phone, or Instagram DM — fast replies for exotic car rentals, yachts, and concierge requests.",
};

const PHONE_E164 = "17866840345";
const PHONE_DISPLAY = "+1 (786) 684-0345";
const TEL_HREF = `tel:+${PHONE_E164}`;
const WHATSAPP_HREF = `https://wa.me/${PHONE_E164}`;
/** Opens Instagram DM when logged in; profile fallback for web. */
const INSTAGRAM_DM_HREF = "https://ig.me/m/blackline_concierge";

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

function InstagramIcon({ className }: { className?: string }) {
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

export default function ContactPage() {
  return (
    <>
      <ContactTripBuilderScroll />
      <section className="relative min-h-[min(58vh,640px)] overflow-hidden border-b border-gold/10 bg-background">
        <div className="absolute inset-0 overflow-hidden">
          <div className="hero-bg-drift relative h-full w-full">
            <Image
              src="https://images.unsplash.com/photo-1764013290499-bc46136765b1?auto=format&fit=crop&q=88&w=2400"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center brightness-[0.88] contrast-[1.08] saturate-[0.92]"
            />
          </div>
          <div className="absolute inset-0 bg-[#0b0b0b]/72" aria-hidden />
          <div className="absolute inset-0 bg-charcoal/20" aria-hidden />
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b]/88 via-[#0b0b0b]/35 to-transparent"
            aria-hidden
          />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[min(58vh,640px)] max-w-7xl items-center px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
          <div className="w-full max-w-[min(44rem,100%)] text-left">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.42em] text-gold">
              Contact
            </p>
            <div className="mt-5 h-px w-14 bg-gold/35" aria-hidden />
            <h1 className="hero-headline-in mt-6 font-serif text-[2.35rem] leading-[1.12] tracking-tight text-cream sm:text-5xl md:text-[3.1rem] lg:text-[3.45rem]">
              Direct line. Fast replies.
            </h1>
            <p className="mt-4 max-w-2xl text-[0.95rem] leading-[1.65] text-cream/72 sm:text-base">
              Urgent exotic car or last-minute Miami plans? We don&apos;t route
              you through email — message or call and we&apos;ll respond as
              quickly as we can so you can confirm and move on.
            </p>
            <div className="hero-cta-in mt-9 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(btnPrimary, "sm:min-w-[240px]")}
              >
                <WhatsAppIcon className="size-5 shrink-0 text-[#0b0b0b]" />
                WhatsApp
              </a>
              <a href={TEL_HREF} className={btnOutlineStrong}>
                <PhoneIcon className="size-[1.15rem] shrink-0" />
                Call {PHONE_DISPLAY}
              </a>
            </div>
            <p className="mt-8 text-[0.7rem] font-medium uppercase tracking-[0.24em] text-cream/45 sm:mt-9">
              Same-day &amp; short-notice requests welcome
            </p>
          </div>
        </div>
      </section>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal className="border-b border-gold/10 bg-charcoal py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-xl lg:text-left">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.5em] text-gold/90">
              How to reach us
            </p>
            <div className="mx-auto mt-4 h-px w-14 bg-gold/30 lg:mx-0" aria-hidden />
            <h2 className="mt-5 font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]">
              WhatsApp, phone, or Instagram
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-cream/60 sm:text-[0.9375rem]">
              Pick the channel that fits: WhatsApp for threads and photos, a
              call for live detail — or Instagram DM if that&apos;s where you
              already spend time.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 items-stretch gap-6 sm:mt-14 lg:grid-cols-3 lg:gap-8">
            <article className="group relative flex h-full flex-col border border-gold/12 bg-[#0a0a0a]/90 p-8 shadow-[inset_0_1px_0_0_rgba(198,164,108,0.06),0_24px_64px_-24px_rgba(0,0,0,0.65)] transition-[border-color] duration-500 ease-out hover:border-gold/22 sm:p-10">
              <div
                className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent sm:inset-x-8"
                aria-hidden
              />
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.38em] text-gold/75">
                Recommended for speed
              </p>
              <h3 className="mt-4 font-serif text-xl tracking-tight text-cream sm:text-[1.35rem]">
                WhatsApp
              </h3>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-cream/58">
                Share pickup time, vehicle type, and location in one thread —
                easy for photos, flight updates, and quick confirmations.
              </p>
              <div className="mt-auto border-t border-gold/10 pt-8">
                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(btnPrimary, "w-full sm:w-auto")}
                >
                  <WhatsAppIcon className="size-5 shrink-0 text-[#0b0b0b]" />
                  Open WhatsApp
                </a>
              </div>
            </article>

            <article className="group relative flex h-full flex-col border border-gold/12 bg-[#0a0a0a]/90 p-8 shadow-[inset_0_1px_0_0_rgba(198,164,108,0.06),0_24px_64px_-24px_rgba(0,0,0,0.65)] transition-[border-color] duration-500 ease-out hover:border-gold/22 sm:p-10">
              <div
                className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent sm:inset-x-8"
                aria-hidden
              />
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.38em] text-gold/75">
                Prefer voice
              </p>
              <h3 className="mt-4 font-serif text-xl tracking-tight text-cream sm:text-[1.35rem]">
                Call
              </h3>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-cream/58">
                Need to lock something in on the spot or walk through options?
                Call us — we&apos;re used to tight turnarounds.
              </p>
              <div className="mt-auto border-t border-gold/10 pt-8">
                <a href={TEL_HREF} className={cn(btnOutlineStrong, "w-full sm:w-auto")}>
                  <PhoneIcon className="size-[1.15rem] shrink-0" />
                  {PHONE_DISPLAY}
                </a>
              </div>
            </article>

            <article className="group relative flex h-full flex-col border border-gold/12 bg-[#0a0a0a]/90 p-8 shadow-[inset_0_1px_0_0_rgba(198,164,108,0.06),0_24px_64px_-24px_rgba(0,0,0,0.65)] transition-[border-color] duration-500 ease-out hover:border-gold/22 sm:p-10">
              <div
                className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent sm:inset-x-8"
                aria-hidden
              />
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.38em] text-gold/75">
                Social &amp; casual
              </p>
              <h3 className="mt-4 font-serif text-xl tracking-tight text-cream sm:text-[1.35rem]">
                Instagram
              </h3>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-cream/58">
                Prefer DMs? Send us a message on Instagram — share moodboards,
                itinerary screenshots, or quick questions and we&apos;ll reply
                when you&apos;re on the app.
              </p>
              <div className="mt-auto border-t border-gold/10 pt-8">
                <a
                  href={INSTAGRAM_DM_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(btnOutlineStrong, "w-full sm:w-auto")}
                >
                  <InstagramIcon className="size-[1.15rem] shrink-0" />
                  Message on Instagram
                </a>
              </div>
            </article>
          </div>
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal
        id={CONTACT_TRIP_BUILDER_SECTION_ID}
        className="scroll-mt-[5.5rem] border-b border-gold/10 bg-charcoal py-16 sm:scroll-mt-24 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center lg:mx-auto lg:max-w-3xl">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.5em] text-gold/90">
              Trip builder
            </p>
            <div className="mx-auto mt-4 h-px w-14 bg-gold/30" aria-hidden />
            <h2 className="mt-5 font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]">
              Custom package — WhatsApp ready
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-cream/60 sm:text-[0.9375rem]">
              Choose cars, yachts, villas, jets, jet skis, banana boats, hosts,
              security, and more. Open WhatsApp with the generated message to
              forward in one tap.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-4xl rounded-sm border border-gold/12 bg-[#070707]/90 p-6 shadow-[inset_0_1px_0_0_rgba(198,164,108,0.06),0_24px_64px_-24px_rgba(0,0,0,0.65)] sm:p-8 lg:p-10">
            <CustomPackageWhatsApp
              idSuffix="contact"
              buildHeading="Build your package"
              buildDescription="Select what you want — the message appears below. Tap the button to open WhatsApp with this text."
              whatsAppIntroLine="Hi Blackline — I'd like a custom Miami concierge package (via contact page builder)."
            />
          </div>
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal className="border-t border-gold/15 bg-[#070707] py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto h-px w-16 bg-gold/45" aria-hidden />
            <h2 className="mt-10 font-serif text-[1.65rem] leading-[1.12] tracking-tight text-cream sm:text-3xl md:text-[2.25rem]">
              Ready when you are
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-[0.95rem] leading-relaxed text-cream/72 sm:text-lg">
              Share your dates, party size, and how quickly you need an answer —
              we&apos;ll match your pace and build options around what matters to
              you.
            </p>
          </div>
        </div>
      </SectionReveal>
    </>
  );
}
