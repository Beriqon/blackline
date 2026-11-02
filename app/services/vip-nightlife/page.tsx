import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { SectionReveal } from "@/components/section-reveal";
import { getVipFeaturedVenues, getVipTableRequestHints, getVipTransport } from "@/lib/i18n/vip-nightlife-page";
import { getI18n } from "@/lib/i18n/server";
import { VenueDirectory } from "./venue-directory";
import en from "./content.en.json";
import es from "./content.es.json";
import styles from "./nightlife.module.css";

export async function generateMetadata(): Promise<Metadata> { const {t}=await getI18n(); return {title:t("nav.vipNightlife"),description:t("vipNightlifePage.metaDescription")}; }
export default async function VipNightlifePage() {
 const {t,locale}=await getI18n();const copy=locale==="es"?es:en;
 const venues=getVipFeaturedVenues(t).map(venue=>({...venue,category:venue.subtitle===t("vipNightlifePage.subtitleBeachClub")?"beach":venue.subtitle===t("vipNightlifePage.subtitleVipDining")?"dining":"nightlife"}));
 const transport=getVipTransport(t); const hints=getVipTableRequestHints(t);
 return <div className={styles.page}>
  <section className={styles.hero} aria-labelledby="nightlife-title"><Image src="/vipvenues/livmiami.jpg" alt={copy.heroAlt} fill preload sizes="100vw" className={styles.heroImage}/><div className={styles.shade}/><div className={`${styles.container} ${styles.heroContent}`}><p className={styles.eyebrow}>{t("nav.vipNightlife")}</p><h1 id="nightlife-title">{copy.hero1}<br/><em>{copy.hero2}</em></h1><p className={styles.intro}>{copy.intro}</p><div className={styles.actions}><a href="https://wa.me/17866840345" target="_blank" rel="noopener noreferrer" className={styles.primaryButton}>{copy.request}<ArrowUpRight size={16} aria-hidden/></a><a href="#venues" className={styles.textLink}>{t("vipNightlifePage.viewVenues")}<ArrowDown size={15} aria-hidden/></a></div><div className={styles.heroFoot}><span>BLACKLINE / MIAMI</span><span>{copy.signature}</span></div></div></section>
  <section id="venues" className={`${styles.container} ${styles.venuesSection}`} aria-labelledby="venues-heading"><div className={styles.sectionHead}><div><p className={styles.eyebrow}>{t("vipNightlifePage.venuesEyebrow")}</p><h2 id="venues-heading" className={styles.heading}>{copy.venues1}<br/><em>{copy.venues2}</em></h2></div><p>{copy.venuesBody}</p></div><VenueDirectory venues={venues} labels={copy.filters} requestLabel={copy.venueRequest} requestIntro={copy.venueRequestIntro} emptyLabel={copy.empty} resultsLabel={copy.results}/><p className={styles.note}>{t("vipNightlifePage.venuesNote")}</p></section>
  <SectionReveal className={styles.transport} aria-labelledby="transport-title"><div className={styles.transportVisual}><Image src="/home/chauffeur-interior.webp" alt={t("homeUpgrade.directory.chauffeurInterior")} fill sizes="(max-width: 800px) 100vw, 50vw" className={styles.cover}/><span>{copy.transportCaption}</span></div><div className={styles.transportCopy}><p className={styles.eyebrow}>{t("vipNightlifePage.transportEyebrow")}</p><h2 id="transport-title" className={styles.heading}>{copy.transport1}<br/><em>{copy.transport2}</em></h2><p>{transport.lead}</p><p className={styles.minimum}>{transport.minimum}</p><ul>{transport.options.map(line=><li key={line}>{line}</li>)}</ul><Link href="/services/chauffeur-services" className={styles.textLink}>{copy.transportLink}<ArrowUpRight size={15} aria-hidden/></Link></div></SectionReveal>
  <SectionReveal id="table-request" className={`${styles.container} ${styles.requestSection}`} aria-labelledby="request-title"><div><p className={styles.eyebrow}>{t("vipNightlifePage.requestEyebrow")}</p><h2 id="request-title" className={styles.heading}>{copy.request1}<br/><em>{copy.request2}</em></h2><p className={styles.requestBody}>{copy.requestBody}</p></div><div><ol className={styles.requestHints}>{hints.map((hint,i)=><li key={hint}><span>0{i+1}</span>{hint}</li>)}</ol><a href="https://wa.me/17866840345" target="_blank" rel="noopener noreferrer" className={styles.primaryButton}>{copy.request}<ArrowUpRight size={17} aria-hidden/></a><div className={styles.contactLinks}><a href="tel:+17866840345">+1 (786) 684-0345</a><a href="https://www.instagram.com/blackline_concierge/" target="_blank" rel="noopener noreferrer">Instagram<ArrowUpRight size={12} aria-hidden/></a></div></div></SectionReveal>
 </div>;
}
