import { ServicePhotographyAddon } from "@/components/service-photography-addon";
import { YachtHostessAddon } from "@/components/yacht-hostess-addon";
import { SectionReveal } from "@/components/section-reveal";
import { YACHT_PHOTO_ADDON_IMAGES } from "@/lib/yachts-data";

/**
 * Photography + female hosts add-ons for individual yacht listing pages.
 * Matches catalog messaging so quotes stay consistent.
 */
export function YachtProductAddons() {
  return (
    <>
      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal className="border-b border-gold/10 bg-charcoal py-8 sm:py-9">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.42em] text-gold/75">
            Optional add-ons
          </p>
          <p className="mt-2 max-w-2xl text-[0.8125rem] leading-relaxed text-cream/52 sm:text-sm">
            Layer professional photo or video coverage and optional female hosts
            onto this charter — request either when you book or in your written
            proposal.
          </p>
        </div>
      </SectionReveal>

      <YachtHostessAddon />

      <ServicePhotographyAddon
        layout="static"
        headline="Add photo or video shoots"
        description="Book a photo shoot, a video shoot, or both for your charter — deck, tender, and golden-hour coverage in stills and/or motion, coordinated with your itinerary."
        images={YACHT_PHOTO_ADDON_IMAGES}
      />
    </>
  );
}
