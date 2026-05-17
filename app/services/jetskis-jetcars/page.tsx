import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ServicePhotographyAddon } from "@/components/service-photography-addon";
import { WaterActivitiesHero } from "@/components/water-activities-hero";
import { WaterActivitiesPageClient } from "@/components/water-activities-page-client";
import { SectionReveal } from "@/components/section-reveal";
import { CONTACT_TRIP_BUILDER_HREF } from "@/lib/contact-hrefs";
import { getI18n } from "@/lib/i18n/server";
import { tWater } from "@/lib/i18n/water-activities-page";
import { JETSKIS_PHOTO_ADDON_IMAGES } from "@/lib/jetskis-jetcars-data";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t("nav.onTheWater"),
    description: tWater(
      t,
      "onTheWater.meta.description",
      "Miami water activities: jet skis from $150+/hr, jetcars from $250+/hr, plus parasailing, kayak, SUP, banana boat, and fishing charters — coordinated by Blackline.",
    ),
  };
}

const btnPrimary =
  "inline-flex min-h-11 items-center justify-center border border-gold/40 bg-gold px-8 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#0b0b0b] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold-secondary hover:bg-gold-secondary hover:shadow-[0_0_0_1px_rgba(224,195,138,0.4),0_14px_48px_rgba(198,164,108,0.2)] active:translate-y-0";

function WaterHeroFallback() {
  return (
    <div
      className="min-h-[min(30vh,320px)] border-b border-gold/10 bg-[#0b0b0b]"
      aria-hidden
    />
  );
}

function WaterClientFallback() {
  return (
    <div
      className="min-h-[32vh] border-b border-gold/10 bg-[#0b0b0b]"
      aria-hidden
    />
  );
}

async function WaterPageCta() {
  const { t } = await getI18n();
  return (
    <SectionReveal className="border-b border-gold/10 bg-charcoal py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-serif text-xl tracking-tight text-cream sm:text-2xl">
          {tWater(t, "onTheWater.pageCta.headline", "Ready to get on the water?")}
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-cream/55">
          {tWater(
            t,
            "onTheWater.pageCta.body",
            "Share your dates and what you want to try — we'll line up PWC, parasail windows, or fishing in one response.",
          )}
        </p>
        <div className="mt-8">
          <Link href={CONTACT_TRIP_BUILDER_HREF} className={btnPrimary}>
            {tWater(t, "onTheWater.pageCta.button", "Contact us")}
          </Link>
        </div>
      </div>
    </SectionReveal>
  );
}

async function WaterPhotographyAddon() {
  const { t } = await getI18n();
  const images = JETSKIS_PHOTO_ADDON_IMAGES.map((img, i) => ({
    ...img,
    alt: tWater(
      t,
      `onTheWater.photography.marqueeImageAlts.${i}`,
      img.alt,
    ),
  }));
  return (
    <ServicePhotographyAddon
      layout="marquee"
      marqueeDurationSec={95}
      headline={tWater(
        t,
        "onTheWater.photography.headline",
        "Add photo or video shoots",
      )}
      description={tWater(
        t,
        "onTheWater.photography.description",
        "Book a photo shoot, a video shoot, or both for your water day — same coordination and edited stills and/or motion after you're off the water.",
      )}
      images={images}
    />
  );
}

export default function JetskisJetcarsPage() {
  return (
    <>
      <Suspense fallback={<WaterHeroFallback />}>
        <WaterActivitiesHero />
      </Suspense>

      <div className="section-gradient-divider" aria-hidden />

      <Suspense fallback={<WaterClientFallback />}>
        <WaterActivitiesPageClient />
      </Suspense>

      <div className="section-gradient-divider" aria-hidden />

      <Suspense fallback={null}>
        <WaterPhotographyAddon />
      </Suspense>

      <div className="section-gradient-divider" aria-hidden />

      <Suspense fallback={null}>
        <WaterPageCta />
      </Suspense>
    </>
  );
}
