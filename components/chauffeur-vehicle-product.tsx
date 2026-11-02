"use client";
import Link from "next/link";
import { ChevronLeft, ArrowUpRight } from "lucide-react";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/components/locale-provider";
import { ExoticCarGallery } from "@/components/exotic-car-gallery";
import { ExoticCarBookingPanel } from "@/components/exotic-car-booking-panel";
import { SectionReveal } from "@/components/section-reveal";
import { ServicePhotographyAddon } from "@/components/service-photography-addon";
import { localizeChauffeurFleetEntry } from "@/lib/i18n/chauffeur-services-page";
import { displayChauffeurRate, CHAUFFEUR_FILTER_KEYS } from "@/lib/chauffeur-presentation";
import { CHAUFFEUR_FLEET_SORTED, type ChauffeurFleetEntry } from "@/lib/chauffeur-fleet-data";
import { exoticSeats, exoticSpec, exoticPhotos } from "@/lib/exotic-presentation";
import { EXOTIC_PHOTOGRAPHY_ADDON_IMAGES } from "@/lib/exotic-car-photos";
import Image from "next/image";
import { exoticGalleryCoverStyle } from "@/lib/exotic-catalog-utils";
import styles from "@/app/services/exotic-cars/cars.module.css";
function CarBackLink() {
    const params = useSearchParams(), { t } = useLocale();
    const query = new URLSearchParams();
    for (const key of CHAUFFEUR_FILTER_KEYS) {
        const value = params.get(key);
        if (value)
            query.set(key, value);
    }
    return <Link className={styles.backLink} href={"/services/chauffeur-services" + (query.size ? "?" + query : "") + "#chauffeur-fleet"}><ChevronLeft size={15}/>{t("chauffeurServicesPage.headline")}</Link>;
}
export function ChauffeurVehicleProduct({ car }: {
    car: ChauffeurFleetEntry;
}) {
    const { locale, t } = useLocale();
    const es = locale === "es";
    const vehicle = useMemo(() => localizeChauffeurFleetEntry(car, locale, t), [car, locale, t]);
    const related = CHAUFFEUR_FLEET_SORTED.filter(c => c.id !== car.id && c.group === car.group).slice(0, 3);
    const rate = displayChauffeurRate(vehicle, es);
    const displayValue = (value: string) => value.includes("XXX") ? (es ? "Bajo consulta" : "On request") : value;
    return <div className={styles.productPage}><SectionReveal className={styles.productHeader}><div className={styles.productHeaderInner}><Suspense fallback={<Link className={styles.backLink} href="/services/chauffeur-services">← {t("chauffeurServicesPage.headline")}</Link>}><CarBackLink /></Suspense><div className={styles.productTitleRow}><div><p className={styles.eyebrow}>{vehicle.group} · MIAMI</p><h1>{vehicle.name}</h1><div className={styles.productQuickFacts}><span>{es ? "Chófer privado" : "Private chauffeur"}</span>{exoticSeats(car) > 0 && <span>{exoticSpec(car, "Seats")} {es ? "plazas" : "seats"}</span>}{exoticSpec(car, "Style") && <span>{exoticSpec(car, "Style")}</span>}</div></div><div className={styles.headerPrice}><span>{es ? "Tu próxima llegada" : "Your next arrival"}</span><p>{rate}</p></div></div></div></SectionReveal>
 <section className={styles.productContent}><div className={styles.productGrid}><div className={styles.productGallery}><ExoticCarGallery key={car.id} car={vehicle}/></div><aside className={styles.bookingAside}><div className={styles.bookingIntro}><p className={styles.eyebrow}>{es ? "Tu viaje, organizado" : "Your journey, arranged"}</p><h2>{rate}</h2>{vehicle.priceNote && <p>{vehicle.priceNote}</p>}<p>{es ? "Tu conductor, tu itinerario. Coordina las paradas y los horarios con nuestro equipo." : "Your driver, your itinerary. Coordinate your stops and timing with our team."}</p></div><ExoticCarBookingPanel key={car.id} car={vehicle} chauffeurOnly className={styles.bookingPanel}/></aside></div>
 <div className={styles.information}><SectionReveal className={styles.story}><p className={styles.eyebrow}>{t("exoticCarsPage.vehicleDescription")}</p><h2>{es ? "Llega con tranquilidad." : "Arrive at ease."}</h2><p>{vehicle.description}</p>{vehicle.highlights && vehicle.highlights.length > 0 && <ul>{vehicle.highlights.map(item => <li key={item}>{item}</li>)}</ul>}<Link href="/contact#whatsapp-trip-builder" className={styles.textLink}>{es ? "Organiza un itinerario a medida" : "Arrange a custom itinerary"} <ArrowUpRight size={16}/></Link></SectionReveal><div className={styles.specificationPanel}><p className={styles.eyebrow}>{t("exoticCarsPage.vehicleDetails")}</p><h2>{es ? "Los detalles." : "In the details."}</h2>{vehicle.specs && vehicle.specs.length > 0 ? <dl>{vehicle.specs.map(row => <div key={row.label}><dt>{row.label}</dt><dd>{displayValue(row.value)}</dd></div>)}</dl> : <p>{es ? "Consulta los detalles del vehículo con nuestro equipo." : "Ask our team for the full vehicle details."}</p>}</div></div>
 {vehicle.requirements && vehicle.requirements.length > 0 && <SectionReveal className={styles.requirements}><p className={styles.eyebrow}>{es ? "Antes de salir" : "Before you drive"}</p><h2>{t("exoticCarsPage.importantRequirements")}</h2>{car.source === "daily" && <p className="mb-5 text-xs leading-relaxed text-cream/55">{t("chauffeurServicesPage.selfDriveNoteBefore")} <strong>{t("chauffeurServicesPage.selfDriveHighlight")}</strong>{t("chauffeurServicesPage.selfDriveNoteAfter")}</p>}<ul>{vehicle.requirements.map(item => <li key={item}>{item}</li>)}</ul></SectionReveal>}
 {related.length > 0 && <section className={styles.related}><div className={styles.collectionHeading}><div><p className={styles.eyebrow}>{es ? "Sigue explorando" : "Keep exploring"}</p><h2>{es ? "Más de " : "More from "}{vehicle.group}</h2></div><Link href={"/services/chauffeur-services?brand=" + encodeURIComponent(car.group) + "#chauffeur-fleet"}>{es ? "Ver todos" : "View all"} ↗</Link></div><div className={styles.relatedGrid}>{related.map(c => <Link key={c.id} href={"/services/chauffeur-services/" + c.id} className={styles.relatedCard}><div>{exoticPhotos(c)[0] ? <Image src={exoticPhotos(c)[0]} alt={c.name} fill sizes="(max-width:700px) 90vw, 30vw" style={exoticGalleryCoverStyle(c, 0)} className="object-cover"/> : <span>{t("exoticCarsPage.photosComingSoon")}</span>}</div><h3>{c.name}</h3><p>{displayChauffeurRate(c, es)} ↗</p></Link>)}</div></section>}</section>
 <ServicePhotographyAddon className="bg-[#0b0b0b]" headline={t("chauffeurServicesPage.photography.headline")} description={t("chauffeurServicesPage.photography.description")} images={EXOTIC_PHOTOGRAPHY_ADDON_IMAGES} marqueeDurationSec={175}/></div>;
}
