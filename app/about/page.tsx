import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, MapPin } from "lucide-react";
import { SectionReveal } from "@/components/section-reveal";
import { CONTACT_TRIP_BUILDER_HREF } from "@/lib/contact-hrefs";
import { getI18n } from "@/lib/i18n/server";
import { MiamiJourney } from "./miami-journey";
import en from "./content.en.json";
import es from "./content.es.json";
import styles from "./about.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return { title: t("common.about"), description: (locale === "es" ? es : en).heroBody };
}

export default async function AboutPage() {
  const { locale } = await getI18n();
  const copy = locale === "es" ? es : en;

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="about-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h1 id="about-title">{copy.hero1}<br /><em>{copy.hero2}</em></h1>
          <p className={styles.heroBody}>{copy.heroBody}</p>
          <a href="#about-approach" className={styles.textLink}>{copy.heroLink}<ArrowDown size={15} aria-hidden /></a>
          <span className={styles.location}><MapPin size={12} aria-hidden />{copy.location}</span>
        </div>
        <div className={styles.heroVisual}>
          <Image src="/yachts/166trinity/166trinity.jpg" alt={copy.heroAlt} fill preload sizes="(max-width: 800px) 100vw, 50vw" className={styles.cover} />
          <div className={styles.heroOverlay} />
          <span className={styles.heroEdition} aria-hidden>BLACKLINE / SOUTH FLORIDA</span>
          <div className={styles.heroCaption}><span aria-hidden>MIAMI</span><p>{copy.caption}</p></div>
        </div>
      </section>

      <SectionReveal id="about-approach" className={`${styles.section} ${styles.container}`} aria-labelledby="approach-title">
        <div className={styles.storyGrid}>
          <div><p className={styles.eyebrow}>{copy.storyEyebrow}</p><h2 id="approach-title" className={styles.heading}>{copy.story1}<br /><em>{copy.story2}</em></h2></div>
          <div className={styles.storyCopy}><p>{copy.storyBody1}</p><p>{copy.storyBody2}</p><p className={styles.note}>{copy.storyNote}</p></div>
        </div>
      </SectionReveal>

      <SectionReveal className={styles.chauffeur} aria-labelledby="about-chauffeur-title">
        <div className={styles.chauffeurPhoto}>
          <Image src="/home/chauffeur-interior.webp" alt={copy.chauffeurAlt} fill sizes="(max-width: 800px) 100vw, 55vw" className={styles.cover} />
          <span>{copy.chauffeurCaption}</span>
        </div>
        <div className={styles.chauffeurCopy}>
          <p className={styles.eyebrow}>{copy.chauffeurEyebrow}</p>
          <h2 id="about-chauffeur-title" className={styles.heading}>{copy.chauffeur1}<br /><em>{copy.chauffeur2}</em></h2>
          <p>{copy.chauffeurBody}</p><p>{copy.chauffeurNote}</p>
          <Link href="/services/chauffeur-services" className={styles.textLink}>{copy.chauffeurLink}<ArrowUpRight size={16} aria-hidden /></Link>
        </div>
      </SectionReveal>

      <section className={`${styles.section} ${styles.journeySection}`} aria-labelledby="miami-journey-title">
        <div className={styles.container}>
          <div className={styles.journeyHeading}>
            <div><p className={styles.eyebrow}>{copy.journeyEyebrow}</p><h2 id="miami-journey-title" className={styles.heading}>{copy.journey1}<br /><em>{copy.journey2}</em></h2></div>
            <p>{copy.journeyBody}</p>
          </div>
          <MiamiJourney steps={copy.steps} label={copy.journeyLabel} exploreLabel={copy.journeyExplore} openMapLabel={copy.openMap} mapErrorLabel={copy.mapError} />
          <p className={styles.journeyNote}>{copy.journeyNote}</p>
        </div>
      </section>

      <SectionReveal className={`${styles.section} ${styles.container}`} aria-labelledby="about-principles-title">
        <p className={styles.eyebrow}>{copy.principlesEyebrow}</p>
        <h2 id="about-principles-title" className={`${styles.heading} ${styles.principlesTitle}`}>{copy.principlesTitle}</h2>
        <div className={styles.principles}>{copy.principles.map((item, index) => <article key={item.title}><span>0{index + 1}</span><h3>{item.title}</h3><p>{item.body}</p></article>)}</div>
      </SectionReveal>

      <SectionReveal className={styles.closing} aria-labelledby="about-closing-title">
        <div className={`${styles.container} ${styles.closingGrid}`}>
          <div><p className={styles.eyebrow}>{copy.ctaEyebrow}</p><h2 id="about-closing-title" className={styles.heading}>{copy.cta1}<br /><em>{copy.cta2}</em></h2></div>
          <div><p>{copy.ctaBody}</p><Link href={CONTACT_TRIP_BUILDER_HREF} className={styles.primaryButton}>{copy.ctaLink}<ArrowUpRight size={17} aria-hidden /></Link><Link href="/services" className={styles.textLink}>{copy.allServices}<ArrowUpRight size={15} aria-hidden /></Link></div>
        </div>
      </SectionReveal>
    </div>
  );
}
