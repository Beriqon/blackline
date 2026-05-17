"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

import { useLocale } from "@/components/locale-provider";
import { SectionReveal } from "@/components/section-reveal";
import { CONTACT_TRIP_BUILDER_HREF } from "@/lib/contact-hrefs";
import { getWaterActivityHero } from "@/lib/water-activities-data";
import { tWater } from "@/lib/i18n/water-activities-page";
import { parseWaterActivityTab } from "@/lib/water-activities-tabs";
import { cn } from "@/lib/utils";

const btnPrimary =
  "inline-flex min-h-11 items-center justify-center border border-gold/40 bg-gold px-8 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#0b0b0b] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold-secondary hover:bg-gold-secondary hover:shadow-[0_0_0_1px_rgba(224,195,138,0.4),0_14px_48px_rgba(198,164,108,0.2)] active:translate-y-0";

export function WaterActivitiesHero() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const tab = parseWaterActivityTab(searchParams.get("tab"));
  const hero = getWaterActivityHero(tab);

  return (
    <SectionReveal className="relative min-h-[min(30vh,320px)] overflow-hidden border-b border-gold/10 bg-[#0b0b0b]">
      <motion.div className="absolute inset-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={hero.src}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={hero.src}
              alt=""
              fill
              priority={tab === "overview"}
              sizes="100vw"
              className="object-cover object-center brightness-[0.92] saturate-[0.95]"
            />
          </motion.div>
        </AnimatePresence>
        <motion.div className="absolute inset-0 bg-[#0b0b0b]/45" aria-hidden />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b]/55 via-transparent to-[#0b0b0b]/40"
          aria-hidden
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b]/85 via-[#0b0b0b]/25 to-[#0b0b0b]/40"
          aria-hidden
        />
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_20%,rgba(198,164,108,0.07),transparent)]"
          aria-hidden
        />
      </motion.div>
      <motion.div className="relative z-10 mx-auto flex min-h-[min(30vh,320px)] max-w-7xl flex-col justify-end px-4 pb-7 pt-16 sm:px-6 sm:pb-8 sm:pt-20 lg:px-10 lg:pb-10 lg:pt-24">
        <motion.div className="max-w-2xl">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.48em] text-gold/90">
            {tWater(t, "onTheWater.hero.eyebrow", "On the water")}
          </p>
          <motion.div className="mt-3 h-px w-14 bg-gold/30" aria-hidden />
          <h1 className="mt-4 max-w-3xl font-serif text-[1.85rem] leading-[1.12] tracking-tight text-cream sm:text-[2.1rem] md:text-[2.35rem]">
            {tWater(
              t,
              "onTheWater.hero.title",
              "Water activities, parasailing & fishing",
            )}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-cream/58 sm:text-[0.9375rem]">
            {tWater(
              t,
              "onTheWater.hero.body",
              "Jet skis, jetcars, paddle craft, FlySOBE parasailing, and fishing — booked and timed through Blackline with trusted Miami partners.",
            )}
          </p>
          <p className="mt-4 max-w-xl text-xs leading-relaxed text-cream/40">
            {tWater(t, "onTheWater.hero.hint", "Use the category bar below. Start on ")}
            <strong className="font-medium text-cream/55">
              {tWater(t, "onTheWater.hero.hintStrong", "Overview")}
            </strong>
            {tWater(
              t,
              "onTheWater.hero.hintSuffix",
              " for a snapshot, or open one activity to go straight to details and rates.",
            )}
          </p>

          <motion.div className="mt-6">
            <Link
              href={CONTACT_TRIP_BUILDER_HREF}
              className={cn(btnPrimary, "sm:min-w-[200px]")}
            >
              {tWater(t, "onTheWater.hero.cta", "Plan a day on the water")}
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </SectionReveal>
  );
}
