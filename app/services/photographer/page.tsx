import {ManagedProductCollection} from "@/components/managed-product-collection";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { SectionReveal } from "@/components/section-reveal";
import { CONTACT_TRIP_BUILDER_HREF } from "@/lib/contact-hrefs";
import { getServiceLinks } from "@/lib/i18n/nav";
import { getPhotographerShootSlides } from "@/lib/i18n/photographer-page";
import { getI18n } from "@/lib/i18n/server";
import { ShootGallery } from "./shoot-gallery";
import en from "./content.en.json";
import es from "./content.es.json";
import styles from "./photos.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const {t}=await getI18n();return {title:t("nav.photographer"),description:t("photographerPage.metaDescription")};
}
export default async function PhotographerPage() {
  const {t,locale}=await getI18n();
  const copy=locale==="es"?es:en;
  const slides=getPhotographerShootSlides(t);
  const services=getServiceLinks(t).filter(s=>s.href!=="/services/photographer");
  return <div className={styles.page}>
    <section className={styles.hero} aria-labelledby="shoots-title"><div className={`${styles.container} ${styles.heroGrid}`}><div className={styles.heroCopy}><p className={styles.eyebrow}>{t("nav.photographer")}</p><h1 id="shoots-title">{copy.hero1}<br/><em>{copy.hero2}</em></h1><p>{copy.intro}</p><div className={styles.actions}><Link href={CONTACT_TRIP_BUILDER_HREF} className={styles.primaryButton}>{t("photographerPage.addToBooking")}<ArrowUpRight size={16} aria-hidden/></Link><a href="#past-shoots-heading" className={styles.textLink}>{t("photographerPage.seePastWork")}<ArrowDown size={15} aria-hidden/></a></div><span className={styles.location}>BLACKLINE / MIAMI</span></div><div className={styles.heroVisual}><div className={styles.mainPhoto}><Image src="/photography/carphotos/carphoto14.jpg" alt={copy.heroAlt} fill preload sizes="(max-width: 800px) 85vw, 45vw" className={styles.cover}/></div><div className={styles.insetPhoto}><Image src="/photography/jetskiphotos/jetskiphoto1.jpg" alt={copy.insetAlt} fill sizes="(max-width: 800px) 35vw, 18vw" className={styles.cover}/></div><span>{copy.caption}</span></div></div></section>
    <ManagedProductCollection service="photographer" id="formats"/>
    <SectionReveal id="past-shoots" className={styles.portfolio} aria-labelledby="past-shoots-heading"><div className={styles.container}><div className={styles.sectionHead}><div><p className={styles.eyebrow}>{t("photographerPage.pastEyebrow")}</p><h2 id="past-shoots-heading" className={styles.heading}>{copy.gallery1}<br/><em>{copy.gallery2}</em></h2></div><p>{copy.galleryBody}</p></div><ShootGallery photos={slides} label={t("photographerPage.galleryAria")} previousLabel={copy.previous} nextLabel={copy.next}/></div></SectionReveal>
    <SectionReveal className={`${styles.container} ${styles.process}`} aria-labelledby="process-title"><p className={styles.eyebrow}>{t("photographerPage.howEyebrow")}</p><h2 className={styles.heading} id="process-title">{copy.process1}<br/><em>{copy.process2}</em></h2><div className={styles.steps}>{copy.steps.map((step,i)=><article key={step.title}><span>0{i+1}</span><h3>{step.title}</h3><p>{step.body}</p></article>)}</div></SectionReveal>
    <section className={styles.pairSection} aria-labelledby="pair-title"><div className={styles.container}><div className={styles.sectionHead}><div><p className={styles.eyebrow}>{copy.pairEyebrow}</p><h2 id="pair-title" className={styles.heading}>{copy.pairTitle}</h2></div><p>{t("photographerPage.howBody")}</p></div><div className={styles.serviceLinks}>{services.map(service=><Link href={service.href} key={service.href}>{service.label}<ArrowUpRight size={16} aria-hidden/></Link>)}</div><p className={styles.note}>{t("photographerPage.howFooter")}</p></div></section>
    <SectionReveal className={styles.closing} aria-labelledby="photo-cta"><div className={`${styles.container} ${styles.closingGrid}`}><div><p className={styles.eyebrow}>{copy.ctaEyebrow}</p><h2 id="photo-cta" className={styles.heading}>{copy.cta1}<br/><em>{copy.cta2}</em></h2></div><div><p>{copy.ctaBody}</p><Link href={CONTACT_TRIP_BUILDER_HREF} className={styles.primaryButton}>{t("photographerPage.addToBooking")}<ArrowUpRight size={17} aria-hidden/></Link></div></div></SectionReveal>
  </div>;
}
