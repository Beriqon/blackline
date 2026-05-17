"use client";

import Image from "next/image";
import Link from "next/link";

import { ClientMomentsCarousel } from "@/components/client-moments-carousel";
import { HomeServicesShowcase } from "@/components/home-services-showcase";
import { useTranslations } from "@/components/locale-provider";
import { SectionReveal } from "@/components/section-reveal";
import { CONTACT_TRIP_BUILDER_HREF } from "@/lib/contact-hrefs";
import { cn } from "@/lib/utils";
import { PHOTOGRAPHER_SHOOT_SLIDES } from "@/lib/photographer-shoots-data";

const btnPrimary =
  "inline-flex min-h-11 items-center justify-center border border-gold/40 bg-gold px-8 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#0b0b0b] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold-secondary hover:bg-gold-secondary hover:shadow-[0_0_0_1px_rgba(224,195,138,0.4),0_14px_48px_rgba(198,164,108,0.2)] active:translate-y-0";

const btnPrimaryLg =
  "inline-flex min-h-12 items-center justify-center border border-gold bg-gold px-8 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#0b0b0b] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold-secondary hover:bg-gold-secondary hover:shadow-[0_0_0_1px_rgba(224,195,138,0.4),0_14px_48px_rgba(198,164,108,0.2)] active:translate-y-0";

const btnGhost =
  "inline-flex min-h-11 items-center justify-center border border-gold/25 bg-transparent px-8 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-cream transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold/55 hover:text-gold-secondary hover:shadow-[0_0_36px_rgba(198,164,108,0.12)] active:translate-y-0 sm:min-w-[220px]";

const btnOutlineStrong =
  "inline-flex min-h-12 items-center justify-center border-2 border-gold/50 bg-transparent px-8 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.2em] text-gold transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold hover:bg-gold/10 hover:text-gold-secondary hover:shadow-[0_0_40px_rgba(198,164,108,0.14)] active:translate-y-0";

