import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { SectionReveal } from "@/components/section-reveal";
import { CONTACT_TRIP_BUILDER_HREF } from "@/lib/contact-hrefs";
import { getI18n } from "@/lib/i18n/server";
import { getLocalizedHomeServices } from "@/lib/i18n/home-services";
import en from "./overview.en.json";
import es from "./overview.es.json";
import styles from "./overview.module.css";

const chapters = [
  { id: "escapes", paths: ["exotic-cars", "yachts", "villas", "private-jets"] },
  { id: "adventure", paths: ["jetskis-jetcars", "atv"] },
  { id: "lifestyle", paths: ["private-chefs", "vip-nightlife", "photographer", "security-guards"] },
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getI18n();
  return { title: t("servicesPage.title"), description: (locale === "es" ? es : en).intro };
}

export default async function ServicesPage() {
  const { t, locale } = await getI18n();
  const copy = locale === "es" ? es : en;
  const services = getLocalizedHomeServices(t);
  return <div className={styles.page}>
    <section className={styles.hero} aria-labelledby="services-title">
      <div className={`${styles.container} ${styles.heroGrid}`}>
        <div className={styles.heroCopy}><p className={styles.eyebrow}>{copy.eyebrow}</p><h1 id="services-title">{copy.hero1}<br /><em>{copy.hero2}</em></h1><p>{copy.intro}</p><a href="#services-collection" className={styles.textLink}>{copy.discover}<ArrowDown size={15} aria-hidden /></a><span className={styles.location}>MIAMI / SOUTH FLORIDA</span></div>
        <div className={styles.heroVisual}><Image src="/home/chauffeur-exterior.webp" alt={t("homeUpgrade.directory.chauffeurExterior")} fill preload sizes="(max-width: 800px) 100vw, 55vw" className={styles.cover}/><div className={styles.heroShade}/><span className={styles.heroLabel}>{copy.heroLabel}</span></div>
      </div>
    </section>
    <nav className={`${styles.container} ${styles.navigation}`} aria-label={copy.navLabel}>
      <a href="#chauffeur"><span>01</span>{copy.chauffeurNav}<ArrowDown size={13} aria-hidden/></a>
      {chapters.map((chapter,i)=><a key={chapter.id} href={`#${chapter.id}`}><span>0{i+2}</span>{copy[chapter.id].nav}<ArrowDown size={13} aria-hidden/></a>)}
    </nav>
    <div id="services-collection" className={styles.collection}>
      <SectionReveal id="chauffeur" className={`${styles.container} ${styles.spotlight}`} aria-labelledby="chauffeur-title">
        <div className={styles.spotlightVisual}><Image src="/home/chauffeur-interior.webp" alt={t("homeUpgrade.directory.chauffeurInterior")} fill sizes="(max-width: 800px) 100vw, 50vw" className={styles.cover}/><span>{copy.chauffeurCaption}</span></div>
        <div className={styles.spotlightCopy}><p className={styles.eyebrow}>{t("homeServices.chauffeur.badge")}</p><h2 id="chauffeur-title" className={styles.heading}>{copy.chauffeur1}<br/><em>{copy.chauffeur2}</em></h2><p>{copy.chauffeurBody}</p><ul>{["airport","evening","private"].map(key=><li key={key}>{t(`homeUpgrade.directory.chauffeurFeatures.${key}`)}</li>)}</ul><Link href="/services/chauffeur-services" className={styles.primaryButton}>{t("homeUpgrade.directory.chauffeurLink")}<ArrowUpRight size={17} aria-hidden/></Link></div>
      </SectionReveal>
      {chapters.map((chapter,chapterIndex)=><section key={chapter.id} id={chapter.id} className={`${styles.container} ${styles.chapter}`} aria-labelledby={`${chapter.id}-title`}>
        <div className={styles.chapterHeading}><span className={styles.chapterNumber}>0{chapterIndex+2}</span><div><p className={styles.eyebrow}>{copy[chapter.id].eyebrow}</p><h2 className={styles.heading} id={`${chapter.id}-title`}>{copy[chapter.id].title}</h2></div><p>{copy[chapter.id].body}</p></div>
        <div className={styles.grid}>{chapter.paths.map((path,index)=>{
          const service=services.find(item=>item.href===`/services/${path}`);
          if(!service) return null;
          const image=path==="private-chefs"?"/privatechefs/food/food3.jpg":service.image;
          const altKeys: Record<string,string>={"yachts":"0","exotic-cars":"1","villas":"2"};
          const alt=path==="private-chefs"?t("homeUpgrade.directory.chefAlt"):altKeys[path]?t(`homeUpgrade.imageAlts.${altKeys[path]}`):service.imageAlt;
          return <SectionReveal key={path} className={styles.card} aria-labelledby={`service-${path}`} delay={index%2*.08}><Link href={service.href} className={styles.cardLink}><div className={styles.cardImage}><Image src={image} alt={alt} fill sizes="(max-width: 600px) 100vw, 50vw" className={styles.cover}/><span className={styles.photoIndex}>BLACKLINE / {String(chapters.slice(0,chapterIndex).reduce((sum,c)=>sum+c.paths.length,0)+index+1).padStart(2,"0")}</span></div><div className={styles.cardHeading}><h3 id={`service-${path}`}>{service.title}</h3><span className={styles.arrow}><ArrowUpRight size={21} aria-hidden/></span></div><p>{service.description}</p><span className={styles.cardCta}>{copy.explore}<ArrowUpRight size={13} aria-hidden/></span></Link></SectionReveal>;
        })}</div>
      </section>)}
    </div>
    <SectionReveal className={styles.closing} aria-labelledby="services-cta"><div className={`${styles.container} ${styles.closingGrid}`}><div><p className={styles.eyebrow}>{copy.ctaEyebrow}</p><h2 id="services-cta" className={styles.heading}>{copy.cta1}<br/><em>{copy.cta2}</em></h2></div><div><p>{copy.ctaBody}</p><Link href={CONTACT_TRIP_BUILDER_HREF} className={styles.primaryButton}>{copy.plan}<ArrowUpRight size={17} aria-hidden/></Link><Link href="/experiences" className={styles.textLink}>{copy.experiences}<ArrowUpRight size={15} aria-hidden/></Link></div></div></SectionReveal>
  </div>;
}
