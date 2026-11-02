"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, MapPin, Phone } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { HomeServicesShowcase } from "@/components/home-services-showcase";
import { HomeClientMoments } from "@/components/home-client-moments";
import { useTranslations } from "@/components/locale-provider";
import { SectionReveal } from "@/components/section-reveal";
import { CONTACT_TRIP_BUILDER_HREF } from "@/lib/contact-hrefs";
import styles from "./home.module.css";

export default function HomePage() {
  const t = useTranslations();
  const reduceMotion = useReducedMotion();
  const storyRef = useRef<HTMLElement>(null);
  const { scrollYProgress: storyProgress } = useScroll({ target: storyRef, offset: ["start end", "end start"] });
  const floatingY = useTransform(storyProgress, [0, 1], [35, -35]);
  const floatingBackY = useTransform(storyProgress, [0, 1], [-20, 25]);

  return (
    <div className={styles.home}>
      <section className={styles.hero} aria-labelledby="home-heading">
        <div className={styles.heroImage}>
          <Image src="/home/miami-dusk.webp" alt="" fill preload sizes="100vw" className={styles.cover} />
        </div>
        <div className={styles.heroShade} />
        <div className={`${styles.container} ${styles.heroContent}`}>
          <motion.div initial={{ opacity: 1, y: reduceMotion ? 0 : 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 1 }}>
            <p className={styles.eyebrow}><span className={styles.line} />{t("home.eyebrow")}</p>
            <h1 id="home-heading" className={styles.heroTitle}>{t("homeUpgrade.heroLine1")}<br /><em>{t("homeUpgrade.heroLine2")}</em></h1>
            <p className={styles.heroBody}>{t("homeUpgrade.heroBody")}</p>
            <div className={styles.actions}>
              <Link href={CONTACT_TRIP_BUILDER_HREF} className={styles.primaryButton}>{t("homeUpgrade.plan")}<ArrowUpRight size={17} aria-hidden /></Link>
              <a href="#home-services" className={styles.textButton}>{t("homeUpgrade.explore")}<ArrowDown size={15} aria-hidden /></a>
            </div>
          </motion.div>
          <div className={styles.heroBottom}>
            <span><MapPin size={13} aria-hidden /> Miami & South Florida</span>
            <a href="#home-services" className={styles.scrollLink}>{t("homeUpgrade.scroll")}<ArrowDown size={14} aria-hidden /></a>
            <span className={styles.heroSignature}>{t("homeUpgrade.signature")}</span>
          </div>
        </div>
        <div className={styles.heroSideNote} aria-hidden>BLACKLINE — MIAMI</div>
      </section>

      <div className={styles.promiseStrip}>
        {["personal", "considered", "effortless"].map((key, index) => <span key={key}><i aria-hidden>0{index + 1}</i>{t(`homeUpgrade.promises.${key}`)}</span>)}
      </div>

      <SectionReveal id="home-services" className={`${styles.section} ${styles.services}`} aria-labelledby="home-services-heading">
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrow}>{t("homeUpgrade.collectionEyebrow")}</p><h2 id="home-services-heading" className={styles.heading}>{t("homeUpgrade.collectionLine1")}<br /><em>{t("homeUpgrade.collectionLine2")}</em></h2></div>
            <div className={styles.headingAside}><p>{t("homeUpgrade.collectionBody")}</p><Link href="/services" className={styles.textButton}>{t("common.viewAllServices")}<ArrowUpRight size={16} aria-hidden /></Link></div>
          </div>
          <HomeServicesShowcase />
        </div>
      </SectionReveal>

      <section ref={storyRef} className={`${styles.section} ${styles.story}`} aria-labelledby="home-story-heading">
        <div className={`${styles.container} ${styles.storyGrid}`}>
          <div className={styles.collage}>
            <motion.div className={styles.collageMain} style={{ y: reduceMotion ? 0 : floatingBackY }}>
              <Image src="/stays/soleil/soleil1.jpg" alt={t("homeUpgrade.imageAlts.2")} fill sizes="(max-width: 700px) 85vw, 38vw" className={styles.cover} />
              <span className={styles.photoCaption}>MIAMI, FLORIDA</span>
            </motion.div>
            <motion.div className={styles.collageFloat} style={{ y: reduceMotion ? 0 : floatingY }}>
              <Image src="/yachts/166trinity/166trinity.jpg" alt={t("homeUpgrade.imageAlts.0")} fill sizes="(max-width: 700px) 48vw, 23vw" className={styles.cover} />
            </motion.div>
            <span className={styles.collageMark} aria-hidden>B.</span>
          </div>
          <SectionReveal className={styles.storyCopy}>
            <p className={styles.eyebrow}>{t("homeUpgrade.storyEyebrow")}</p>
            <h2 id="home-story-heading" className={styles.heading}>{t("homeUpgrade.storyLine1")}<br /><em>{t("homeUpgrade.storyLine2")}</em></h2>
            <p className={styles.body}>{t("homeUpgrade.storyBody")}</p>
            <div className={styles.storyNote}><span className={styles.line} /><p>{t("homeUpgrade.storyNote")}</p></div>
            <Link href="/about" className={styles.textButton}>{t("homeUpgrade.storyLink")}<ArrowUpRight size={16} aria-hidden /></Link>
          </SectionReveal>
        </div>
      </section>

      <SectionReveal className={`${styles.section} ${styles.process}`} aria-labelledby="home-process-heading">
        <div className={styles.container}>
          <div className={styles.processHeading}><p className={styles.eyebrow}>{t("homeUpgrade.processEyebrow")}</p><h2 id="home-process-heading" className={styles.heading}>{t("homeUpgrade.processTitle")} <em>{t("homeUpgrade.processEmphasis")}</em></h2></div>
          <div className={styles.steps}>{["discover", "curate", "experience"].map((step, index) => <motion.article key={step} className={styles.step} initial={{ opacity: 1, y: reduceMotion ? 0 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: reduceMotion ? 0 : 0.6, delay: reduceMotion ? 0 : index * 0.12 }}><span className={styles.stepNumber}>0{index + 1}</span><h3>{t(`homeUpgrade.steps.${step}.title`)}</h3><p>{t(`homeUpgrade.steps.${step}.body`)}</p></motion.article>)}</div>
        </div>
      </SectionReveal>

      <SectionReveal className={styles.weekend} aria-labelledby="home-weekend-heading">
        <div className={styles.weekendImage}><Image src="/yachts/166trinity/166trinity.jpg" alt="" fill sizes="100vw" className={styles.cover} /></div>
        <div className={styles.weekendShade} />
        <div className={`${styles.container} ${styles.weekendContent}`}>
          <p className={styles.eyebrow}>{t("home.featuredEyebrow")}</p>
          <h2 id="home-weekend-heading" className={styles.weekendTitle}>{t("homeUpgrade.weekendLine1")}<br /><em>{t("homeUpgrade.weekendLine2")}</em></h2>
          <p>{t("homeUpgrade.weekendBody")}</p>
          <Link href={CONTACT_TRIP_BUILDER_HREF} className={styles.primaryButton}>{t("common.planThisExperience")}<ArrowUpRight size={17} aria-hidden /></Link>
          <div className={styles.weekendDetails}>{["arrival", "water", "evening"].map((key, index) => <span key={key}><i>0{index + 1}</i>{t(`homeUpgrade.weekend.${key}`)}</span>)}</div>
        </div>
      </SectionReveal>

      <HomeClientMoments />

      <SectionReveal className={`${styles.section} ${styles.closing}`} aria-labelledby="home-closing-heading">
        <div className={styles.container}>
          <p className={styles.eyebrow}>{t("homeUpgrade.closingEyebrow")}</p>
          <h2 id="home-closing-heading" className={styles.heading}>{t("homeUpgrade.closingLine1")}<br /><em>{t("homeUpgrade.closingLine2")}</em></h2>
          <p className={styles.body}>{t("home.closingBody")}</p>
          <div className={styles.closingActions}><a href="https://wa.me/17866840345" target="_blank" rel="noopener noreferrer" className={styles.primaryButton}>{t("homeUpgrade.whatsapp")}<ArrowRight size={17} aria-hidden /></a><a href="tel:+17866840345" className={styles.textButton}><Phone size={15} aria-hidden />+1 (786) 684-0345</a></div>
          <div className={styles.closingWordmark} aria-hidden>BLACKLINE</div>
        </div>
      </SectionReveal>
    </div>
  );
}
