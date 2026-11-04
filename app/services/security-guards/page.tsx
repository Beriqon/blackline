import {ManagedProductCollection} from "@/components/managed-product-collection";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { SectionReveal } from "@/components/section-reveal";
import { CONTACT_TRIP_BUILDER_HREF } from "@/lib/contact-hrefs";
import { getServiceLinks } from "@/lib/i18n/nav";
import { getI18n } from "@/lib/i18n/server";
import en from "./content.en.json";
import es from "./content.es.json";
import styles from "./security.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const { t }=await getI18n();
  return {title:t("nav.securityGuards"),description:t("securityGuardsPage.metaDescription")};
}
const pairImages=[{path:"chauffeur-services",src:"/home/chauffeur-exterior.webp",alt:"homeUpgrade.directory.chauffeurExterior"},{path:"villas",src:"/stays/soleil/soleil1.jpg",alt:"homeUpgrade.imageAlts.2"},{path:"yachts",src:"/yachts/166trinity/166trinity.jpg",alt:"homeUpgrade.imageAlts.0"}];
export default async function SecurityGuardsPage() {
  const {t,locale}=await getI18n();
  const copy=locale==="es"?es:en;
  const links=getServiceLinks(t).filter(s=>s.href!=="/services/security-guards");
  return <div className={styles.page}>
    <section className={styles.hero} aria-labelledby="security-title"><div className={`${styles.container} ${styles.heroGrid}`}><div className={styles.heroCopy}><p className={styles.eyebrow}>{t("securityGuardsPage.eyebrow")}</p><h1 id="security-title">{copy.hero1}<br/><em>{copy.hero2}</em></h1><p>{t("securityGuardsPage.heroBody")}</p><div className={styles.actions}><Link href={CONTACT_TRIP_BUILDER_HREF} className={styles.primaryButton}>{t("securityGuardsPage.requestCoverage")}<ArrowUpRight size={16} aria-hidden/></Link><a href="#rates" className={styles.textLink}>{t("securityGuardsPage.viewRates")}<ArrowDown size={15} aria-hidden/></a></div><span className={styles.location}>MIAMI / SOUTH FLORIDA</span></div><div className={styles.heroVisual}><Image src="/sitephotos/securityguard2.jpg" alt={copy.teamAlt} fill preload sizes="(max-width: 800px) 100vw, 55vw" className={styles.cover}/><div className={styles.shade}/><span>{copy.photoCaption}</span></div></div></section>
    <SectionReveal className={`${styles.container} ${styles.approach}`} aria-labelledby="approach-title"><div><p className={styles.eyebrow}>{copy.approachEyebrow}</p><h2 id="approach-title" className={styles.heading}>{copy.approach1}<br/><em>{copy.approach2}</em></h2></div><div className={styles.approachBody}><p>{copy.approachBody}</p><p className={styles.note}>{copy.approachNote}</p></div></SectionReveal>
    <ManagedProductCollection service="security-guards" id="rates"/>
    <SectionReveal className={`${styles.container} ${styles.process}`} aria-labelledby="process-title"><p className={styles.eyebrow}>{copy.processEyebrow}</p><h2 id="process-title" className={styles.heading}>{copy.processTitle}</h2><div className={styles.steps}>{copy.steps.map((step,i)=><article key={step.title}><span>0{i+1}</span><h3>{step.title}</h3><p>{step.body}</p></article>)}</div></SectionReveal>
    <section className={styles.pairSection} aria-labelledby="pair-title"><div className={styles.container}><div className={styles.sectionHead}><div><p className={styles.eyebrow}>{t("securityGuardsPage.pairEyebrow")}</p><h2 id="pair-title" className={styles.heading}>{copy.pair1}<br/><em>{copy.pair2}</em></h2></div><p>{t("securityGuardsPage.pairBody")}</p></div><div className={styles.pairGrid}>{pairImages.map(item=>{const service=links.find(s=>s.href===`/services/${item.path}`)!;return <Link key={item.path} href={service.href} className={styles.pairCard}><div><Image src={item.src} alt={t(item.alt)} fill sizes="(max-width: 600px) 100vw, 33vw" className={styles.cover}/></div><h3>{service.label}<ArrowUpRight size={18} aria-hidden/></h3></Link>;})}</div><div className={styles.otherServices}>{links.filter(s=>!pairImages.some(item=>s.href===`/services/${item.path}`)).map(s=><Link key={s.href} href={s.href}>{s.label}<ArrowUpRight size={12} aria-hidden/></Link>)}</div></div></section>
    <SectionReveal className={styles.closing} aria-labelledby="security-cta"><div className={`${styles.container} ${styles.closingGrid}`}><div><p className={styles.eyebrow}>{copy.ctaEyebrow}</p><h2 id="security-cta" className={styles.heading}>{copy.cta1}<br/><em>{copy.cta2}</em></h2></div><div><p>{copy.ctaBody}</p><Link href={CONTACT_TRIP_BUILDER_HREF} className={styles.primaryButton}>{t("securityGuardsPage.requestCoverage")}<ArrowUpRight size={17} aria-hidden/></Link></div></div></SectionReveal>
  </div>;
}
