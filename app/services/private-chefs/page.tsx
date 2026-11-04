import {ManagedProductCollection} from "@/components/managed-product-collection";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { SectionReveal } from "@/components/section-reveal";
import { CONTACT_TRIP_BUILDER_HREF } from "@/lib/contact-hrefs";
import { getServiceLinks } from "@/lib/i18n/nav";
import { getPrivateChefGallerySlides, getPrivateChefServiceCards, getPrivateChefVenues } from "@/lib/i18n/private-chefs-page";
import { getI18n } from "@/lib/i18n/server";
import { ChefCarousel } from "./chef-carousel";
import styles from "./chefs.module.css";
import en from "./content.en.json";
import es from "./content.es.json";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("nav.privateChefs"), description: t("privateChefsPage.metaDescription") };
}
export default async function PrivateChefsPage() {
  const { t, locale } = await getI18n();
  const c = locale === "es" ? es : en;
  const gallery = getPrivateChefGallerySlides(t);
  const pairs = getServiceLinks(t).filter(s => ["/services/yachts", "/services/villas", "/services/chauffeur-services", "/services/vip-nightlife"].includes(s.href));
  return <div className={styles.page}>
    <section className={styles.hero} aria-labelledby="chefs-title">
      <Image src="/privatechefs/food/food7.jpg" alt={c.heroAlt} fill preload sizes="100vw" className={styles.heroImage}/><div className={styles.heroShade}/>
      <div className={`${styles.container} ${styles.heroContent}`}><p className={styles.eyebrow}>{t("nav.privateChefs")} / MIAMI</p><h1 id="chefs-title">{c.hero1}<br/><em>{c.hero2}</em></h1><p className={styles.intro}>{c.intro}</p><div className={styles.actions}><Link href={CONTACT_TRIP_BUILDER_HREF} className={styles.primaryButton}>{t("privateChefsPage.requestChef")}<ArrowUpRight size={16} aria-hidden/></Link><a href="#meet-the-chefs" className={styles.textLink}>{t("privateChefsPage.meetTheChefs")}<ArrowDown size={15} aria-hidden/></a></div><div className={styles.heroFoot}><span>BLACKLINE / PRIVATE DINING</span><span>{c.signature}</span></div></div>
    </section>
    <SectionReveal className={`${styles.container} ${styles.story}`} aria-labelledby="dining-title"><div className={styles.storyVisual}><div className={styles.storyPhoto}><Image src="/privatechefs/food/food5.webp" alt={c.storyAlt} fill sizes="(max-width: 800px) 85vw, 40vw" className={styles.cover}/></div><div className={styles.detailPhoto}><Image src="/privatechefs/food/food2.avif" alt={gallery[0].alt} fill sizes="(max-width: 800px) 35vw, 17vw" className={styles.cover}/></div><span>{c.photoNote}</span></div><div className={styles.storyCopy}><p className={styles.eyebrow}>{t("privateChefsPage.bookEyebrow")}</p><h2 id="dining-title" className={styles.heading}>{c.story1}<br/><em>{c.story2}</em></h2><p>{t("privateChefsPage.bookBody")}</p><div className={styles.venues}>{getPrivateChefVenues(t).map((v,i)=><span key={v}><small>0{i+1}</small>{v}</span>)}</div></div></SectionReveal>
    <section id="meet-the-chefs" className={styles.rosterSection} aria-labelledby="roster-title"><div className={styles.container}><SectionReveal className={styles.sectionHead}><div><p className={styles.eyebrow}>{t("privateChefsPage.rosterEyebrow")}</p><h2 id="roster-title" className={styles.heading}>{c.roster1}<br/><em>{c.roster2}</em></h2></div><p>{t("privateChefsPage.rosterBody")}</p></SectionReveal>
    <ManagedProductCollection service="private-chefs"/></div></section>
    <section className={`${styles.container} ${styles.formats}`} aria-labelledby="formats-title"><SectionReveal className={styles.sectionHead}><div><p className={styles.eyebrow}>{c.formatsEyebrow}</p><h2 id="formats-title" className={styles.heading}>{c.formats1}<br/><em>{c.formats2}</em></h2></div><p>{t("privateChefsPage.heroBody")}</p></SectionReveal><div className={styles.formatGrid}>{getPrivateChefServiceCards(t).map((s,i)=><SectionReveal key={s.id} id={s.id==="private-chef"?"your-chef":"travel-chef"} className={styles.formatCard} delay={i*.08}><div className={styles.formatTop}><span className={styles.eyebrow}>{s.eyebrow}</span><span>0{i+1}</span></div><h3>{s.title}</h3><p>{s.description}</p><ul>{s.bullets.map(line=><li key={line}>{line}</li>)}</ul><Link href={CONTACT_TRIP_BUILDER_HREF} className={styles.textLink}>{t("privateChefsPage.requestChef")}<ArrowUpRight size={15} aria-hidden/></Link></SectionReveal>)}</div></section>
    <section className={styles.gallerySection} aria-labelledby="food-title"><div className={styles.container}><SectionReveal className={styles.sectionHead}><div><p className={styles.eyebrow}>{t("privateChefsPage.galleryEyebrow")}</p><h2 id="food-title" className={styles.heading}>{c.gallery1}<br/><em>{c.gallery2}</em></h2></div><p>{c.galleryBody}</p></SectionReveal><ChefCarousel label={t("privateChefsPage.galleryAria")} previousLabel={c.previousPhoto} nextLabel={c.nextPhoto} caption={c.galleryCaption} variant="food">{gallery.map((photo,i)=><figure key={photo.src} className={styles.foodPhoto}><Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 600px) 80vw, 420px" className={styles.cover}/><figcaption><span>PRIVATE DINING</span><span>{String(i+1).padStart(2,"0")}</span></figcaption></figure>)}</ChefCarousel></div></section>
    <SectionReveal className={`${styles.container} ${styles.process}`} aria-labelledby="process-title"><p className={styles.eyebrow}>{c.processEyebrow}</p><h2 id="process-title" className={styles.heading}>{c.process1}<br/><em>{c.process2}</em></h2><div className={styles.steps}>{c.steps.map((s,i)=><article key={s.title}><span>0{i+1}</span><h3>{s.title}</h3><p>{s.body}</p></article>)}</div></SectionReveal>
    <section className={styles.pairSection} aria-labelledby="pair-title"><div className={styles.container}><div className={styles.sectionHead}><div><p className={styles.eyebrow}>{c.pairEyebrow}</p><h2 id="pair-title" className={styles.heading}>{t("privateChefsPage.pairHeadline")}</h2></div><p>{t("privateChefsPage.pairBody")}</p></div><div className={styles.pairLinks}>{pairs.map(s=><Link href={s.href} key={s.href}>{s.label}<ArrowUpRight size={17} aria-hidden/></Link>)}</div><p className={styles.note}>{t("privateChefsPage.pairFooter")}</p></div></section>
    <SectionReveal className={styles.closing}><div className={`${styles.container} ${styles.closingGrid}`}><div><p className={styles.eyebrow}>{c.ctaEyebrow}</p><h2 className={styles.heading}>{c.cta1}<br/><em>{c.cta2}</em></h2></div><div><p>{c.ctaBody}</p><Link href={CONTACT_TRIP_BUILDER_HREF} className={styles.primaryButton}>{t("privateChefsPage.requestChef")}<ArrowUpRight size={17} aria-hidden/></Link></div></div></SectionReveal>
  </div>;
}
