import Image from "next/image";
import Link from "next/link";

import { ClientMomentsCarousel } from "@/components/client-moments-carousel";
import { SectionReveal } from "@/components/section-reveal";
import { cn } from "@/lib/utils";
import { PHOTOGRAPHER_SHOOT_SLIDES } from "@/lib/photographer-shoots-data";

const btnPrimary =
  "inline-flex min-h-11 items-center justify-center border border-gold/40 bg-gold px-8 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#0b0b0b] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold-secondary hover:bg-gold-secondary hover:shadow-[0_0_0_1px_rgba(224,195,138,0.4),0_14px_48px_rgba(198,164,108,0.2)] active:translate-y-0";

const btnPrimaryLg =
  "inline-flex min-h-12 items-center justify-center border border-gold bg-gold px-8 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#0b0b0b] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold-secondary hover:bg-gold-secondary hover:shadow-[0_0_0_1px_rgba(224,195,138,0.4),0_14px_48px_rgba(198,164,108,0.2)] active:translate-y-0";

const btnGhost =
  "inline-flex min-h-11 items-center justify-center border border-gold/25 bg-transparent px-8 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-cream transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold/55 hover:text-gold-secondary hover:shadow-[0_0_36px_rgba(198,164,108,0.12)] active:translate-y-0 sm:min-w-[220px]";

const btnGhostGold =
  "inline-flex min-h-11 items-center justify-center border border-gold/30 bg-transparent px-8 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-gold transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold/55 hover:text-gold-secondary hover:shadow-[0_0_32px_rgba(198,164,108,0.14)] active:translate-y-0";

const btnOutlineStrong =
  "inline-flex min-h-12 items-center justify-center border-2 border-gold/50 bg-transparent px-8 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.2em] text-gold transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold hover:bg-gold/10 hover:text-gold-secondary hover:shadow-[0_0_40px_rgba(198,164,108,0.14)] active:translate-y-0";

const linkSubtle =
  "text-sm font-medium tracking-wide text-gold-secondary underline-offset-8 transition-all duration-300 ease-out hover:text-gold hover:underline hover:drop-shadow-[0_0_14px_rgba(198,164,108,0.35)]";

const services = [
  {
    title: "Exotic Car Rentals",
    description:
      "Curated self-drive exotics and supercars — delivered and ready for Miami streets.",
    href: "/services/exotic-cars",
    image: "/exoticcar/lamborghini/lamborghiniurusmblack/lamborghiniurusmblack1.png",
    imageAlt: "Black exotic supercar parked at night under city lights",
    collageImages: [
      {
        src: "/exoticcar/lamborghini/lamborghiniurusmblack/lamborghiniurusmblack1.png",
        alt: "Lamborghini Urus M-Black",
      },
      {
        src: "/exoticcar/rollsroyce/rrcullinanblack-a/rrcullinanblack-a-1.webp",
        alt: "Rolls-Royce Cullinan Black Unit A",
      },
      {
        src: "/exoticcar/lamborghini/evospyderstage2/evospyderstage2-1.png",
        alt: "Lamborghini Huracan Evo Spyder Stage 2",
      },
      {
        src: "/exoticcar/mercedes/g63lightblue/g63lightblue1.webp",
        alt: "Mercedes-AMG G63 Light blue",
      },
    ],
  },
  {
    title: "Yacht Charters",
    description:
      "Day charters and celebrations on the water — crewed, stocked, and routed.",
    href: "/services/yachts",
    image: "/yachts/166trinity/166trinity.jpg",
    imageAlt: "Superyacht charter at night with underwater hull lighting",
  },
  {
    title: "Villas & Stays",
    description:
      "Private residences and estates matched to your group, dates, and standards.",
    href: "/services/villas",
    image: "/stays/soleil/soleil1.jpg",
    imageAlt: "Modern luxury villa with illuminated pool at night",
  },
  {
    title: "Private Jets",
    description:
      "Charter coordination for personal and corporate travel — terminals, timing, crew.",
    href: "/services/private-jets",
    image: "/privatejets/challenger605/challenger605.webp",
    imageAlt: "Luxury private jet cabin with leather seating",
  },
  {
    title: "VIP Nightlife",
    description:
      "Table reservations and priority access at Miami’s most sought-after venues.",
    href: "/services/vip-nightlife",
    image: "/vipvenues/cocomiami2.webp",
    imageAlt: "Dimly lit premium bar with bottles and neon accent lighting",
  },
  {
    title: "Jet Skis & Jetcars",
    description:
      "Miami Beach and Fort Lauderdale — jet skis from $150+/hr, jetcars from $250+/hr, routed and timed with your stay.",
    href: "/services/jetskis-jetcars",
    image: "/sitephotos/jetski3.jpg",
    imageAlt: "Jet ski on turquoise water at speed",
  },
  {
    title: "Photo & video shoots",
    description:
      "Book a photo shoot, a video shoot, or both — our camera crew on yachts, villas, nights out, and more. Edited stills and motion on your timeline.",
    href: "/services/photographer",
    image: "/photography/Schermafbeelding 2026-04-15 165659.png",
    imageAlt: "Professional camera and lens in moody lighting",
  },
  {
    title: "Security guards",
    description:
      "Licensed armed and unarmed bodyguards — hourly coverage with a four-hour minimum, coordinated with your itinerary.",
    href: "/services/security-guards",
    image: "/sitephotos/securityguard2.jpg",
    imageAlt: "Velvet rope and evening venue entrance with soft lighting",
  },
] as const;

