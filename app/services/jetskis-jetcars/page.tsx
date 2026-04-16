import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { FishingChartersSection } from "@/components/fishing-charters-section";
import { JetskisJetcarsExperience } from "@/components/jetskis-jetcars-experience";
import { SectionReveal } from "@/components/section-reveal";
import { ServicePhotographyAddon } from "@/components/service-photography-addon";
import {
  JETSKIS_PHOTO_ADDON_IMAGES,
  JETSKIS_PANORAMIC_PLACEHOLDER,
} from "@/lib/jetskis-jetcars-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Jet skis & jetcars",
  description:
    "Jet skis from $150+/hr and jetcars from $250+/hr in Miami Beach and Fort Lauderdale. Plus Miami fishing charters — cruising, inshore Skimmer Skiff, and offshore Boston Whaler / Sea Pro. Full fishing rates and inclusions below.",
};

const btnPrimary =
  "inline-flex min-h-11 items-center justify-center border border-gold/40 bg-gold px-8 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#0b0b0b] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold-secondary hover:bg-gold-secondary hover:shadow-[0_0_0_1px_rgba(224,195,138,0.4),0_14px_48px_rgba(198,164,108,0.2)] active:translate-y-0";

const heroJumpCta =
  "inline-flex min-h-10 items-center justify-center rounded-sm border border-gold/22 bg-[#0a0a0a] px-4 py-2.5 text-center text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-cream/85 transition-all duration-300 hover:border-gold/35 hover:bg-[#101010] hover:text-cream";

export default function JetskisJetcarsPage() {
  return (
    <>
      <SectionReveal className="relative min-h-[min(28vh,300px)] overflow-hidden border-b border-gold/10 bg-[#0b0b0b]">
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
        <div className="relative z-10 mx-auto flex min-h-[min(28vh,300px)] max-w-7xl flex-col justify-end px-4 pb-6 pt-16 sm:px-6 sm:pb-8 sm:pt-20 lg:px-10 lg:pb-10 lg:pt-24">
          <div className="max-w-2xl">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.48em] text-gold/90">
              On the water
            </p>
            <div className="mt-3 h-px w-14 bg-gold/30" aria-hidden />
            <h1 className="mt-4 max-w-3xl font-serif text-[1.85rem] leading-[1.12] tracking-tight text-cream sm:text-[2.1rem] md:text-[2.35rem]">
              Jet skis, jetcars &amp; fishing
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-cream/58 sm:text-[0.9375rem]">
              We arrange jet ski sessions, jetcar runs, and fishing trips —
              routed and timed with your Miami stay so you spend less time
              coordinating and more time on the water.
            </p>

            <nav
              className="mt-5 flex flex-wrap gap-2.5 sm:gap-3"
              aria-label="Jump to sections on this page"
            >
              <Link
                href="/services/jetskis-jetcars#jetskis-jetcars-look-and-feel"
                className={heroJumpCta}
              >
                Jet skis &amp; jetcars
              </Link>
              <Link
                href="/services/jetskis-jetcars#fishing-charters"
                className={heroJumpCta}
              >
                Fishing charters
              </Link>
            </nav>

            <div className="mt-6">
              <Link href="/contact" className={cn(btnPrimary, "sm:min-w-[200px]")}>
                Plan a day on the water
              </Link>
            </div>
          </div>
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <JetskisJetcarsExperience />

      <SectionReveal
        id="fishing-charters"
        className="scroll-mt-[5.5rem] border-b border-gold/10 bg-[#0e0e0e] sm:scroll-mt-24"
        aria-labelledby="fishing-charters-heading"
      >
        <FishingChartersSection />
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <ServicePhotographyAddon
        layout="static"
        headline="Add photo or video shoots"
        description="Book a photo shoot, a video shoot, or both for your jet ski, jetcar, or fishing day — same coordination and edited stills and/or motion after you&apos;re off the water."
        images={JETSKIS_PHOTO_ADDON_IMAGES}
      />

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal className="border-b border-gold/10 bg-charcoal py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-xl tracking-tight text-cream sm:text-2xl">
            Ready to get on the water?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-cream/55">
            Share your dates and what you want to try — we&apos;ll come back
            with options for jet skis, jetcars, fishing, or a custom mix.
          </p>
          <div className="mt-8">
            <Link href="/contact" className={btnPrimary}>
              Contact us
            </Link>
          </div>
        </div>
      </SectionReveal>
    </>
  );
}
