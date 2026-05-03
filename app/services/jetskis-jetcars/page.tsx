import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { ServicePhotographyAddon } from "@/components/service-photography-addon";
import { WaterActivitiesPageClient } from "@/components/water-activities-page-client";
import { SectionReveal } from "@/components/section-reveal";
import { CONTACT_TRIP_BUILDER_HREF } from "@/lib/contact-hrefs";
import {
  JETSKIS_PHOTO_ADDON_IMAGES,
  JETSKIS_PANORAMIC_PLACEHOLDER,
} from "@/lib/jetskis-jetcars-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "On the water",
  description:
    "Miami water activities: jet skis from $150+/hr, jetcars from $250+/hr, plus parasailing, kayak, SUP, banana boat, and fishing charters — coordinated by Blackline.",
};

const btnPrimary =
  "inline-flex min-h-11 items-center justify-center border border-gold/40 bg-gold px-8 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#0b0b0b] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold-secondary hover:bg-gold-secondary hover:shadow-[0_0_0_1px_rgba(224,195,138,0.4),0_14px_48px_rgba(198,164,108,0.2)] active:translate-y-0";

function WaterClientFallback() {
  return (
    <div
      className="min-h-[32vh] border-b border-gold/10 bg-[#0b0b0b]"
      aria-hidden
    />
  );
}

export default function JetskisJetcarsPage() {
  return (
    <>
      <SectionReveal className="relative min-h-[min(30vh,320px)] overflow-hidden border-b border-gold/10 bg-[#0b0b0b]">
        <div className="absolute inset-0">
          <Image
            src={JETSKIS_PANORAMIC_PLACEHOLDER.src}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center brightness-[0.92] saturate-[0.95]"
          />
          <div className="absolute inset-0 bg-[#0b0b0b]/45" aria-hidden />
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b]/55 via-transparent to-[#0b0b0b]/40"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b]/85 via-[#0b0b0b]/25 to-[#0b0b0b]/40"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_20%,rgba(198,164,108,0.07),transparent)]"
            aria-hidden
          />
        </div>
        <div className="relative z-10 mx-auto flex min-h-[min(30vh,320px)] max-w-7xl flex-col justify-end px-4 pb-7 pt-16 sm:px-6 sm:pb-8 sm:pt-20 lg:px-10 lg:pb-10 lg:pt-24">
          <div className="max-w-2xl">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.48em] text-gold/90">
              On the water
            </p>
            <div className="mt-3 h-px w-14 bg-gold/30" aria-hidden />
            <h1 className="mt-4 max-w-3xl font-serif text-[1.85rem] leading-[1.12] tracking-tight text-cream sm:text-[2.1rem] md:text-[2.35rem]">
              Water activities, parasailing &amp; fishing
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-cream/58 sm:text-[0.9375rem]">
              Jet skis, jetcars, paddle craft, FlySOBE parasailing, and fishing
              — booked and timed through Blackline with trusted Miami partners.
            </p>
            <p className="mt-4 max-w-xl text-xs leading-relaxed text-cream/40">
              Use the category bar below. Start on{" "}
              <strong className="font-medium text-cream/55">Overview</strong>{" "}
              for a snapshot, or open one activity to go straight to details
              and rates.
            </p>

            <div className="mt-6">
              <Link href={CONTACT_TRIP_BUILDER_HREF} className={cn(btnPrimary, "sm:min-w-[200px]")}>
                Plan a day on the water
              </Link>
            </div>
          </div>
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <Suspense fallback={<WaterClientFallback />}>
        <WaterActivitiesPageClient />
      </Suspense>

      <div className="section-gradient-divider" aria-hidden />

      <ServicePhotographyAddon
        layout="marquee"
        marqueeDurationSec={95}
        headline="Add photo or video shoots"
        description="Book a photo shoot, a video shoot, or both for your water day — same coordination and edited stills and/or motion after you&apos;re off the water."
        images={JETSKIS_PHOTO_ADDON_IMAGES}
      />

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal className="border-b border-gold/10 bg-charcoal py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-xl tracking-tight text-cream sm:text-2xl">
            Ready to get on the water?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-cream/55">
            Share your dates and what you want to try — we&apos;ll line up
            PWC, parasail windows, or fishing in one response.
          </p>
          <div className="mt-8">
            <Link href={CONTACT_TRIP_BUILDER_HREF} className={btnPrimary}>
              Contact us
            </Link>
          </div>
        </div>
      </SectionReveal>
    </>
  );
}