type Service = (typeof services)[number];

function ServiceEditorialCard({
  s,
  variant,
}: {
  s: Service;
  variant: "feature" | "compact";
}) {
  const isFeature = variant === "feature";
  return (
    <Link
      href={s.href}
      className={cn(
        "service-card-tilt group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/50",
        isFeature && "flex h-full min-h-0 flex-col"
      )}
    >
      <div
        className={cn(
          "service-card-media relative overflow-hidden border border-gold/12 bg-[#0b0b0b] transition-[border-color,box-shadow,transform] duration-500 ease-out group-hover:border-gold/28 group-hover:shadow-[0_0_0_1px_rgba(198,164,108,0.08)]",
          isFeature
            ? "min-h-[min(70vw,300px)] flex-1 lg:min-h-[min(380px,38vh)]"
            : "aspect-[16/10] sm:aspect-[2/1] lg:aspect-[16/10]"
        )}
      >
        {s.collageImages?.length ? (
          <div className="grid h-full w-full grid-cols-2 grid-rows-2">
            {s.collageImages.slice(0, 4).map((img) => (
              <div key={img.src} className="relative overflow-hidden">
                <Image
                  src={img.src}
                  alt=""
                  fill
                  sizes={
                    isFeature
                      ? "(max-width: 1024px) 50vw, 29vw"
                      : "(max-width: 1024px) 50vw, 21vw"
                  }
                  className="object-cover blur-[1.5px] brightness-[0.62] saturate-[0.88]"
                  aria-hidden
                />
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes={
                    isFeature
                      ? "(max-width: 1024px) 50vw, 29vw"
                      : "(max-width: 1024px) 50vw, 21vw"
                  }
                  className="service-card-image object-contain brightness-[0.96] contrast-[1.04] saturate-[0.9] transition duration-[750ms] ease-out group-hover:scale-[1.03] group-hover:brightness-[1.02] group-hover:contrast-[1.06]"
                />
              </div>
            ))}
          </div>
        ) : (
          <Image
            src={s.image}
            alt={s.imageAlt}
            fill
            sizes={
              isFeature
                ? "(max-width: 1024px) 100vw, 58vw"
                : "(max-width: 1024px) 100vw, 42vw"
            }
            className="service-card-image object-cover brightness-[0.9] contrast-[1.08] saturate-[0.92] transition duration-[750ms] ease-out group-hover:scale-[1.05] group-hover:brightness-[1.06] group-hover:contrast-[1.1]"
          />
        )}
        <div
          className="service-card-glow pointer-events-none absolute inset-0"
          aria-hidden
        />
      </div>
      <div
        className={cn(
          "border-t border-gold/10",
          isFeature ? "mt-4 pt-4 lg:mt-5 lg:pt-5" : "mt-3 pt-3 lg:mt-4 lg:pt-4"
        )}
      >
        <h3
          className={cn(
            "font-serif tracking-tight text-cream",
            isFeature
              ? "text-lg leading-snug sm:text-xl md:text-[1.4rem]"
              : "text-base leading-snug sm:text-lg"
          )}
        >
          {s.title}
        </h3>
        <p
          className={cn(
            "font-normal leading-relaxed text-cream/58",
            isFeature
              ? "mt-2 max-w-2xl text-[0.8125rem] sm:text-sm"
              : "mt-1.5 text-[0.8125rem] sm:text-sm"
          )}
        >
          {s.description}
        </p>
      </div>
    </Link>
  );
}

const featuredExperienceItems = [
  "Airport pickup",
  "Luxury villa stay",
  "Exotic car",
  "Yacht day",
  "VIP nightlife",
] as const;

