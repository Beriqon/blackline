"use client";

import Link from "next/link";

import { useLocale } from "@/components/locale-provider";
import { SectionReveal } from "@/components/section-reveal";
import { CONTACT_TRIP_BUILDER_HREF } from "@/lib/contact-hrefs";
import { YACHT_HOSTESS_ADDON } from "@/lib/yacht-hostess-addon";
import { cn } from "@/lib/utils";

const linkSubtle =
  "text-sm font-medium tracking-wide text-gold-secondary underline-offset-8 transition-all duration-300 ease-out hover:text-gold hover:underline hover:drop-shadow-[0_0_14px_rgba(198,164,108,0.35)]";

export type YachtHostessAddonProps = {
  className?: string;
};

export function YachtHostessAddon({ className }: YachtHostessAddonProps) {
  const { locale, t } = useLocale();
  const { startingPrice, maxCapacityLabel } = YACHT_HOSTESS_ADDON;

  const headline =
    locale === "es"
      ? t("yachtsPage.addons.hostessHeadline")
      : YACHT_HOSTESS_ADDON.headline;
  const body =
    locale === "es" ? t("yachtsPage.addons.hostessBody") : YACHT_HOSTESS_ADDON.body;
  const policyNote =
    locale === "es"
      ? t("yachtsPage.addons.hostessPolicy")
      : YACHT_HOSTESS_ADDON.policyNote;

  return (
    <SectionReveal
      className={cn(
        "border-b border-gold/10 bg-[#0c0c0c] py-9 sm:py-10",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.42em] text-gold/75">
            {t("yachtsPage.addons.hostessEyebrow")}
          </p>
          <h2 className="mt-2 font-serif text-lg leading-snug tracking-tight text-cream sm:text-xl">
            {headline}
          </h2>
          <p className="mt-2 text-[0.8125rem] leading-relaxed text-cream/50 sm:text-sm">
            {body}
          </p>
          <p className="mt-3 text-[0.8125rem] text-cream/45 sm:text-sm">
            {t("yachtsPage.addons.hostessFrom", {
              price: startingPrice,
              capacity: maxCapacityLabel,
            })}
          </p>
          <p className="mt-2 text-[0.7rem] leading-relaxed text-cream/38">
            {policyNote}
          </p>
          <p className="mt-4">
            <Link href={CONTACT_TRIP_BUILDER_HREF} className={linkSubtle}>
              {t("yachtsPage.addons.hostessPackageLink")}
            </Link>
          </p>
        </div>
      </div>
    </SectionReveal>
  );
}
