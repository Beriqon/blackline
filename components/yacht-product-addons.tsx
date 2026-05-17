"use client";

import { ChauffeurServiceCrosslink } from "@/components/chauffeur-service-crosslink";
import { useLocale } from "@/components/locale-provider";
import { ServicePhotographyAddon } from "@/components/service-photography-addon";
import { YachtHostessAddon } from "@/components/yacht-hostess-addon";
import { SectionReveal } from "@/components/section-reveal";
import { YACHT_PHOTO_ADDON_IMAGES } from "@/lib/yachts-data";

/**
 * Photography + female hosts add-ons for individual yacht listing pages.
 * Matches catalog messaging so quotes stay consistent.
 */
export function YachtProductAddons() {
  const { t } = useLocale();

  return (
    <>
      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal className="border-b border-gold/10 bg-charcoal py-8 sm:py-9">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.42em] text-gold/75">
            {t("yachtsPage.addons.eyebrow")}
          </p>
          <p className="mt-2 max-w-2xl text-[0.8125rem] leading-relaxed text-cream/52 sm:text-sm">
            {t("yachtsPage.addons.body")}
          </p>
          <ChauffeurServiceCrosslink
            variant="yacht"
            className="mt-4 max-w-2xl text-[0.8125rem] leading-relaxed text-cream/52 sm:text-sm"
          />
        </div>
      </SectionReveal>

      <YachtHostessAddon />

      <ServicePhotographyAddon
        layout="static"
        headline={t("yachtsPage.photography.headline")}
        description={t("yachtsPage.photography.description")}
        images={YACHT_PHOTO_ADDON_IMAGES}
      />
    </>
  );
}