const socialProofQuotes = [
  {
    quote:
      "One team on text — wheels, water, and the right table at midnight. No chaos, no chasing vendors.",
    attribution: "Private client · New York",
  },
  {
    quote:
      "We don’t piece Miami together ourselves anymore. They run the playbook end to end.",
    attribution: "Repeat guest · London",
  },
] as const;

const heroStats = [
  { value: "500+", label: "Experiences arranged" },
  { value: "24/7", label: "Concierge access" },
  { value: "Top 1%", label: "Miami vendor network" },
] as const;

const realtimeProofItems = [
  "Priority reservations",
  "Preferred partner rates",
  "Last-minute solutions",
  "End-to-end itinerary planning",
  "Single point of contact",
  "Discreet concierge coordination",
  "White-glove arrivals and departures",
  "Vetted luxury partner network",
  "24/7 on-call concierge access",
  "Cars, water, air, and nightlife synchronized",
] as const;

const beforeAfterItems = [
  {
    title: "Without Blackline",
    points: [
      "Multiple vendors and delayed confirmations",
      "No single itinerary or point of contact",
      "Time lost coordinating transport and nightlife",
    ],
  },
  {
    title: "With Blackline",
    points: [
      "One concierge manages every moving part",
      "A single itinerary synced to your schedule",
      "Priority access for cars, yachts, stays, and tables",
    ],
  },
] as const;