export default function HomePage() {
  const t = useTranslations();

  const featuredExperienceItems = [
    t("home.featured1"),
    t("home.featured2"),
    t("home.featured3"),
    t("home.featured4"),
    t("home.featured5"),
    t("home.featured6"),
  ];

  const socialProofQuotes = [
    { quote: t("home.quote1"), attribution: t("home.quote1Attr") },
    { quote: t("home.quote2"), attribution: t("home.quote2Attr") },
  ];

  const heroStats = [
    { value: t("home.statExperiencesValue"), label: t("home.statExperiences") },
    { value: t("home.statAccessValue"), label: t("home.statAccess") },
    { value: t("home.statNetworkValue"), label: t("home.statNetwork") },
  ];

  const realtimeProofItems = [
    t("home.proofPriority"),
    t("home.proofRates"),
    t("home.proofLastMinute"),
    t("home.proofItinerary"),
    t("home.proofContact"),
    t("home.proofDiscreet"),
    t("home.proofArrivals"),
    t("home.proofNetwork"),
    t("home.proofOnCall"),
    t("home.proofSync"),
  ];

  const beforeAfterItems = [
    {
      title: t("home.withoutTitle"),
      points: [t("home.without1"), t("home.without2"), t("home.without3")],
      highlight: false,
    },
    {
      title: t("home.withTitle"),
      points: [t("home.with1"), t("home.with2"), t("home.with3")],
      highlight: true,
    },
  ];

  return (
    <>
      <section className="relative min-h-[min(82vh,880px)] overflow-hidden border-b border-gold/10 bg-background">
        <div className="absolute inset-0 overflow-hidden">
          <div className="hero-bg-drift relative h-full w-full">
            <Image
              src="https://images.unsplash.com/photo-1690398388394-6a57f7f4fff1?auto=format&fit=crop&q=88&w=2400"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center brightness-[0.93] contrast-[1.06] saturate-[0.92]"
            />
          </div>
          <div className="absolute inset-0 bg-[#0b0b0b]/68" aria-hidden />
          <div className="absolute inset-0 bg-charcoal/22" aria-hidden />
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b]/78 via-[#0b0b0b]/28 to-transparent"
            aria-hidden
          />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[min(82vh,880px)] max-w-7xl items-center px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
          <div className="w-full max-w-[min(52rem,100%)] text-left">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.42em] text-gold">
              {t("home.eyebrow")}
            </p>
            <div className="mt-5 h-px w-14 bg-gold/35" aria-hidden />
            <h1 className="hero-headline-in mt-6 font-serif text-[2.55rem] leading-[1.12] tracking-tight text-cream sm:text-5xl md:text-[3.25rem] lg:text-[3.85rem] xl:text-[4.1rem]">
              {t("home.headline")}
            </h1>
            <p className="mt-3 max-w-2xl text-[0.95rem] leading-[1.65] text-cream/72 sm:text-base">
              {t("home.heroBody")}
            </p>
            <div className="hero-cta-in mt-9 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Link href={CONTACT_TRIP_BUILDER_HREF} className={cn(btnPrimary, "sm:min-w-[220px]")}>
                {t("common.bookYourExperience")}
              </Link>
              <Link href="/services" className={btnGhost}>
                {t("common.viewServices")}
              </Link>
            </div>
            <div className="mt-7 border-t border-gold/18 pt-4 sm:mt-8 sm:pt-5">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-gold/88">
                {t("home.trustedBy")}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.62rem] font-medium uppercase tracking-[0.2em] text-cream/58 sm:gap-x-4 sm:text-[0.64rem]">
                {heroStats.map((stat, idx) => (
                  <span key={stat.label} className="inline-flex items-center gap-3">
                    <span className="text-gold-secondary">{stat.value}</span>
                    <span>{stat.label}</span>
                    {idx < heroStats.length - 1 ? (
                      <span className="text-gold/35" aria-hidden>
                        •
                      </span>
                    ) : null}
                  </span>
                ))}
              </div>
            </div>
            <p className="mt-8 text-[0.7rem] font-medium uppercase tracking-[0.28em] text-cream/45 sm:mt-10">
              {t("home.tickerAirport")}{" "}
              <span className="text-gold/35" aria-hidden>
                •
              </span>{" "}
              {t("home.tickerExotic")}{" "}
              <span className="text-gold/35" aria-hidden>
                •
              </span>{" "}
              {t("home.tickerYacht")}{" "}
              <span className="text-gold/35" aria-hidden>
                •
              </span>{" "}
              {t("home.tickerVip")}
            </p>
          </div>
        </div>
      </section>

      <div className="section-gradient-divider" aria-hidden />

      <section
        className="border-b border-gold/10 bg-[#0a0a0a] py-3"
        aria-label={t("home.realtimeAria")}
      >
        <div className="relative overflow-hidden">
          <div className="proof-strip-track flex w-max min-w-full items-center gap-2 px-3 sm:gap-3 sm:px-6">
            {[...realtimeProofItems, ...realtimeProofItems].map((item, idx) => (
              <span
                key={`${item}-${idx}`}
                className="inline-flex shrink-0 items-center gap-2 border border-gold/20 bg-[#0b0b0b]/60 px-3 py-2 text-[0.62rem] font-medium uppercase tracking-[0.19em] text-cream/72 sm:px-4 sm:text-[0.64rem]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gold/85" aria-hidden />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal
        className="border-b border-gold/10 bg-charcoal py-16 sm:py-20 lg:py-24"
        aria-labelledby="home-services-heading"
      >
        <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col gap-8 border-b border-gold/10 pb-10 sm:pb-12 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <div className="max-w-2xl">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.48em] text-gold/90">
                {t("home.servicesEyebrow")}
              </p>
              <div className="mt-4 h-px w-12 bg-gold/35" aria-hidden />
              <h2
                id="home-services-heading"
                className="mt-6 font-serif text-[1.7rem] leading-tight tracking-tight text-cream sm:text-3xl md:text-[2.15rem]"
              >
                {t("home.servicesHeadline")}
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-cream/55 sm:text-[0.9375rem]">
                {t("home.servicesBody")}
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-end">
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.24em] text-cream/40 lg:text-right">
                {t("home.servicesCategories")}
              </p>
              <Link href="/services" className={btnGhost}>
                {t("common.viewAllServices")}
              </Link>
            </div>
          </div>

          <HomeServicesShowcase />
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal
        className="group relative border-b border-gold/10 bg-[#070707]"
        aria-labelledby="featured-experience-heading"
      >
        <div className="relative min-h-[min(78vh,900px)] w-full overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1669815503102-7c417112b3eb?auto=format&fit=crop&q=88&w=2800"
            alt={t("home.skylineAlt")}
            fill
            sizes="100vw"
            className="object-cover object-[center_42%] brightness-[0.78] contrast-[1.1] saturate-[0.92] transition-[transform,filter] duration-[1.15s] ease-out group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-[#0b0b0b]/55" aria-hidden />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b] via-[#0b0b0b]/25 to-[#0b0b0b]/20"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b]/92 via-[#0b0b0b]/45 to-transparent sm:from-[#0b0b0b]/88 sm:via-[#0b0b0b]/35"
            aria-hidden
          />

          <div className="relative z-10 mx-auto flex min-h-[min(78vh,900px)] max-w-7xl flex-col justify-end px-5 pb-14 pt-28 sm:px-8 sm:pb-16 sm:pt-32 lg:px-10 lg:pb-20 lg:pt-36">
            <div className="max-w-xl lg:max-w-2xl">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.48em] text-gold/95">
                {t("home.featuredEyebrow")}
              </p>
              <div className="mt-5 h-px w-12 bg-gold/40" aria-hidden />
              <h2
                id="featured-experience-heading"
                className="mt-7 font-serif text-[2.1rem] leading-[1.08] tracking-tight text-cream sm:text-5xl md:text-[3.1rem] lg:text-[3.45rem]"
              >
                {t("home.featuredTitle")}
              </h2>
              <ul className="mt-9 list-none space-y-3 border-l border-gold/25 pl-5 text-[0.78rem] font-medium uppercase tracking-[0.26em] text-cream/65 sm:pl-6 sm:text-[0.76rem]">
                {featuredExperienceItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="mt-10 sm:mt-11">
                <Link
                  href={CONTACT_TRIP_BUILDER_HREF}
                  className={cn(btnPrimary, "px-9 tracking-[0.2em]")}
                >
                  {t("common.planThisExperience")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal
        className="border-b border-gold/10 bg-charcoal py-28 sm:py-32 lg:py-36"
        aria-labelledby="social-proof-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.48em] text-gold/90">
              {t("home.clientMoments")}
            </p>
            <div className="mt-4 h-px w-12 bg-gold/35" aria-hidden />
            <h2
              id="social-proof-heading"
              className="mt-6 font-serif text-[1.65rem] leading-snug tracking-tight text-cream sm:text-3xl md:text-[2.1rem]"
            >
              {t("home.socialHeadline")}
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-cream/48">
              {t("home.socialBody")}
            </p>
          </div>
        </div>

        <div className="mt-14 w-full px-4 sm:mt-16 sm:px-6 lg:px-10">
          <ClientMomentsCarousel
            images={PHOTOGRAPHER_SHOOT_SLIDES}
            intervalMs={4500}
          />
        </div>

        <div className="mx-auto mt-16 max-w-7xl px-4 sm:mt-20 sm:px-6 lg:px-10">
          <div className="grid gap-10 border-t border-gold/10 pt-14 sm:grid-cols-2 sm:gap-12 sm:pt-16 lg:gap-16">
            {socialProofQuotes.map((entry) => (
              <blockquote
                key={entry.attribution}
                className="border-l border-gold/25 pl-6 sm:pl-7"
              >
                <p className="font-serif text-lg leading-relaxed text-cream/88 sm:text-[1.15rem]">
                  &ldquo;{entry.quote}&rdquo;
                </p>
                <footer className="mt-5 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-cream/38">
                  {entry.attribution}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal className="border-b border-gold/10 bg-[#080808] py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.48em] text-gold/92">
              {t("home.beforeAfterEyebrow")}
            </p>
            <div className="mt-4 h-px w-12 bg-gold/35" aria-hidden />
            <h2 className="mt-6 font-serif text-[1.7rem] leading-tight tracking-tight text-cream sm:text-3xl md:text-[2.05rem]">
              {t("home.beforeAfterHeadline")}
            </h2>
          </div>
          <div className="mt-10 grid gap-5 sm:mt-12 lg:grid-cols-2">
            {beforeAfterItems.map((column) => (
              <article
                key={column.title}
                className="border border-gold/15 bg-[#0b0b0b]/75 p-6 sm:p-7"
              >
                <h3 className="font-serif text-xl tracking-tight text-cream">
                  {column.title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {column.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-3 text-sm leading-relaxed text-cream/68"
                    >
                      <span
                        className={cn(
                          "mt-2 h-1.5 w-1.5 shrink-0 rounded-full",
                          column.highlight
                            ? "bg-gold-secondary"
                            : "bg-cream/35",
                        )}
                        aria-hidden
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal className="border-t border-gold/15 bg-[#070707] py-28 sm:py-36 lg:py-40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto h-px w-16 bg-gold/45" aria-hidden />
            <h2 className="mt-10 font-serif text-[1.75rem] leading-[1.12] tracking-tight text-cream sm:text-4xl md:text-[2.5rem]">
              {t("home.closingHeadline")}
            </h2>
            <p className="mx-auto mt-8 max-w-xl text-[0.95rem] leading-relaxed text-cream/75 sm:text-lg">
              {t("home.closingBody")}
            </p>
            <div className="mt-12 flex flex-col items-stretch gap-3 sm:mt-14 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
              <a href="tel:+17866840345" className={btnPrimaryLg}>
                {t("common.callNow")}
              </a>
              <a
                href="https://wa.me/17866840345"
                target="_blank"
                rel="noopener noreferrer"
                className={btnOutlineStrong}
              >
                {t("common.whatsapp")}
              </a>
              <a
                href="https://www.instagram.com/blackline_concierge/"
                target="_blank"
                rel="noopener noreferrer"
                className={btnOutlineStrong}
              >
                {t("common.instagram")}
              </a>
            </div>
          </div>
        </div>
      </SectionReveal>
    </>
  );
}
