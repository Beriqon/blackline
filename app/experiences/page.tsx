import { EXPERIENCE_MOMENTS as momentsGallery } from "@/lib/experience-moments";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { SectionReveal } from "@/components/section-reveal";
import { CONTACT_TRIP_BUILDER_HREF } from "@/lib/contact-hrefs";
import { getI18n } from "@/lib/i18n/server";
import { ExperienceGallery } from "./experience-gallery";
import en from "./content.en.json";
import es from "./content.es.json";
import styles from "./experiences.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return { title: t("common.experiences"), description: (locale === "es" ? es : en).intro };
}
const images = [
  { src: "/yachts/68azimuttheone/68azimuttheone3.jpg", detail: "/yachts/68azimuttheone/68azimuttheone8.jpg", href: "/services/yachts" },
  { src: "/vipvenues/livmiami.jpg", detail: "/vipvenues/joiabeach3.jpg", href: "/services/vip-nightlife" },
  { src: "/photography/carphotos/carphoto5.jpg", detail: "/exoticcar/lamborghini/huracanwhite/huracanwhite.webp", href: "/services/exotic-cars" },
  { src: "/privatejets/gulfstreamg550/gulfstreamg550.webp", detail: "/home/chauffeur-interior.webp", href: "/services/private-jets" },
];

export default async function ExperiencesPage() {
  const { locale } = await getI18n();
  const copy = locale === "es" ? es : en;
  return <div className={styles.page}>
    <section className={styles.hero} aria-labelledby="experience-title">
      <Image src="/sitephotos/miamibeach.jpg" alt={copy.heroAlt} fill preload sizes="100vw" className={styles.heroImage} />
      <div className={styles.shade} />
      <div className={styles.container + " " + styles.heroContent}>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h1 id="experience-title">{copy.hero1}<br /><em>{copy.hero2}</em></h1>
        <p className={styles.intro}>{copy.intro}</p>
        <a href="#signature-experiences" className={styles.textLink}>{copy.discover}<ArrowDown size={15} aria-hidden /></a>
        <div className={styles.heroFoot}><span>MIAMI / SOUTH FLORIDA</span><span>{copy.signature}</span></div>
      </div>
    </section>
    <section id="signature-experiences" className={styles.container + " " + styles.collection} aria-labelledby="collection-title">
      <div className={styles.sectionHead}><div><p className={styles.eyebrow}>{copy.collectionEyebrow}</p><h2 id="collection-title" className={styles.heading}>{copy.collection1}<br /><em>{copy.collection2}</em></h2></div><p>{copy.collectionBody}</p></div>
      <nav className={styles.index} aria-label={copy.indexLabel}>{copy.experiences.map((item,i)=><a key={item.id} href={"#"+item.id}><span>0{i+1}</span>{item.label}<ArrowDown size={13} aria-hidden /></a>)}</nav>
      {copy.experiences.map((item,i)=><SectionReveal key={item.id} id={item.id} className={styles.experience + " " + (i%2 ? styles.reverse : "")} aria-labelledby={item.id+"-title"}>
        <div className={styles.visual}>
          <div className={styles.mainPhoto + " " + (i===3 ? styles.jetPhoto : "")}><Image src={images[i].src} alt={item.alt} fill sizes="(max-width: 800px) 90vw, 50vw" className={styles.cover}/></div>
          <div className={styles.detailPhoto}><Image src={images[i].detail} alt={item.detailAlt} fill sizes="(max-width: 800px) 32vw, 18vw" className={styles.cover}/></div>
          <span className={styles.photoCaption}>{item.caption}</span>
        </div>
        <div className={styles.experienceCopy}><p className={styles.eyebrow}>0{i+1} / {item.label}</p><h3 id={item.id+"-title"}>{item.title1}<br /><em>{item.title2}</em></h3><p>{item.body}</p><ul>{item.details.map(detail=><li key={detail}>{detail}</li>)}</ul><Link href={images[i].href} className={styles.textLink}>{item.link}<ArrowUpRight size={15} aria-hidden /></Link></div>
      </SectionReveal>)}
    </section>
    <SectionReveal className={styles.daySection} aria-labelledby="day-title"><div className={styles.container}>
      <div className={styles.sectionHead}><div><p className={styles.eyebrow}>{copy.dayEyebrow}</p><h2 id="day-title" className={styles.heading}>{copy.day1}<br /><em>{copy.day2}</em></h2></div><p>{copy.dayBody}</p></div>
      <div className={styles.timeline}>{copy.moments.map((item,i)=><article key={item.label}><span className={styles.time}>{item.label}</span><span className={styles.rule} aria-hidden/><span className={styles.number}>0{i+1}</span><h3>{item.title}</h3><p>{item.body}</p></article>)}</div>
      <p className={styles.note}>{copy.dayNote}</p>
    </div></SectionReveal>
    <SectionReveal className={styles.container + " " + styles.gallerySection} aria-labelledby="gallery-title"><div className={styles.sectionHead}><div><p className={styles.eyebrow}>{copy.galleryEyebrow}</p><h2 id="gallery-title" className={styles.heading}>{copy.gallery1}{" "}<em>{copy.gallery2}</em></h2></div><p>{copy.galleryBody}</p></div><ExperienceGallery photos={momentsGallery} previousLabel={copy.previous} nextLabel={copy.next} label={copy.galleryEyebrow}/></SectionReveal>
    <SectionReveal className={styles.closing} aria-labelledby="experience-cta"><div className={styles.container + " " + styles.closingGrid}><div><p className={styles.eyebrow}>{copy.ctaEyebrow}</p><h2 id="experience-cta" className={styles.heading}>{copy.cta1}<br /><em>{copy.cta2}</em></h2></div><div><p>{copy.ctaBody}</p><Link href={CONTACT_TRIP_BUILDER_HREF} className={styles.primaryButton}>{copy.plan}<ArrowUpRight size={17} aria-hidden /></Link><Link href="/services" className={styles.textLink}>{copy.services}<ArrowUpRight size={15} aria-hidden /></Link></div></div></SectionReveal>
  </div>;
}

