import {ManagedProductCollection} from "@/components/managed-product-collection";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import en from "./content.en.json";
import es from "./content.es.json";
import styles from "./water.module.css";
import { Suspense } from "react";

import { ServicePhotographyAddon } from "@/components/service-photography-addon";
import { SectionReveal } from "@/components/section-reveal";
import { CONTACT_TRIP_BUILDER_HREF } from "@/lib/contact-hrefs";
import { getI18n } from "@/lib/i18n/server";
import { tWater } from "@/lib/i18n/water-activities-page";
import { JETSKIS_PHOTO_ADDON_IMAGES } from "@/lib/jetskis-jetcars-data";

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

async function WaterOverviewHero() {
 const {locale}=await getI18n();const copy=locale==="es"?es:en;
 return <section className={styles.hero} aria-labelledby="water-title"><Image src="/sitephotos/miamibeach.jpg" alt={copy.heroAlt} fill preload sizes="100vw" className={styles.heroImage}/><div className={styles.shade}/><div className={styles.container+" "+styles.heroContent}><p className={styles.eyebrow}>{copy.eyebrow}</p><h1 id="water-title">{copy.hero1}<br/><em>{copy.hero2}</em></h1><p className={styles.intro}>{copy.heroBody}</p><a href="#water-explorer" className={styles.textLink}>{copy.discover}<ArrowDown size={15} aria-hidden/></a><div className={styles.heroFoot}><span>BLACKLINE / SOUTH FLORIDA</span><span>{copy.signature}</span></div></div></section>;
}
async function WaterPageCta() {
 const {locale}=await getI18n();const copy=locale==="es"?es:en;
 return <SectionReveal className={styles.closing}><div className={styles.container+" "+styles.closingGrid}><h2 className={styles.heading}>{copy.cta1}<br/><em>{copy.cta2}</em></h2><div><p>{copy.ctaBody}</p><Link href={CONTACT_TRIP_BUILDER_HREF} className={styles.primaryButton}>{copy.plan}<ArrowUpRight size={17} aria-hidden/></Link></div></div></SectionReveal>;
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
    <div className={styles.page}>
      <Suspense fallback={<WaterHeroFallback />}>
        <WaterOverviewHero />
      </Suspense>

      <div className="section-gradient-divider" aria-hidden />

      <Suspense fallback={<WaterClientFallback />}>
        <ManagedProductCollection service="jetskis-jetcars" id="water-explorer"/>
      </Suspense>

      <div className="section-gradient-divider" aria-hidden />

      <Suspense fallback={null}>
        <WaterPhotographyAddon />
      </Suspense>

      <div className="section-gradient-divider" aria-hidden />

      <Suspense fallback={null}>
        <WaterPageCta />
      </Suspense>
    </div>
  );
}
