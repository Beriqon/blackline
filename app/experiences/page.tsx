import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ExperiencesPhotoHighlights } from "@/components/experiences-photo-highlights";
import { ScrollRevealItem } from "@/components/scroll-reveal-item";
import { CONTACT_TRIP_BUILDER_HREF } from "@/lib/contact-hrefs";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Experiences",
  description:
    "Signature Blackline experiences with cinematic storytelling, curated highlights, and concierge-level planning.",
};

const btnGhost =
  "inline-flex min-h-11 items-center justify-center border border-gold/25 bg-transparent px-8 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-cream transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold/55 hover:text-gold-secondary hover:shadow-[0_0_36px_rgba(198,164,108,0.12)] active:translate-y-0 sm:min-w-[200px]";
const btnSolid =
  "inline-flex min-h-11 items-center justify-center border border-gold/20 bg-gold/90 px-8 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#14110b] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-gold-secondary hover:shadow-[0_0_34px_rgba(198,164,108,0.24)] active:translate-y-0 sm:min-w-[200px]";

const signatureExperiences = [
  {
    id: "yacht-day",
    title: "Yacht Day Escape",
    blurb: "Private crew, curated route, and a sunset return timed to perfection.",
    highlights: ["4-8 hour private charter", "Captain, host, and premium setup"],
    photos: [
      { src: "/photography/yachtphotos/yachtphoto1.jpg", alt: "Yacht on open water" },
      { src: "/yachts/68azimuttheone/68azimuttheone3.jpg", alt: "Yacht deck and horizon" },
      { src: "/yachts/68azimuttheone/68azimuttheone8.jpg", alt: "Yacht flybridge lounge" },
    ],
  },
  {
    id: "night-vip",
    title: "VIP Night Access",
    blurb: "Skip the uncertainty with priority arrivals and table coordination.",
    highlights: ["Priority club entry flow", "Dedicated host through the night"],
    photos: [
      { src: "/vipvenues/livmiami.jpg", alt: "LIV Miami venue exterior" },
      { src: "/vipvenues/e11even.jpg", alt: "E11EVEN nightlife venue" },
      { src: "/vipvenues/m2miami.jpg", alt: "M2 Miami club frontage" },
    ],
  },
  {
    id: "exotic-drive",
    title: "Exotic Drive Arrival",
    blurb: "A statement pickup for daytime cruising, dining, or nightlife entries.",
    highlights: ["Handpicked performance fleet", "Delivery, swap, and support"],
    photos: [
      { src: "/photography/carphotos/carphoto1.jpg", alt: "Exotic car lineup" },
      { src: "/photography/carphotos/carphoto5.jpg", alt: "Luxury car on location" },
      { src: "/exoticcar/lamborghini/huracanwhite/huracanwhite.webp", alt: "White Lamborghini Huracan" },
    ],
  },
  {
    id: "jet-entry",
    title: "Private Jet Entry",
    blurb: "Seamless arrival from runway to residence with Blackline coordination.",
    highlights: ["Airport-to-villa transfer flow", "Ground logistics fully handled"],
    photos: [
      { src: "/privatejets/gulfstreamg550/gulfstreamg550.webp", alt: "Gulfstream private jet" },
      { src: "/privatejets/falcon2000/falcon2000.webp", alt: "Falcon 2000 aircraft" },
      { src: "/privatejets/challenger350/challenger350.webp", alt: "Challenger 350 on ramp" },
    ],
  },
] as const;

