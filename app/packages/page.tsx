import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { CustomPackageWhatsApp } from "@/components/custom-package-whatsapp";
import { SectionReveal } from "@/components/section-reveal";
import { getPackageCards, type PackageCardData } from "@/lib/i18n/packages-page";
import { getI18n } from "@/lib/i18n/server";
import { getPhotographerShootSlides } from "@/lib/i18n/photographer-page";
import { ShootGallery } from "./shoot-gallery";
import en from "./content.en.json";
import es from "./content.es.json";
import styles from "./packages.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getI18n();
  return { title: t("common.packages"), description: (locale === "es" ? es : en).intro };
}

function PackageView({pkg,image,alt,note,featured=false}: {pkg:PackageCardData;image:string;alt:string;note:string;featured?:boolean}) {
  return <article className={featured?styles.featured:styles.package}>
    <div className={styles.packageImage}><Image src={image} alt={alt} fill sizes={featured?"(max-width: 800px) 100vw, 55vw":"(max-width: 800px) 100vw, 50vw"} className={styles.cover}/><span className={styles.imageLabel}>BLACKLINE / {featured?"SIGNATURE":"MIAMI"}</span></div>
    <div className={styles.packageCopy}><p className={styles.eyebrow}>{pkg.eyebrow}</p><h3>{pkg.title}</h3><p className={styles.tagline}>{pkg.tagline}</p><ul>{pkg.includes.map(item=><li key={item}>{item}</li>)}</ul>{pkg.note&&<p className={styles.packageNote}>{pkg.note}</p>}<div className={styles.packageBottom}><p>{note}</p><Link href={pkg.cta.href} className={featured?styles.primaryButton:styles.textLink}>{pkg.cta.label}<ArrowUpRight size={16} aria-hidden/></Link></div></div>
  </article>;
}

export default async function PackagesPage() {
  const { t, locale } = await getI18n();
  const copy=locale==="es"?es:en;
  const packages=getPackageCards(t);
  const featured=packages.find(pkg=>pkg.id==="weekend-signature")!;
  const others=packages.filter(pkg=>pkg.id!==featured.id);
  return <div className={styles.page}>
    <section className={styles.hero} aria-labelledby="packages-title"><Image src="/stays/soleil/soleil1.jpg" alt={copy.heroAlt} fill preload sizes="100vw" className={styles.heroImage}/><div className={styles.shade}/><div className={`${styles.container} ${styles.heroContent}`}><p className={styles.eyebrow}>{copy.eyebrow}</p><h1 id="packages-title">{copy.hero1}<br/><em>{copy.hero2}</em></h1><p className={styles.intro}>{copy.intro}</p><div className={styles.actions}><a href="#signature-packages" className={styles.primaryButton}>{copy.discover}<ArrowDown size={16} aria-hidden/></a><a href="#custom-package-builder" className={styles.textLink}>{copy.build}<ArrowUpRight size={15} aria-hidden/></a></div><div className={styles.heroFoot}><span>MIAMI / SOUTH FLORIDA</span><span>{copy.signature}</span></div></div></section>
    <section id="signature-packages" className={`${styles.container} ${styles.collection}`} aria-labelledby="signature-title"><div className={styles.sectionHead}><div><p className={styles.eyebrow}>{t("packagesPage.signatureEyebrow")}</p><h2 id="signature-title" className={styles.heading}>{copy.collection1}<br/><em>{copy.collection2}</em></h2></div><p>{copy.collectionBody}</p></div>
      <SectionReveal className={styles.featuredWrap} aria-label={featured.title}><PackageView pkg={featured} image="/home/miami-dusk.webp" alt={t("packagesPage.cards.weekendSignature.imageAlt")} note={t("packagesPage.indicativeNote")} featured/></SectionReveal>
      <div className={styles.packageGrid}>{others.map((pkg,i)=><SectionReveal key={pkg.id} aria-label={pkg.title}><PackageView pkg={pkg} image={i===0?"/stays/soleil/soleil1.jpg":"/yachts/166trinity/166trinity.jpg"} alt={i===0?copy.heroAlt:copy.yachtAlt} note={t("packagesPage.indicativeNote")}/></SectionReveal>)}</div>
    </section>
    <SectionReveal className={styles.process} aria-labelledby="process-title"><div className={styles.container}><div className={styles.sectionHead}><div><p className={styles.eyebrow}>{copy.processEyebrow}</p><h2 className={styles.heading} id="process-title">{copy.process1}<br/><em>{copy.process2}</em></h2></div><a href="#custom-package-builder" className={styles.textLink}>{copy.build}<ArrowDown size={15} aria-hidden/></a></div><div className={styles.steps}>{copy.steps.map((step,i)=><article key={step.title}><span>0{i+1}</span><h3>{step.title}</h3><p>{step.body}</p></article>)}</div></div></SectionReveal>
    <section id="custom-package-builder" className={`${styles.container} ${styles.builderSection}`} aria-labelledby="builder-title"><div className={styles.builderIntro}><p className={styles.eyebrow}>{t("packagesPage.yourItinerary")}</p><h2 id="builder-title" className={styles.heading}>{copy.builder1}<br/><em>{copy.builder2}</em></h2><p>{copy.builderBody}</p><div className={styles.builderGuide}>{copy.guide.map((item,i)=><p key={item}><span>0{i+1}</span>{item}</p>)}</div><p className={styles.builderNote}>{copy.builderNote}</p><Link href="/services" className={styles.textLink}>{t("packagesPage.browseServices")}<ArrowUpRight size={15} aria-hidden/></Link></div><div className={styles.builderForm}><div className={styles.formHeading}><span>{copy.formTitle}</span><span>BLACKLINE / MIAMI</span></div><CustomPackageWhatsApp idSuffix="packages"/></div></section>
    <SectionReveal id="photo-video-addon" className={styles.shootSection} aria-labelledby="shoot-title"><div className={styles.container}><div className={styles.sectionHead}><div><p className={styles.eyebrow}>{copy.shootEyebrow}</p><h2 id="shoot-title" className={styles.heading}>{copy.shoot1}<br/><em>{copy.shoot2}</em></h2></div><div className={styles.shootIntro}><p>{copy.shootBody}</p><Link href="/services/photographer" className={styles.textLink}>{copy.shootLink}<ArrowUpRight size={15} aria-hidden/></Link></div></div><ShootGallery photos={getPhotographerShootSlides(t)} label={copy.shootGallery} previousLabel={copy.previousPhoto} nextLabel={copy.nextPhoto}/><a href="#custom-package-builder" className={styles.textLink}>{copy.shootAdd}<ArrowUpRight size={15} aria-hidden/></a></div></SectionReveal>
  </div>;
}
