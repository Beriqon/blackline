"use client";
import Image from "next/image";
import Link from "next/link";
import { Car, Search, ArrowUpRight } from "lucide-react";
import { Suspense, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/locale-provider";
import { ScrollRevealItem } from "@/components/scroll-reveal-item";
import { SectionReveal } from "@/components/section-reveal";
import { ServicePhotographyAddon } from "@/components/service-photography-addon";
import { ExoticCatalogPagination } from "@/components/exotic-cars-pagination";
import { EXOTIC_CARS_DAILY, type ExoticCar } from "@/lib/exotic-cars-data";
import { exoticBrandFilterLabel, getLocalizedExoticCars } from "@/lib/i18n/exotic-cars-page";
import { exoticGalleryCoverStyle, parseExoticPriceUsd, sortExoticCars, type ExoticSortMode } from "@/lib/exotic-catalog-utils";
import { exoticPhotos, exoticSeats, exoticSpec } from "@/lib/exotic-presentation";
import { paginateSlice } from "@/lib/pagination";
import { EXOTIC_PHOTOGRAPHY_ADDON_IMAGES } from "@/lib/exotic-car-photos";
import styles from "@/app/services/exotic-cars/cars.module.css";
function CarCard({ car, query }: {
    car: ExoticCar;
    query: string;
}) {
    const { locale, t } = useLocale();
    const es = locale === "es";
    const raw = EXOTIC_CARS_DAILY.find(c => c.id === car.id) ?? car;
    const photos = exoticPhotos(car);
    const details = [exoticSpec(raw, "Style"), exoticSpec(raw, "Seats") ? exoticSpec(raw, "Seats") + " " + (es ? "plazas" : "seats") : undefined, exoticSpec(raw, "Color") ?? exoticSpec(raw, "Exterior")].filter(Boolean);
    return <Link className={styles.card} href={"/services/exotic-cars/" + car.id + (query ? "?" + query : "")}><div className={styles.cardPhoto}>{photos[0] ? <Image src={photos[0]} alt={car.name} fill sizes="(max-width:700px) 100vw, (max-width:1050px) 50vw, 33vw" style={exoticGalleryCoverStyle(car, 0)} className={styles.cardImage}/> : <div className={styles.placeholder}><Car size={38}/><span>{t("exoticCarsPage.photosComingSoon")}</span></div>}{car.featured && <span className={styles.badge}>{t("exoticCarsPage.featured")}</span>}{photos.length > 0 && <span className={styles.photoCount}>{photos.length} {es ? "fotos" : "photos"}</span>}<span className={styles.cardArrow}><ArrowUpRight size={17}/></span></div><div className={styles.cardBody}><p className={styles.eyebrow}>{car.group}</p><h3>{car.name}</h3><div className={styles.cardDetails}>{details.map(d => <span key={d}>{d}</span>)}</div><div className={styles.cardPrice}><p>{car.priceLine}</p><span>{es ? "Ver vehículo" : "Explore car"} ↗</span></div>{car.dualRentalOnCard && <p className={styles.chauffeurAvailable}>{es ? "También con chófer · bajo consulta" : "Chauffeur also available · on request"}</p>}</div></Link>;
}
function ExoticCarsCatalogInner() {
    const { locale, t } = useLocale();
    const es = locale === "es";
    const router = useRouter(), pathname = usePathname(), params = useSearchParams();
    const cars = useMemo(() => getLocalizedExoticCars(locale, t), [locale, t]);
    const brands = useMemo(() => [...new Set(EXOTIC_CARS_DAILY.map(c => c.group))].sort(), []);
    const valid = (key: string, allowed: string[], fallback = "all") => { const v = params.get(key) || fallback; return allowed.includes(v) ? v : fallback; };
    const q = params.get("q") || "", brand = valid("brand", ["all", ...brands]), budget = valid("budget", ["all", "under-500", "500-1000", "over-1000"]), seats = valid("seats", ["all", "2", "4", "5", "6"]), sort = valid("sort", ["featured-first", "price-asc", "price-desc", "name-asc", "name-desc"], "featured-first"), featured = params.get("featured") === "yes", photosOnly = params.get("photos") === "yes";
    const filtered = useMemo(() => {
        const matched = cars.filter(c => { const raw = EXOTIC_CARS_DAILY.find(r => r.id === c.id) ?? c; const price = parseExoticPriceUsd(c); return (brand === "all" || c.group === brand) && (!q || [c.name, c.group, ...(raw.specs ?? []).map(r => r.value)].join(" ").toLowerCase().includes(q.trim().toLowerCase())) && (seats === "all" || exoticSeats(raw) >= Number(seats)) && (!featured || c.featured) && (!photosOnly || exoticPhotos(c).length > 0) && (budget === "all" || (c.pricing === "daily" && price > 0 && (budget === "under-500" ? price < 500 : budget === "500-1000" ? price >= 500 && price < 1000 : price >= 1000))); });
        const sorted = sortExoticCars(matched, sort as ExoticSortMode);
        return sort.startsWith("price") ? [...sorted.filter(c => parseExoticPriceUsd(c) > 0), ...sorted.filter(c => parseExoticPriceUsd(c) === 0)] : sorted;
    }, [cars, brand, q, seats, featured, photosOnly, budget, sort]);
    const requested = Math.max(1, parseInt(params.get("page") || "1", 10) || 1);
    const { slice, pageCount, safePage, total } = paginateSlice(filtered, requested, 9);
    const active = [q, brand !== "all", budget !== "all", seats !== "all", featured, photosOnly].filter(Boolean).length;
    const clear = () => router.replace(pathname + "#exotic-fleet", { scroll: false });
    const goPage = (page: number) => { const p = new URLSearchParams(params.toString()); p.delete("page"); if (page > 1)
        p.set("page", String(page)); router.replace(pathname + (p.size ? "?" + p : "") + "#exotic-fleet", { scroll: false }); document.getElementById("exotic-fleet")?.scrollIntoView({ behavior: "smooth", block: "start" }); };
    const query = new URLSearchParams(params.toString());
    query.delete("page");
    if (safePage > 1)
        query.set("page", String(safePage));
    const heroCars = ["lamborghini-huracan-evo-blue", "rolls-royce-ghost-black-badge", "ferrari-purosangue-suv"].map(id => cars.find(c => c.id === id)).filter((c): c is ExoticCar => !!c && exoticPhotos(c).length > 0);
    const select = (name: string, label: string, value: string, options: [
        string,
        string
    ][]) => <label className={styles.field}><span>{label}</span><select name={name} defaultValue={value} onChange={e => e.currentTarget.form?.requestSubmit()}>{options.map(([v, l]) => <option value={v} key={v}>{l}</option>)}</select></label>;
    return <div className={styles.page}><SectionReveal className={styles.hero}>
      <div className={styles.heroStage}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>{t("exoticCarsPage.eyebrow")} · MIAMI</p>
          <h1>{es ? <>El arte de<br /><em>llegar.</em></> : <>The art of<br /><em>arrival.</em></>}</h1>
          <p>{es ? "Superdeportivos, SUV de lujo y grandes clásicos. Elige tu vehículo y descubre Miami a tu manera." : "Sculpted supercars, refined grand tourers and exceptional SUVs. Find your signature drive and make Miami yours."}</p>
          <a href="#exotic-fleet" className={styles.goldButton}>{es ? "Descubre la flota" : "Explore the fleet"}<ArrowUpRight size={16}/></a>
          <div className={styles.heroSignature}><span aria-hidden/> {es ? "Una ciudad. Llegadas inolvidables." : "One city. Unforgettable arrivals."}</div>
        </div>
        <div className={styles.heroCollage} aria-label={es ? "Una selección de nuestra flota" : "A selection from our fleet"}>
          <div className={styles.collageOrbit} aria-hidden/>
          {heroCars.map((car, index) => <Link key={car.id} href={"/services/exotic-cars/" + car.id} className={styles.collageCard} data-position={index}>
            <Image src={exoticPhotos(car)[0]} alt={car.name} fill sizes="(max-width:700px) 75vw, (max-width:1050px) 40vw, 38vw" priority={index === 0} className={styles.collageImage} style={exoticGalleryCoverStyle(car, 0)}/>
            <div className={styles.collageLabel}><div><span>{car.group}</span><strong>{car.name}</strong></div><ArrowUpRight size={16}/></div>
          </Link>)}
          <span className={styles.collageCaption}>{es ? "Seleccionados para tu llegada" : "Selected for your arrival"}</span>
        </div>
      </div>
    </SectionReveal>
 <section className={styles.collection} id="exotic-fleet"><div className={styles.collectionHeading}><div><p className={styles.eyebrow}>{es ? "La colección" : "The collection"}</p><h2>{t("exoticCarsPage.headline")}</h2></div><p>{cars.length} {es ? "vehículos seleccionados" : "exceptional vehicles"}</p></div>
 <form className={styles.filters} key={params.toString()} onSubmit={e => { e.preventDefault(); const data = new FormData(e.currentTarget), next = new URLSearchParams(); for (const [k, v] of data) {
        if (typeof v === "string" && v.trim() && v !== "all" && v !== "featured-first")
            next.set(k, v.trim());
    } router.replace(pathname + (next.size ? "?" + next : "") + "#exotic-fleet", { scroll: false }); }}>
 <div className={styles.searchRow}><label className={styles.searchField}><span>{es ? "Tu próximo viaje" : "Your next drive"}</span><div><Search size={17}/><input name="q" type="search" defaultValue={q} placeholder={es ? "Marca, modelo o color…" : "Search brand, model or colour…"}/></div></label><button className={styles.goldButton} type="submit">{es ? "Buscar" : "Find a car"}<ArrowUpRight size={15}/></button></div>
 <div className={styles.filterGrid}>{select("brand", t("exoticCarsPage.brand"), brand, [["all", t("exoticCarsPage.allBrands")], ...brands.map(b => [b, exoticBrandFilterLabel(b, t)] as [
            string,
            string
        ])])}{select("budget", es ? "Presupuesto diario (USD)" : "Daily budget (USD)", budget, [["all", es ? "Todos los precios" : "All budgets"], ["under-500", es ? "Menos de $500" : "Under $500"], ["500-1000", "$500 – $999"], ["over-1000", "$1,000+"]])}{select("seats", es ? "Plazas" : "Seats", seats, [["all", es ? "Cualquier grupo" : "Any group size"], ["2", "2+"], ["4", "4+"], ["5", "5+"], ["6", "6+"]])}{select("sort", t("exoticCarsPage.sortBy"), sort, [["featured-first", t("exoticCarsPage.sort.featuredFirst")], ["price-asc", t("exoticCarsPage.sort.priceAsc")], ["price-desc", t("exoticCarsPage.sort.priceDesc")], ["name-asc", t("exoticCarsPage.sort.nameAsc")], ["name-desc", t("exoticCarsPage.sort.nameDesc")]])}</div>
 <div className={styles.filterFooter}><div><label><input type="checkbox" name="featured" value="yes" defaultChecked={featured} onChange={e => e.currentTarget.form?.requestSubmit()}/>{t("exoticCarsPage.featured")}</label><label><input type="checkbox" name="photos" value="yes" defaultChecked={photosOnly} onChange={e => e.currentTarget.form?.requestSubmit()}/>{es ? "Con fotos" : "With photos"}</label></div><Link href="/services/chauffeur-services">{es ? "¿Prefieres un chófer?" : "Prefer to be driven?"} ↗</Link></div></form>
 <div className={styles.results} aria-live="polite"><p>{total === 1 ? t("exoticCarsPage.vehicleCount", { count: total }) : t("exoticCarsPage.vehicleCountPlural", { count: total })}{active > 0 && <span> · {active} {es ? "filtros activos" : "active filters"}</span>}</p>{(active > 0 || sort !== "featured-first") && <button onClick={clear}>{t("exoticCarsPage.clearFilters")} ×</button>}</div>
 {total > 0 ? <><div className={styles.carGrid}>{slice.map((car, i) => <ScrollRevealItem key={car.id} index={i}><CarCard car={car} query={query.toString()}/></ScrollRevealItem>)}</div><ExoticCatalogPagination page={safePage} pageCount={pageCount} total={total} pageSize={9} onPage={goPage} t={t}/></> : <div className={styles.empty}><Car size={36}/><h3>{es ? "Tu próximo viaje te espera" : "Your next drive is waiting"}</h3><p>{es ? "Prueba otra marca, presupuesto o menos filtros." : "Try a different brand, a wider budget or fewer filters."}</p><button className={styles.goldButton} onClick={clear}>{es ? "Ver toda la flota" : "Explore the full fleet"}</button></div>}
 <p className={styles.catalogNote}>{es ? "Las tarifas publicadas son por vehículo. Consulta requisitos, depósito y disponibilidad en cada página." : "Rates are per vehicle. View each car for rental requirements, security deposit and availability."}</p></section><ServicePhotographyAddon className="bg-[#0b0b0b]" headline={t("exoticCarsPage.photography.headline")} description={t("exoticCarsPage.photography.description")} images={EXOTIC_PHOTOGRAPHY_ADDON_IMAGES} marqueeDurationSec={175}/></div>;
}
export function ExoticCarsCatalog() { return <Suspense fallback={null}><ExoticCarsCatalogInner /></Suspense>; }
