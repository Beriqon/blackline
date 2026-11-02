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
import { CHAUFFEUR_FLEET_SORTED, FEATURED_CHAUFFEUR_ID_SET, type ChauffeurFleetEntry } from "@/lib/chauffeur-fleet-data";
import { chauffeurHourlyPrice, displayChauffeurRate } from "@/lib/chauffeur-presentation";
import { getLocalizedChauffeurFleet } from "@/lib/i18n/chauffeur-services-page";
import { exoticGalleryCoverStyle, type ExoticSortMode } from "@/lib/exotic-catalog-utils";
import { exoticPhotos, exoticSeats, exoticSpec } from "@/lib/exotic-presentation";
import { paginateSlice } from "@/lib/pagination";
import { EXOTIC_PHOTOGRAPHY_ADDON_IMAGES } from "@/lib/exotic-car-photos";
import styles from "@/app/services/exotic-cars/cars.module.css";
function CarCard({ car, query }: {
    car: ChauffeurFleetEntry;
    query: string;
}) {
    const { locale, t } = useLocale();
    const es = locale === "es";
    const raw = CHAUFFEUR_FLEET_SORTED.find(c => c.id === car.id) ?? car;
    const photos = exoticPhotos(car);
    const details = [exoticSpec(raw, "Style"), exoticSpec(raw, "Seats") ? exoticSpec(raw, "Seats") + " " + (es ? "plazas" : "seats") : undefined, exoticSpec(raw, "Color") ?? exoticSpec(raw, "Exterior")].filter(Boolean);
    return <Link className={styles.card} href={"/services/chauffeur-services/" + car.id + (query ? "?" + query : "")}><div className={styles.cardPhoto}>{photos[0] ? <Image src={photos[0]} alt={car.name} fill sizes="(max-width:700px) 100vw, (max-width:1050px) 50vw, 33vw" style={exoticGalleryCoverStyle(car, 0)} className={styles.cardImage}/> : <div className={styles.placeholder}><Car size={38}/><span>{t("exoticCarsPage.photosComingSoon")}</span></div>}{FEATURED_CHAUFFEUR_ID_SET.has(car.id) && <span className={styles.badge}>{t("exoticCarsPage.featured")}</span>}{photos.length > 0 && <span className={styles.photoCount}>{photos.length} {es ? "fotos" : "photos"}</span>}<span className={styles.cardArrow}><ArrowUpRight size={17}/></span></div><div className={styles.cardBody}><p className={styles.eyebrow}>{car.group}</p><h3>{car.name}</h3><div className={styles.cardDetails}>{details.map(d => <span key={d}>{d}</span>)}</div><div className={styles.cardPrice}><p>{displayChauffeurRate(car, es)}</p><span>{es ? "Ver vehículo" : "Explore vehicle"} ↗</span></div><p className={styles.chauffeurAvailable}>{es ? "Con chófer privado" : "Private chauffeur included"}</p></div></Link>;
}
function ChauffeurServicesCatalogInner() {
    const { locale, t } = useLocale();
    const es = locale === "es";
    const router = useRouter(), pathname = usePathname(), params = useSearchParams();
    const cars = useMemo(() => getLocalizedChauffeurFleet(locale, t), [locale, t]);
    const brands = useMemo(() => [...new Set(CHAUFFEUR_FLEET_SORTED.map(c => c.group))].sort(), []);
    const valid = (key: string, allowed: string[], fallback = "all") => { const v = params.get(key) || fallback; return allowed.includes(v) ? v : fallback; };
    const q = params.get("q") || "", brand = valid("brand", ["all", ...brands]), budget = valid("budget", ["all", "under-200", "200-300", "over-300", "on-request"]), seats = valid("seats", ["all", "2", "4", "5", "6"]), sort = valid("sort", ["featured-first", "price-asc", "price-desc", "name-asc", "name-desc"], "featured-first"), featured = params.get("featured") === "yes", photosOnly = params.get("photos") === "yes";
    const filtered = useMemo(() => {
        const matched = cars.filter(c => { const raw = CHAUFFEUR_FLEET_SORTED.find(r => r.id === c.id) ?? c; const price = chauffeurHourlyPrice(raw); return (brand === "all" || c.group === brand) && (!q || [c.name, c.group, ...(raw.specs ?? []).map(r => r.value)].join(" ").toLowerCase().includes(q.trim().toLowerCase())) && (seats === "all" || exoticSeats(raw) >= Number(seats)) && (!featured || FEATURED_CHAUFFEUR_ID_SET.has(c.id)) && (!photosOnly || exoticPhotos(c).length > 0) && (budget === "all" || (budget === "on-request" ? price === null : price !== null && (budget === "under-200" ? price < 200 : budget === "200-300" ? price >= 200 && price < 300 : price >= 300))); });
        if (sort === "featured-first")
            return matched;
        return [...matched].sort((a, b) => {
            if (sort.startsWith("price")) {
                const pa = chauffeurHourlyPrice(a), pb = chauffeurHourlyPrice(b);
                if (pa === null)
                    return pb === null ? 0 : 1;
                if (pb === null)
                    return -1;
                return sort === "price-asc" ? pa - pb : pb - pa;
            }
            return (sort === "name-desc" ? -1 : 1) * a.name.localeCompare(b.name, locale);
        });
    }, [cars, brand, q, seats, featured, photosOnly, budget, sort]);
    const requested = Math.max(1, parseInt(params.get("page") || "1", 10) || 1);
    const { slice, pageCount, safePage, total } = paginateSlice(filtered, requested, 9);
    const active = [q, brand !== "all", budget !== "all", seats !== "all", featured, photosOnly].filter(Boolean).length;
    const clear = () => router.replace(pathname + "#chauffeur-fleet", { scroll: false });
    const goPage = (page: number) => {
        const p = new URLSearchParams(params.toString());
        p.delete("page");
        if (page > 1)
            p.set("page", String(page));
        router.replace(pathname + (p.size ? "?" + p : "") + "#chauffeur-fleet", { scroll: false });
        document.getElementById("chauffeur-fleet")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const query = new URLSearchParams(params.toString());
    query.delete("page");
    if (safePage > 1)
        query.set("page", String(safePage));
    const heroCars = ["exclusive-sprinter-chauffeur", "maybach-van-royal-blue", "maybach-van-tiffany-blue"].map(id => cars.find(c => c.id === id)).filter((c): c is ChauffeurFleetEntry => !!c && exoticPhotos(c).length > 0);
    const select = (name: string, label: string, value: string, options: [
        string,
        string
    ][]) => <label className={styles.field}><span>{label}</span><select name={name} defaultValue={value} onChange={e => e.currentTarget.form?.requestSubmit()}>{options.map(([v, l]) => <option value={v} key={v}>{l}</option>)}</select></label>;
    return <div className={styles.page}><SectionReveal className={styles.hero}>
      <div className={styles.heroStage}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>{t("chauffeurServicesPage.eyebrow")} · MIAMI</p>
          <h1>{es ? <>Cada viaje.<br /><em>Sin esfuerzo.</em></> : <>Every mile.<br /><em>Effortless.</em></>}</h1>
          <p>{es ? "Chóferes privados, interiores excepcionales y viajes a tu medida. Desde el aeropuerto hasta tu última parada en Miami." : "Private chauffeurs, exceptional interiors and a schedule that moves with you. From airport arrivals to your last stop in Miami."}</p>
          <a href="#chauffeur-fleet" className={styles.goldButton}>{es ? "Descubre la flota" : "Explore the fleet"}<ArrowUpRight size={16}/></a>
          <Link href="/contact#whatsapp-trip-builder" className="ml-5 inline-block text-[10px] text-gold">{es ? "Organiza tu viaje" : "Plan your journey"} ↗</Link>
          <div className={styles.heroSignature}><span aria-hidden/> {es ? "Tu tiempo. En las mejores manos." : "Your time. Beautifully taken care of."}</div>
        </div>
        <div className={styles.heroCollage} aria-label={es ? "Una selección de nuestra flota" : "A selection from our fleet"}>
          <div className={styles.collageOrbit} aria-hidden/>
          {heroCars.map((car, index) => <Link key={car.id} href={"/services/chauffeur-services/" + car.id} className={styles.collageCard} data-position={index}>
            <Image src={exoticPhotos(car)[0]} alt={car.name} fill sizes="(max-width:700px) 75vw, (max-width:1050px) 40vw, 38vw" priority={index === 0} className={styles.collageImage} style={exoticGalleryCoverStyle(car, 0)}/>
            <div className={styles.collageLabel}><div><span>{car.group}</span><strong>{car.name}</strong></div><ArrowUpRight size={16}/></div>
          </Link>)}
          <span className={styles.collageCaption}>{es ? "Seleccionados para tu llegada" : "Selected for your arrival"}</span>
        </div>
      </div>
    </SectionReveal>
 <section className={styles.collection} id="chauffeur-fleet"><div className={styles.collectionHeading}><div><p className={styles.eyebrow}>{es ? "La colección" : "The collection"}</p><h2>{t("chauffeurServicesPage.headline")}</h2></div><p>{cars.length} {es ? "vehículos seleccionados" : "exceptional vehicles"}</p></div>
 <form className={styles.filters} key={params.toString()} onSubmit={e => {
            e.preventDefault();
            const data = new FormData(e.currentTarget), next = new URLSearchParams();
            for (const [k, v] of data) {
                if (typeof v === "string" && v.trim() && v !== "all" && v !== "featured-first")
                    next.set(k, v.trim());
            }
            router.replace(pathname + (next.size ? "?" + next : "") + "#chauffeur-fleet", { scroll: false });
        }}>
 <div className={styles.searchRow}><label className={styles.searchField}><span>{es ? "Tu próximo viaje" : "Your next journey"}</span><div><Search size={17}/><input name="q" type="search" defaultValue={q} placeholder={es ? "Marca, modelo o color…" : "Search brand, model or colour…"}/></div></label><button className={styles.goldButton} type="submit">{es ? "Buscar" : "Find your ride"}<ArrowUpRight size={15}/></button></div>
 <div className={styles.filterGrid}>{select("brand", t("exoticCarsPage.brand"), brand, [["all", t("exoticCarsPage.allBrands")], ...brands.map(b => [b, b] as [
                string,
                string
            ])])}{select("budget", es ? "Tarifa por hora (USD)" : "Hourly rate (USD)", budget, [["all", es ? "Todos los precios" : "All budgets"], ["under-200", es ? "Menos de $200" : "Under $200"], ["200-300", "$200 – $299"], ["over-300", "$300+"], ["on-request", es ? "Bajo consulta" : "On request"]])}{select("seats", es ? "Plazas" : "Seats", seats, [["all", es ? "Cualquier grupo" : "Any group size"], ["2", "2+"], ["4", "4+"], ["5", "5+"], ["6", "6+"]])}{select("sort", t("exoticCarsPage.sortBy"), sort, [["featured-first", t("exoticCarsPage.sort.featuredFirst")], ["price-asc", t("exoticCarsPage.sort.priceAsc")], ["price-desc", t("exoticCarsPage.sort.priceDesc")], ["name-asc", t("exoticCarsPage.sort.nameAsc")], ["name-desc", t("exoticCarsPage.sort.nameDesc")]])}</div>
 <div className={styles.filterFooter}><div><label><input type="checkbox" name="featured" value="yes" defaultChecked={featured} onChange={e => e.currentTarget.form?.requestSubmit()}/>{t("exoticCarsPage.featured")}</label><label><input type="checkbox" name="photos" value="yes" defaultChecked={photosOnly} onChange={e => e.currentTarget.form?.requestSubmit()}/>{es ? "Con fotos" : "With photos"}</label></div><Link href="/services/exotic-cars">{es ? "¿Prefieres conducir?" : "Prefer to drive yourself?"} ↗</Link></div></form>
 <div className={styles.results} aria-live="polite"><p>{total === 1 ? `${total} ${es ? "vehículo con chófer" : "chauffeured vehicle"}` : `${total} ${es ? "vehículos con chófer" : "chauffeured vehicles"}`}{active > 0 && <span> · {active} {es ? "filtros activos" : "active filters"}</span>}</p>{(active > 0 || sort !== "featured-first") && <button onClick={clear}>{t("exoticCarsPage.clearFilters")} ×</button>}</div>
 {total > 0 ? <><div className={styles.carGrid}>{slice.map((car, i) => <ScrollRevealItem key={car.id} index={i}><CarCard car={car} query={query.toString()}/></ScrollRevealItem>)}</div><ExoticCatalogPagination page={safePage} pageCount={pageCount} total={total} pageSize={9} onPage={goPage} t={t}/></> : <div className={styles.empty}><Car size={36}/><h3>{es ? "Tu próximo viaje te espera" : "Your next journey is waiting"}</h3><p>{es ? "Prueba otra marca, presupuesto o menos filtros." : "Try a different brand, a wider budget or fewer filters."}</p><button className={styles.goldButton} onClick={clear}>{es ? "Ver toda la flota" : "Explore the full fleet"}</button></div>}
 <p className={styles.catalogNote}>{es ? "Las tarifas indicadas son del servicio con chófer. Los vehículos sin tarifa por hora se cotizan bajo consulta." : "Rates shown are for chauffeur service. Vehicles without a published hourly rate are quoted on request."}</p></section><ServicePhotographyAddon className="bg-[#0b0b0b]" headline={t("chauffeurServicesPage.photography.headline")} description={t("chauffeurServicesPage.photography.description")} images={EXOTIC_PHOTOGRAPHY_ADDON_IMAGES} marqueeDurationSec={175}/></div>;
}
export function ChauffeurServicesCatalog() { return <Suspense fallback={null}><ChauffeurServicesCatalogInner /></Suspense>; }