const momentsGallery = [
  { src: "/sitephotos/miamibeach.jpg", alt: "Miami beach and skyline" },
  { src: "/sitephotos/fishing1.webp", alt: "Boating on open water" },
  { src: "/sitephotos/jetski3.jpg", alt: "Jet ski at sunset" },
  { src: "/vipvenues/nikkibeach2.webp", alt: "Poolside at Nikki Beach" },
  { src: "/vipvenues/joiabeach2.webp", alt: "Joia Beach palms and pool" },
  { src: "/vipvenues/cocomiami.jpg", alt: "Coco Miami exterior" },
  { src: "/vipvenues/livmiami1.jpg", alt: "LIV Miami entrance view" },
  { src: "/vipvenues/clubspace.jpg", alt: "Club Space Miami venue" },
  { src: "/photography/carphotos/carphoto8.jpg", alt: "Exotic car detail" },
  { src: "/photography/jetskiphotos/jetskiphoto1.jpg", alt: "Jet ski session on water" },
  { src: "/yachts/68azimuttheone/68azimuttheone1.jpg", alt: "Azimut yacht exterior profile" },
  { src: "/privatejets/learjet60/learjet60.webp", alt: "Learjet 60 parked on runway" },
  { src: "/vipvenues/m2miami.jpg", alt: "M2 Miami nightlife facade" },
  { src: "/vipvenues/e11even.jpg", alt: "E11EVEN Miami venue lights" },
  { src: "/vipvenues/joiabeach1.jpg", alt: "Joia Beach daytime scene" },
  { src: "/vipvenues/joiabeach3.jpg", alt: "Joia Beach waterfront dinner" },
  { src: "/vipvenues/nikkibeach1.webp", alt: "Nikki Beach lounge setup" },
  { src: "/vipvenues/cocomiami2.webp", alt: "Coco Miami night atmosphere" },
  { src: "/vipvenues/rockwell1.jpg", alt: "Rockwell club entrance" },
  { src: "/vipvenues/mrjones.jpg", alt: "Mr Jones venue front" },
  { src: "/vipvenues/livmiami.jpg", alt: "LIV Miami exterior detail" },
  { src: "/photography/carphotos/carphoto1.jpg", alt: "Exotic fleet lineup" },
  { src: "/photography/carphotos/carphoto5.jpg", alt: "Luxury car street shot" },
  { src: "/exoticcar/lamborghini/huracanwhite/huracanwhite.webp", alt: "White Huracan profile" },
  { src: "/photography/yachtphotos/yachtphoto1.jpg", alt: "Yacht cruising Miami waters" },
  { src: "/yachts/68azimuttheone/68azimuttheone3.jpg", alt: "Azimut deck perspective" },
  { src: "/yachts/68azimuttheone/68azimuttheone8.jpg", alt: "Flybridge and skyline view" },
  { src: "/exoticcar/chauffeur/chevsuburban/chevsuburban1.jpg", alt: "Chauffeur Suburban exterior" },
  { src: "/exoticcar/chauffeur/exclusivesprinter/exclusivesprinter1.jpg", alt: "Executive Sprinter van" },
  { src: "/exoticcar/chauffeur/tiffanyblue/5STAR.jpg", alt: "Premium chauffeur fleet vehicle" },
] as const;

const itineraryMoments = [
  {
    id: "morning",
    label: "Morning",
    title: "Arrival with intent",
    copy: "Airport pickup, villa check-in, and first reservation locked in before noon.",
  },
  {
    id: "sunset",
    label: "Sunset",
    title: "Water to skyline",
    copy: "From bay cruise to golden-hour dinner with transitions handled end-to-end.",
  },
  {
    id: "night",
    label: "Night",
    title: "Doors already open",
    copy: "Host-guided nightlife entry, table ready, and return logistics already set.",
  },
] as const;