export default function HomePage() {
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
          <div
            className="absolute inset-0 bg-[#0b0b0b]/68"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-charcoal/22"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b]/78 via-[#0b0b0b]/28 to-transparent"
            aria-hidden
          />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[min(82vh,880px)] max-w-7xl items-center px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
          <div className="w-full max-w-[min(52rem,100%)] text-left">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.42em] text-gold">
              Miami luxury concierge
            </p>
            <div
              className="mt-5 h-px w-14 bg-gold/35"
              aria-hidden
            />
            <h1 className="hero-headline-in mt-6 font-serif text-[2.55rem] leading-[1.12] tracking-tight text-cream sm:text-5xl md:text-[3.25rem] lg:text-[3.85rem] xl:text-[4.1rem]">
              One call. Every detail.
            </h1>
            <p className="mt-3 max-w-2xl text-[0.95rem] leading-[1.65] text-cream/72 sm:text-base">
              Exotic cars, villas, yachts, jet skis, private aviation, VIP
              nightlife, and professional security — coordinated through one
              trusted Miami concierge team.
            </p>
            <div className="hero-cta-in mt-9 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Link href="/contact" className={cn(btnPrimary, "sm:min-w-[220px]")}>
                Book Your Experience
              </Link>
              <Link href="/services" className={btnGhost}>
                View Services
              </Link>
            </div>
            <div className="mt-7 border-t border-gold/18 pt-4 sm:mt-8 sm:pt-5">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-gold/88">
                Trusted by luxury travelers
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
              Airport pickup{" "}
              <span className="text-gold/35" aria-hidden>
                •
              </span>{" "}
              Exotic fleet{" "}
              <span className="text-gold/35" aria-hidden>
                •
              </span>{" "}
              Yacht access{" "}
              <span className="text-gold/35" aria-hidden>
                •
              </span>{" "}
              VIP reservations
            </p>
          </div>
        </div>
      </section>

      <div className="section-gradient-divider" aria-hidden />

      <section
        className="border-b border-gold/10 bg-[#0a0a0a] py-3"
        aria-label="Realtime concierge activity"
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

      <SectionReveal className="border-b border-gold/10 bg-charcoal py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.5em] text-gold/90">
              Services
            </p>
            <div
              className="mx-auto mt-4 h-px w-14 bg-gold/30"
              aria-hidden
            />
            <h2 className="mt-5 font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]">
              One concierge. Every detail.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-cream/60 sm:text-[0.9375rem]">
              Plan ground transport, your stay, days on the water, nights out,
              and security when you want coverage — without juggling multiple
              vendors. Tell us your dates and we build the itinerary around you.
            </p>
          </div>

          <div className="mt-12 space-y-10 sm:mt-14 sm:space-y-12 lg:space-y-14">
            {/* Row 1: feature left, two compact right */}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:grid-rows-2 lg:gap-x-6 lg:gap-y-5">
              <div className="min-h-0 lg:col-start-1 lg:row-span-2 lg:row-start-1">
                <ServiceEditorialCard
                  s={services[0]}
                  variant="feature"
                />
              </div>
              <div className="min-h-0 lg:col-start-2 lg:row-start-1">
                <ServiceEditorialCard
                  s={services[1]}
                  variant="compact"
                />
              </div>
              <div className="min-h-0 lg:col-start-2 lg:row-start-2">
                <ServiceEditorialCard
                  s={services[2]}
                  variant="compact"
                />
              </div>
            </div>

            {/* Row 2: two compact left, feature right (feature first on small screens) */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:grid-rows-2 lg:gap-x-6 lg:gap-y-5">
              <div className="order-2 min-h-0 lg:order-none lg:col-start-1 lg:row-start-1">
                <ServiceEditorialCard
                  s={services[3]}
                  variant="compact"
                />
              </div>
              <div className="order-3 min-h-0 lg:order-none lg:col-start-1 lg:row-start-2">
                <ServiceEditorialCard
                  s={services[4]}
                  variant="compact"
                />
              </div>
              <div className="order-1 min-h-0 lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1">
                <ServiceEditorialCard
                  s={services[5]}
                  variant="feature"
                />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-5">
              <div className="min-h-0">
                <ServiceEditorialCard
                  s={services[6]}
                  variant="compact"
                />
              </div>
              <div className="min-h-0">
                <ServiceEditorialCard
                  s={services[7]}
                  variant="compact"
                />
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-gold/10 pt-10 text-center sm:mt-14 sm:pt-12">
            <Link href="/services" className={linkSubtle}>
              View all services
            </Link>
          </div>
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
            alt="Downtown Miami skyline and bay at night from the water"
            fill
            sizes="100vw"
            className="object-cover object-[center_42%] brightness-[0.78] contrast-[1.1] saturate-[0.92] transition-[transform,filter] duration-[1.15s] ease-out group-hover:scale-[1.04]"
          />
          <div
            className="absolute inset-0 bg-[#0b0b0b]/55"
            aria-hidden
          />
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
                Featured experience
              </p>
              <div className="mt-5 h-px w-12 bg-gold/40" aria-hidden />
              <h2
                id="featured-experience-heading"
                className="mt-7 font-serif text-[2.1rem] leading-[1.08] tracking-tight text-cream sm:text-5xl md:text-[3.1rem] lg:text-[3.45rem]"
              >
                Miami Weekend Experience
              </h2>
              <ul className="mt-9 list-none space-y-3 border-l border-gold/25 pl-5 text-[0.78rem] font-medium uppercase tracking-[0.26em] text-cream/65 sm:pl-6 sm:text-[0.76rem]">
                {featuredExperienceItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="mt-10 sm:mt-11">
                <Link
                  href="/contact"
                  className={cn(btnPrimary, "px-9 tracking-[0.2em]")}
                >
                  Plan This Experience
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
              Client moments
            </p>
            <div className="mt-4 h-px w-12 bg-gold/35" aria-hidden />
            <h2
              id="social-proof-heading"
              className="mt-6 font-serif text-[1.65rem] leading-snug tracking-tight text-cream sm:text-3xl md:text-[2.1rem]"
            >
              Trusted by guests visiting Miami
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-cream/48">
              A glimpse of the nights, stays, and miles we coordinate — so you
              can move through the city without the noise.
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
            {socialProofQuotes.map((t) => (
              <blockquote
                key={t.attribution}
                className="border-l border-gold/25 pl-6 sm:pl-7"
              >
                <p className="font-serif text-lg leading-relaxed text-cream/88 sm:text-[1.15rem]">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer className="mt-5 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-cream/38">
                  {t.attribution}
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
              Before and after
            </p>
            <div className="mt-4 h-px w-12 bg-gold/35" aria-hidden />
            <h2 className="mt-6 font-serif text-[1.7rem] leading-tight tracking-tight text-cream sm:text-3xl md:text-[2.05rem]">
              Same Miami. Different experience.
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
                          column.title === "With Blackline"
                            ? "bg-gold-secondary"
                            : "bg-cream/35"
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
            <div
              className="mx-auto h-px w-16 bg-gold/45"
              aria-hidden
            />
            <h2 className="mt-10 font-serif text-[1.75rem] leading-[1.12] tracking-tight text-cream sm:text-4xl md:text-[2.5rem]">
              Tell us what you want. We&apos;ll handle the rest.
            </h2>
            <p className="mx-auto mt-8 max-w-xl text-[0.95rem] leading-relaxed text-cream/75 sm:text-lg">
              Share your dates, group size, and what you&apos;re looking for
              — we&apos;ll build your Miami experience.
            </p>
            <div className="mt-12 flex flex-col items-stretch gap-3 sm:mt-14 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
              <a href="tel:+17866840345" className={btnPrimaryLg}>
                Call Now
              </a>
              <a
                href="https://wa.me/17866840345"
                target="_blank"
                rel="noopener noreferrer"
                className={btnOutlineStrong}
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </SectionReveal>
    </>
  );
}
