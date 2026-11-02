import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Phone } from "lucide-react";
import { AtvBookingProvider } from "@/components/atv-booking-dialog";
import { AtvTourPricingGrid, AtvUtvPricingCards } from "@/components/atv-pricing-grids";
import { SectionReveal } from "@/components/section-reveal";
import { CONTACT_TRIP_BUILDER_HREF } from "@/lib/contact-hrefs";
import { ATV_CAROUSEL_SLIDES } from "@/lib/atv-gallery-data";
import { buildAtvWhatsappHref, getAtvBookingSteps, getAtvFaqItems, getAtvNightGlowBullets, getAtvRiderCards } from "@/lib/i18n/atv-page";
import { getI18n } from "@/lib/i18n/server";
import { RideGallery } from "./ride-gallery";
import styles from "./atv.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const {t}=await getI18n(); return {title:t("nav.atv"),description:t("atvPage.metaDescription")};
}
export default async function AtvPage() {
  const {t,locale}=await getI18n(); const es=locale==="es";
  const rides=getAtvRiderCards(t), faq=getAtvFaqItems(t);
  const ridePhotos=["/atv/atv1.webp","/atv/utv-2seat.webp","/atv/utv-4seat.webp"];
  return <AtvBookingProvider><div className={styles.page}>

    <section className={styles.hero} aria-labelledby="atv-title"><Image src="/atv/atv2.webp" alt={es?"Aventura en ATV en Miami":"An ATV adventure in Miami"} fill preload sizes="100vw" className={styles.heroImage}/><div className={styles.heroShade}/><div className={`${styles.container} ${styles.heroContent}`}><p className={styles.eyebrow}>{t("atvPage.heroEyebrow")} / MIAMI</p><h1 id="atv-title">{es?"Más allá":"Beyond"}<br/><em>{es?"del asfalto.":"the pavement."}</em></h1><p className={styles.intro}>{t("atvPage.heroBody")}</p><div className={styles.actions}><a href="#pricing" className={styles.primaryButton}>{t("atvPage.ctaViewPricing")}<ArrowDown size={16} aria-hidden/></a><a href="#gallery" className={styles.textLink}>{t("atvPage.galleryHeadline")}<ArrowUpRight size={15} aria-hidden/></a></div><div className={styles.heroFoot}><span>BLACKLINE / OFF-ROAD EXPERIENCES</span><span>{t("atvPage.bannerTagline")}</span></div></div></section>
    <nav className={styles.rideNav} aria-label={es?"Explora las experiencias":"Explore the ride experiences"}><div className={styles.container}><a href="#pricing"><span>01</span>{es?"Rutas ATV":"ATV trails"}<ArrowDown size={13} aria-hidden/></a><a href="#utv"><span>02</span>{es?"Aventura UTV":"UTV adventures"}<ArrowDown size={13} aria-hidden/></a><a href="#night-glow" className={styles.nightNav}><span>03</span>Night Glow<ArrowDown size={13} aria-hidden/></a><a href="#gallery"><span>04</span>{t("atvPage.galleryHeadline")}<ArrowDown size={13} aria-hidden/></a></div></nav>
    <section className={`${styles.container} ${styles.ridesSection}`} aria-labelledby="pick-ride-heading"><SectionReveal className={styles.sectionHead}><div><p className={styles.eyebrow}>{t("atvPage.pickRideEyebrow")}</p><h2 className={styles.heading} id="pick-ride-heading">{t("atvPage.pickRideHeadline")}</h2></div><p>{t("atvPage.pickRideBody")}</p></SectionReveal><div className={styles.rideGrid}>{rides.map((ride,i)=><SectionReveal key={ride.key} className={styles.rideCard} delay={i*.08}><div className={styles.ridePhoto}><Image src={ridePhotos[i]} alt={ride.title} fill sizes="(max-width: 700px) 100vw, 33vw" className={styles.cover}/><span>0{i+1}</span></div><div className={styles.rideBody}><p className={styles.eyebrow}>{ride.eyebrow}</p><h3>{ride.title}</h3><span className={styles.rideLine}>{ride.line}</span><p>{ride.blurb}</p><a href={i===0?"#pricing":"#utv"} className={styles.textLink}>{t("atvPage.ctaViewPricing")}<ArrowDown size={14} aria-hidden/></a></div></SectionReveal>)}</div></section>
    <SectionReveal id="pricing" className={styles.pricingSection} aria-labelledby="pricing-heading"><div className={styles.container}><div className={styles.sectionHead}><div><p className={styles.eyebrow}>{t("atvPage.pricingEyebrow")}</p><h2 className={styles.heading} id="pricing-heading">{t("atvPage.pricingHeadline")}</h2></div><p>{t("atvPage.pricingBody")}</p></div><div className={styles.pricing}><AtvTourPricingGrid/></div></div></SectionReveal>
    <SectionReveal id="utv" className={`${styles.container} ${styles.utvSection}`} aria-labelledby="utv-heading"><div className={styles.sectionHead}><div><p className={styles.eyebrow}>{t("atvPage.utvEyebrow")}</p><h2 className={styles.heading} id="utv-heading">{t("atvPage.utvHeadline")}</h2></div><p>{t("atvPage.utvBody")}</p></div><div className={styles.pricing}><AtvUtvPricingCards/></div></SectionReveal>
    <section id="night-glow" className={styles.nightSection} aria-labelledby="night-glow-heading">
      <div className={styles.nightAura} aria-hidden/>
      <div className={styles.container}>
        <div className={styles.nightTopline}><span>BLACKLINE / AFTER HOURS</span><span>{es?"CUANDO CAE EL SOL":"WHEN THE SUN GOES DOWN"}</span></div>
        <div className={styles.nightGrid}>
          <SectionReveal className={styles.nightCopy}>
            <p className={styles.nightEyebrow}><span aria-hidden/>{t("atvPage.nightGlowEyebrow")}</p>
            <h2 id="night-glow-heading" className={styles.glowTitle}>Night<br/><em>Glow.</em><span>{es?"AVENTURAS DESPUÉS DEL ANOCHECER":"THE AFTER-DARK EXPERIENCE"}</span></h2>
            <p className={styles.body}>{t("atvPage.nightGlowBody")}</p>
            <ul className={styles.nightBullets}>{getAtvNightGlowBullets(t).map((line,i)=><li key={line}><span>0{i+1}</span>{line}</li>)}</ul>
            <div className={styles.actions}><a href={buildAtvWhatsappHref(t,"night")} className={styles.glowButton}>{t("atvPage.nightGlowCta")}<ArrowUpRight size={17} aria-hidden/></a><Link href={CONTACT_TRIP_BUILDER_HREF} className={styles.textLink}>{t("atvPage.nightGlowItinerary")}<ArrowUpRight size={15} aria-hidden/></Link></div>
          </SectionReveal>
          <SectionReveal className={styles.nightVisual} delay={.12}>
            <div className={styles.nightPhoto}><Image src="/atv/utv1.webp" alt={es?"Luces rojas iluminan una salida nocturna de ATV y UTV":"Red lights illuminate an ATV and UTV ride after dark"} fill sizes="(max-width: 800px) 90vw, 45vw" className={styles.cover}/><div className={styles.nightPhotoShade}/><span className={styles.nightPhotoLabel}>{t("atvPage.nightGlowHeadline")}</span><span className={styles.nightCoordinate}>MIAMI, FL / AFTER DARK</span></div>
            <div className={styles.dayInset}><Image src="/atv/atv7.webp" alt={es?"Pilotos de ATV en una ruta diurna":"ATV riders on a daytime trail"} fill sizes="(max-width: 800px) 30vw, 15vw" className={styles.cover}/><span>{es?"DEL DÍA A LA NOCHE":"FROM DAYLIGHT TO NIGHTFALL"}</span></div>
            <div className={styles.neonRule} aria-hidden/>
          </SectionReveal>
        </div>
      </div>
    </section>
    <section id="gallery" className={styles.gallerySection} aria-labelledby="gallery-heading"><div className={styles.container}><SectionReveal className={styles.sectionHead}><div><p className={styles.eyebrow}>{t("atvPage.galleryEyebrow")}</p><h2 className={styles.heading} id="gallery-heading">{t("atvPage.galleryHeadline")}</h2></div><p>{es?"Momentos de la ruta. Desliza para ver nuestra galería de aventuras en ATV y UTV.":"Out on the trail, in good company. Swipe through our ATV and UTV ride gallery."}</p></SectionReveal><RideGallery photos={ATV_CAROUSEL_SLIDES} label={t("atvPage.galleryAria")} previousLabel={es?"Foto anterior":"Previous ride photo"} nextLabel={es?"Siguiente foto":"Next ride photo"}/></div></section>
    <SectionReveal id="faq" className={`${styles.container} ${styles.faqSection}`} aria-labelledby="faq-heading"><div><p className={styles.eyebrow}>{t("atvPage.faqEyebrow")}</p><h2 className={styles.heading} id="faq-heading">{t("atvPage.faqHeadline")}</h2></div><div className={styles.faqList}>{faq.map(item=><details key={item.q}><summary>{item.q}<span aria-hidden>+</span></summary><p>{item.a}</p></details>)}</div></SectionReveal>
    <SectionReveal id="book" className={styles.bookingSection} aria-labelledby="book-heading"><div className={`${styles.container} ${styles.bookingGrid}`}><div><p className={styles.eyebrow}>{t("atvPage.bookingEyebrow")}</p><h2 className={styles.heading} id="book-heading">{t("atvPage.bookingHeadline")}</h2><p className={styles.body}>{t("atvPage.bookingBody")}</p><ol className={styles.bookingSteps}>{getAtvBookingSteps(t).map((line,i)=><li key={line}><span>0{i+1}</span>{line}</li>)}</ol><div className={styles.actions}><a href={buildAtvWhatsappHref(t,"atv")} target="_blank" rel="noopener noreferrer" className={styles.primaryButton}>{t("common.whatsapp")}<ArrowUpRight size={16} aria-hidden/></a><a href="tel:+17866840345" className={styles.textLink}><Phone size={14} aria-hidden/>{t("atvPage.callUs")}</a></div><div className={styles.bookingLinks}><Link href={CONTACT_TRIP_BUILDER_HREF}>{t("contactPage.tripBuilder")}<ArrowUpRight size={13} aria-hidden/></Link><a href="https://www.instagram.com/blackline_concierge/" target="_blank" rel="noopener noreferrer">{t("common.instagram")}<ArrowUpRight size={13} aria-hidden/></a><a href="tel:+17866840345">+1 (786) 684-0345</a></div></div><div className={styles.bookingVisual}><div className={styles.bookingPhoto}><Image src="/atv/atv1.webp" alt={rides[0].title} fill sizes="(max-width: 800px) 90vw, 40vw" className={styles.cover}/></div><div className={styles.bookingInset}><Image src="/atv/utv1.webp" alt={rides[1].title} fill sizes="(max-width: 800px) 40vw, 20vw" className={styles.cover}/></div><span>BLACKLINE / MIAMI</span></div></div></SectionReveal>
  </div></AtvBookingProvider>;
}
