"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "@/components/locale-provider";
import { getLocalizedHomeServices } from "@/lib/i18n/home-services";
import styles from "@/app/home.module.css";

const chapters = [
  { id: "escapes", paths: ["exotic-cars", "yachts", "villas", "private-jets"] },
  { id: "adventure", paths: ["jetskis-jetcars", "atv"] },
  { id: "lifestyle", paths: ["private-chefs", "vip-nightlife", "photographer", "security-guards"] },
];

export function HomeServicesShowcase() {
  const t = useTranslations();
  const reduceMotion = useReducedMotion();
  const services = getLocalizedHomeServices(t);

  return (
    <div className={styles.servicesDirectory}>
      <article className={styles.chauffeurSpotlight}>
        <Link href="/services/chauffeur-services" className={styles.chauffeurVisual} aria-label={t("homeUpgrade.directory.chauffeurLink")}>
          <div className={styles.chauffeurExterior}>
            <Image src="/home/chauffeur-exterior.webp" alt={t("homeUpgrade.directory.chauffeurExterior")} fill sizes="(max-width: 700px) 100vw, 55vw" className={styles.cover} />
          </div>
          <span className={styles.chauffeurPhotoLabel}>THE BLACKLINE FLEET</span>
          <div className={styles.chauffeurInterior}>
            <Image src="/home/chauffeur-interior.webp" alt={t("homeUpgrade.directory.chauffeurInterior")} fill sizes="(max-width: 700px) 35vw, 16vw" className={styles.cover} />
          </div>
        </Link>
        <div className={styles.chauffeurCopy}>
          <p className={styles.eyebrow}><span className={styles.bookedDot} />{t("homeServices.chauffeur.badge")}</p>
          <h3>{t("homeServices.chauffeur.title")}</h3>
          <p className={styles.chauffeurTagline}>{t("homeUpgrade.directory.chauffeurTagline")}</p>
          <p className={styles.body}>{t("homeServices.chauffeur.description")}</p>
          <ul>{["airport", "evening", "private"].map((key) => <li key={key}><Check size={14} aria-hidden />{t(`homeUpgrade.directory.chauffeurFeatures.${key}`)}</li>)}</ul>
          <Link href="/services/chauffeur-services" className={styles.primaryButton}>{t("homeUpgrade.directory.chauffeurLink")}<ArrowUpRight size={17} aria-hidden /></Link>
        </div>
      </article>

      {chapters.map((chapter, chapterIndex) => (
        <section key={chapter.id} className={styles.serviceChapter} aria-labelledby={`services-${chapter.id}`}>
          <div className={styles.chapterHeading}>
            <span className={styles.chapterNumber}>0{chapterIndex + 1}</span>
            <div><h3 id={`services-${chapter.id}`}>{t(`homeUpgrade.directory.${chapter.id}.title`)}</h3><p>{t(`homeUpgrade.directory.${chapter.id}.body`)}</p></div>
          </div>
          <div className={chapter.paths.length === 2 ? styles.servicePair : styles.serviceChapterGrid}>
            {chapter.paths.map((path, index) => {
              const service = services.find((item) => item.href === `/services/${path}`);
              if (!service) return null;
              const image = path === "private-chefs" ? "/privatechefs/food/food3.jpg" : service.image;
              const correctedAlts: Record<string, string> = { yachts: "0", "exotic-cars": "1", villas: "2" };
              const alt = path === "private-chefs" ? t("homeUpgrade.directory.chefAlt") : correctedAlts[path] ? t(`homeUpgrade.imageAlts.${correctedAlts[path]}`) : service.imageAlt;
              return (
                <motion.article key={path} initial={{ opacity: 1, y: reduceMotion ? 0 : 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: reduceMotion ? 0 : 0.6, delay: reduceMotion ? 0 : index * 0.07 }}>
                  <Link href={service.href} className={styles.directoryCard}>
                    <div className={styles.directoryImage}>
                      <Image src={image} alt={alt} fill sizes={chapter.paths.length === 2 ? "(max-width: 700px) 100vw, 50vw" : "(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 25vw"} className={styles.cover} />
                      <span className={styles.directoryImageLabel}>BLACKLINE / {String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <div className={styles.directoryCardHeading}><h4>{service.title}</h4><span className={styles.directoryArrow}><ArrowUpRight size={18} aria-hidden /></span></div>
                    <p>{service.description}</p>
                    <span className={styles.directoryExplore}>{t("homeUpgrade.directory.exploreService")}<ArrowUpRight size={12} aria-hidden /></span>
                  </Link>
                </motion.article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