export default function ExperiencesPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-gold/10 bg-background">
        <div
          className="absolute inset-0 hero-bg-drift bg-[radial-gradient(circle_at_16%_12%,rgba(198,164,108,0.24),transparent_42%),radial-gradient(circle_at_82%_6%,rgba(95,58,122,0.2),transparent_38%),linear-gradient(180deg,#101010_0%,#0b0b0b_76%)]"
          aria-hidden
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,11,0.25),rgba(11,11,11,0.85))]" />

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <ScrollRevealItem index={0}>
            <p className="hero-cta-in text-[0.65rem] font-semibold uppercase tracking-[0.48em] text-gold/90">
              Signature Experiences
            </p>
            <h1 className="hero-headline-in mt-6 max-w-4xl font-serif text-4xl leading-[1.02] tracking-tight text-cream sm:text-5xl md:text-[3.4rem]">
              The Blackline Experience
            </h1>
            <p className="hero-cta-in mt-5 max-w-2xl text-sm leading-relaxed text-cream/65 sm:text-[0.96rem]">
              Four cinematic concepts with richer visuals that show the
              Blackline lifestyle in one scroll.
            </p>

            <div className="hero-cta-in mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row">
              <Link href={CONTACT_TRIP_BUILDER_HREF} className={btnSolid}>
                Build my itinerary
              </Link>
              <Link href="/services" className={btnGhost}>
                Explore services
              </Link>
            </div>
          </ScrollRevealItem>
        </div>
      </section>

      <div className="section-gradient-divider" aria-hidden />

      <section className="border-b border-gold/10 bg-charcoal py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
            {signatureExperiences.map((item, index) => (
              <ScrollRevealItem key={item.id} index={index + 1}>
                <article className="group overflow-hidden border border-gold/12 bg-[#0f0f0f] transition-all duration-500 ease-out hover:-translate-y-0.5 hover:border-gold/26">
                  <div className="grid grid-cols-3 gap-1.5 border-b border-gold/12 bg-[#090909] p-1.5">
                    {item.photos.map((photo) => (
                      <div
                        key={photo.src}
                        className={cn(
                          "relative aspect-[3/4] overflow-hidden bg-[#0b0b0b]",
                          item.id === "jet-entry" && "p-1",
                        )}
                      >
                        <Image
                          src={photo.src}
                          alt={photo.alt}
                          fill
                          sizes="(max-width: 1024px) 33vw, 20vw"
                          className={cn(
                            "brightness-[0.92] transition duration-700 ease-out group-hover:scale-[1.05]",
                            item.id === "jet-entry"
                              ? "object-contain"
                              : "object-cover",
                          )}
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b0b0b]/65 via-transparent to-transparent" />
                      </div>
                    ))}
                  </div>

                  <div className="p-5 sm:p-6">
                    <h2 className="font-serif text-[1.35rem] leading-tight tracking-tight text-cream sm:text-[1.5rem]">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-[0.9rem] leading-relaxed text-cream/56">
                      {item.blurb}
                    </p>
                    <ul className="mt-4 space-y-2 text-[0.72rem] uppercase tracking-[0.2em] text-gold/85">
                      {item.highlights.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              </ScrollRevealItem>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-gold/10 bg-background py-14 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.48em] text-gold/90">
            One Day Flow
          </p>
          <h2 className="mt-5 max-w-2xl font-serif text-3xl leading-[1.08] tracking-tight text-cream sm:text-4xl">
            Designed to feel effortless.
          </h2>
          <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-3">
            {itineraryMoments.map((moment, index) => (
              <ScrollRevealItem key={moment.id} index={index + 1}>
                <article className="border border-gold/12 bg-[#101010] p-5 transition-colors duration-300 hover:border-gold/22">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.35em] text-gold/88">
                    {moment.label}
                  </p>
                  <h3 className="mt-3 font-serif text-[1.05rem] leading-tight tracking-tight text-cream">
                    {moment.title}
                  </h3>
                  <p className="mt-2 text-[0.84rem] leading-relaxed text-cream/52">
                    {moment.copy}
                  </p>
                </article>
              </ScrollRevealItem>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-gold/10 bg-charcoal py-12 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <ScrollRevealItem index={0}>
            <div className="flex items-end justify-between gap-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.46em] text-gold/90">
                Photo Highlights
              </p>
            </div>
          </ScrollRevealItem>
          <ExperiencesPhotoHighlights photos={momentsGallery} />
        </div>
      </section>

      <section className="bg-charcoal py-14 sm:py-16 lg:py-18">
        <ScrollRevealItem index={0}>
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.46em] text-gold/90">
              Ready To Book
            </p>
            <h2 className="mx-auto mt-5 max-w-2xl font-serif text-3xl leading-[1.08] tracking-tight text-cream sm:text-4xl">
              We turn this concept into your real itinerary.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-cream/58 sm:text-[0.95rem]">
              Send your dates and group size. We&apos;ll map timing, logistics, and
              access so your trip flows exactly as it should.
            </p>
            <Link
              href={CONTACT_TRIP_BUILDER_HREF}
              className={cn(btnSolid, "mt-8 inline-flex sm:mt-9")}
            >
              Start planning
            </Link>
          </div>
        </ScrollRevealItem>
      </section>
    </>
  );
}
