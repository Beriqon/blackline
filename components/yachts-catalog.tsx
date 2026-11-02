"use client";
import { Ship, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, Suspense, } from "react";
import { ChauffeurServiceCrosslink } from "@/components/chauffeur-service-crosslink";
import { useLocale } from "@/components/locale-provider";
import { ScrollRevealItem } from "@/components/scroll-reveal-item";
import { SectionReveal } from "@/components/section-reveal";
import { ServicePhotographyAddon } from "@/components/service-photography-addon";
import { YachtBookingButton } from "@/components/yacht-booking-button";
import { YachtHostessAddon } from "@/components/yacht-hostess-addon";
import { filterYachtCatalog, paginateSlice, sortYachtCatalog, type YachtSortMode, } from "@/lib/yacht-catalog-utils";
import { getLocalizedYachts } from "@/lib/i18n/yachts-page";
import type { Translator } from "@/lib/i18n/translate";
import { YACHT_PHOTO_ADDON_IMAGES, type Yacht, type YachtRegion, type YachtSizeBand, } from "@/lib/yachts-data";
import { resolveYachtGalleryPaths } from "@/lib/yacht-fleet-gallery";
import { CONTACT_TRIP_BUILDER_HREF } from "@/lib/contact-hrefs";
import { cn } from "@/lib/utils";
import styles from "@/app/services/yachts/yachts.module.css";
const CATALOG_PAGE_SIZE = 9;
const btnPrimary = "inline-flex min-h-11 items-center justify-center border border-gold/40 bg-gold px-8 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#0b0b0b] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold-secondary hover:bg-gold-secondary hover:shadow-[0_0_0_1px_rgba(224,195,138,0.4),0_14px_48px_rgba(198,164,108,0.2)] active:translate-y-0";
function ImagePlaceholder({ className, label, }: {
    className?: string;
    label?: string;
}) {
    return (<div className={cn("relative flex flex-col items-center justify-center gap-2 border border-gold/12 bg-[#141414] text-center", className)}>
      <Ship className="h-8 w-8 text-gold/22 sm:h-10 sm:w-10" aria-hidden/>
      {label ? (<span className="px-2 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-cream/35">
          {label}
        </span>) : null}
    </div>);
}
function YachtCard({ yacht, onOpen, catalogQuery, t }: {
    yacht: Yacht;
    onOpen: (y: Yacht) => void;
    catalogQuery: string;
    t: Translator;
}) {
    const { locale } = useLocale();
    const es = locale === "es";
    const inner = <><div className={styles.cardPhoto}>{yacht.cardCoverSrc ? <Image src={yacht.cardCoverSrc} alt={yacht.name} fill sizes="(max-width:700px) 100vw, (max-width:1050px) 50vw, 33vw" className={styles.cover}/> : <ImagePlaceholder className="absolute inset-0"/>}{yacht.featured && <span className={styles.badge}>{t("yachtsPage.featured")}</span>}<span className={styles.photoCount}>{yacht.galleryCount} {es ? "fotos" : "photos"}</span><span className={styles.cardArrow} aria-hidden>↗</span></div><div className={styles.cardBody}><p className={styles.location}>{yacht.region.replaceAll("-", " ")}</p><h3>{yacht.name}</h3><p className={styles.subtitle}>{yacht.subtitle}</p><div className={styles.facts}><span>{yacht.lengthFt} ft</span>{yacht.capacityGuests && <span>{yacht.capacityGuests} {es ? "invitados" : "guests"}</span>}{yacht.staterooms && <span>{yacht.staterooms} {es ? (yacht.staterooms === 1 ? "camarote" : "camarotes") : (yacht.staterooms === 1 ? "cabin" : "cabins")}</span>}</div><div className={styles.cardBottom}><p>{yacht.cardPriceLine}</p><span>{es ? "Explorar" : "Explore yacht"} ↗</span></div></div></>;
    return yacht.productPageHref ? <Link href={yacht.productPageHref + (catalogQuery ? "?" + catalogQuery : "")} className={styles.card}>{inner}</Link> : <button type="button" className={styles.card} onClick={() => onOpen(yacht)}>{inner}</button>;
}
function YachtDetailDialog({ yacht, onClose, t, }: {
    yacht: Yacht | null;
    onClose: () => void;
    t: Translator;
}) {
    const titleId = useId();
    const [activeIndex, setActiveIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const gallerySlides = useMemo((): readonly string[] => {
        if (!yacht)
            return [];
        return resolveYachtGalleryPaths(yacht);
    }, [yacht]);
    const slideCount = gallerySlides.length;
    useLayoutEffect(() => {
        if (slideCount <= 1)
            return;
        thumbRefs.current[activeIndex]?.scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "nearest",
        });
    }, [activeIndex, slideCount]);
    useEffect(() => {
        if (!yacht)
            return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [yacht]);
    const goPrev = useCallback(() => {
        if (slideCount <= 0)
            return;
        setActiveIndex((i) => (i <= 0 ? slideCount - 1 : i - 1));
    }, [slideCount]);
    const goNext = useCallback(() => {
        if (slideCount <= 0)
            return;
        setActiveIndex((i) => (i >= slideCount - 1 ? 0 : i + 1));
    }, [slideCount]);
    useEffect(() => {
        if (!yacht)
            return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (lightboxOpen)
                    setLightboxOpen(false);
                else
                    onClose();
            }
            if (lightboxOpen) {
                if (e.key === "ArrowLeft")
                    goPrev();
                if (e.key === "ArrowRight")
                    goNext();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [yacht, lightboxOpen, onClose, goPrev, goNext]);
    if (!yacht)
        return null;
    const safeSlideIndex = slideCount > 0
        ? Math.min(Math.max(0, activeIndex), slideCount - 1)
        : 0;
    const mainSlideSrc = slideCount > 0 ? gallerySlides[safeSlideIndex] ?? gallerySlides[0] : null;
    const hasPromos = yacht.promotions && yacht.promotions.length > 0;
    const hasInclusions = yacht.inclusions && yacht.inclusions.length > 0;
    const hasPolicy = yacht.policyNotes && yacht.policyNotes.length > 0;
    return (<div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button type="button" className="absolute inset-0 bg-[#0b0b0b]/82 backdrop-blur-[2px]" onClick={onClose} aria-label={t("yachtsPage.close")}/>
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative z-10 flex max-h-[min(94vh,920px)] w-full max-w-5xl flex-col overflow-hidden border border-gold/18 bg-[#0a0a0a] shadow-[0_32px_120px_rgba(0,0,0,0.75)] sm:mx-4 sm:rounded-sm">
        <div className="flex shrink-0 items-center justify-between border-b border-gold/12 px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0 pr-4">
            <h2 id={titleId} className="font-serif text-lg leading-snug tracking-tight text-cream sm:text-xl">
              {yacht.name}
            </h2>
            <p className="mt-1 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-cream/48">
              {yacht.subtitle}
            </p>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center border border-gold/15 text-cream/70 transition-colors hover:border-gold/35 hover:text-gold-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/50" aria-label={t("yachtsPage.closeDetails")}>
            <X className="h-5 w-5"/>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.95fr)]">
            <div className="border-b border-gold/12 lg:border-b-0 lg:border-r">
              <div className={cn("relative aspect-[16/10] w-full overflow-hidden bg-[#0b0b0b] sm:aspect-[16/9] lg:aspect-[16/10]", slideCount > 0 && "cursor-zoom-in")} onClick={slideCount > 0 ? () => setLightboxOpen(true) : undefined}>
                {slideCount > 0 && mainSlideSrc ? (<>
                    <Image src={mainSlideSrc} alt={t("yachtsPage.photoOf", {
                name: yacht.name,
                current: safeSlideIndex + 1,
                total: slideCount,
            })} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 55vw"/>
                    <span className="pointer-events-none absolute right-3 top-3 z-[1] inline-flex items-center gap-1.5 border border-gold/25 bg-[#0b0b0b]/75 px-2.5 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-cream/85 backdrop-blur-sm">
                      <Maximize2 className="h-3.5 w-3.5" aria-hidden/>
                      {safeSlideIndex + 1} / {slideCount}
                    </span>
                  </>) : (<ImagePlaceholder className="absolute inset-0 h-full w-full" label={t("yachtsPage.photosComingSoon")}/>)}
                {slideCount > 1 ? (<>
                    <button type="button" onClick={(e) => {
                e.stopPropagation();
                goPrev();
            }} className="absolute left-2 top-1/2 z-[2] flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-gold/20 bg-[#0b0b0b]/80 text-cream/90 backdrop-blur-sm transition-colors hover:border-gold/40" aria-label={t("yachtsPage.previousPhoto")}>
                      <ChevronLeft className="h-5 w-5"/>
                    </button>
                    <button type="button" onClick={(e) => {
                e.stopPropagation();
                goNext();
            }} className="absolute right-2 top-1/2 z-[2] flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-gold/20 bg-[#0b0b0b]/80 text-cream/90 backdrop-blur-sm transition-colors hover:border-gold/40" aria-label={t("yachtsPage.nextPhoto")}>
                      <ChevronRight className="h-5 w-5"/>
                    </button>
                  </>) : null}
              </div>
              {slideCount > 1 ? (<div className="flex gap-2 overflow-x-auto border-t border-gold/10 p-3 sm:p-4">
                  {gallerySlides.map((src, i) => (<button key={`${yacht.id}-thumb-${i}`} ref={(node) => {
                    thumbRefs.current[i] = node;
                }} type="button" onClick={() => setActiveIndex(i)} className={cn("relative h-14 w-24 shrink-0 overflow-hidden border transition-colors sm:h-16 sm:w-28", i === safeSlideIndex
                    ? "border-gold/45"
                    : "border-gold/12 hover:border-gold/25")} aria-label={t("yachtsPage.showPhoto", { n: i + 1 })} aria-current={i === safeSlideIndex}>
                      <Image src={src} alt="" fill className="object-cover" sizes="112px"/>
                    </button>))}
                </div>) : null}
            </div>

            <div className="flex flex-col p-5 sm:p-7 lg:max-h-[min(72vh,680px)] lg:overflow-y-auto">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.38em] text-gold/90">
                {t("yachtsPage.charterRates")}
              </p>
              <ul className="mt-4 space-y-0" role="list">
                {yacht.priceTiers.map((tier) => (<li key={`${yacht.id}-${tier.durationLabel}`} className="border-t border-gold/[0.09] py-4 first:border-t-0 first:pt-0 first:pb-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-[0.9375rem] text-cream/85">
                        {tier.durationLabel}
                      </span>
                      <span className="font-serif text-lg tabular-nums text-gold-secondary">
                        {tier.amount}
                      </span>
                    </div>
                    {tier.note ? (<p className="mt-1.5 text-[0.75rem] text-cream/45">
                        {tier.note}
                      </p>) : null}
                  </li>))}
              </ul>

              {hasPromos ? (<div className="mt-6 border-t border-gold/10 pt-6">
                  <p className="text-[0.62rem] font-medium uppercase tracking-[0.32em] text-gold/70">
                    {t("yachtsPage.promotions")}
                  </p>
                  <ul className="mt-3 space-y-3" role="list">
                    {yacht.promotions!.map((p) => (<li key={p.label}>
                        <span className="text-[0.8125rem] font-medium text-cream/75">
                          {p.label}
                        </span>
                        <p className="mt-1 text-[0.8125rem] leading-relaxed text-cream/48">
                          {p.detail}
                        </p>
                      </li>))}
                  </ul>
                </div>) : null}

              {typeof yacht.capacityGuests === "number" ? (<p className="mt-6 text-[0.8125rem] text-cream/55">
                  {t("yachtsPage.guestCapacity", {
                count: yacht.capacityGuests,
            })}
                </p>) : null}

              {yacht.location ? (<p className="mt-4 text-[0.8125rem] leading-relaxed text-cream/52">
                  <span className="font-medium text-cream/70">
                    {t("yachtsPage.departureLabel")}
                  </span>{" "}
                  {yacht.location}
                </p>) : null}

              <p className="mt-6 text-[0.9375rem] leading-relaxed text-cream/72">
                {yacht.description}
              </p>

              <p className="mt-8 text-[0.62rem] font-medium uppercase tracking-[0.32em] text-gold/70">
                {t("yachtsPage.highlights")}
              </p>
              <ul className="mt-4 space-y-3" role="list">
                {yacht.highlights.map((h) => (<li key={h} className="flex gap-3 text-[0.9375rem] leading-snug text-cream/78">
                    <span className="mt-[0.4em] h-1 w-1 shrink-0 rounded-full bg-gold/45" aria-hidden/>
                    {h}
                  </li>))}
              </ul>

              {hasInclusions ? (<div className="mt-8 border-t border-gold/10 pt-6">
                  <p className="text-[0.62rem] font-medium uppercase tracking-[0.32em] text-gold/70">
                    {t("yachtsPage.inclusions")}
                  </p>
                  <ul className="mt-4 space-y-3" role="list">
                    {yacht.inclusions!.map((line) => (<li key={line} className="flex gap-3 text-[0.9375rem] leading-snug text-cream/78">
                        <span className="mt-[0.4em] h-1 w-1 shrink-0 rounded-full bg-gold/45" aria-hidden/>
                        {line}
                      </li>))}
                  </ul>
                </div>) : null}

              {hasPolicy ? (<div className="mt-8 border-t border-gold/10 pt-6">
                  {yacht.policyNotes!.map((note) => (<p key={note} className="text-[0.7rem] leading-relaxed text-cream/38 [&+&]:mt-3">
                      {note}
                    </p>))}
                </div>) : null}

              <div className="mt-10 flex flex-col gap-3 border-t border-gold/10 pt-8 sm:flex-row sm:flex-wrap">
                <Link href={CONTACT_TRIP_BUILDER_HREF} className={cn(btnPrimary, "w-full sm:w-auto")}>
                  {t("yachtsPage.requestCharter")}
                </Link>
                <p className="mt-4 text-[0.7rem] leading-relaxed text-cream/38">
                  {t("yachtsPage.detailFootnote")}
                </p>
              </div>
              <div className="mt-6">
                <YachtBookingButton yacht={yacht}/>
              </div>
            </div>
          </div>
        </div>
      </div>

      {lightboxOpen && slideCount > 0 ? (<div className="fixed inset-0 z-[60] flex flex-col bg-[#050505]/95 backdrop-blur-md" role="presentation">
          <div className="flex items-center justify-between border-b border-gold/12 px-4 py-3 sm:px-6">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-cream/55">
              {t("yachtsPage.lightboxCounter", {
                name: yacht.name,
                current: safeSlideIndex + 1,
                total: slideCount,
            })}
            </p>
            <button type="button" onClick={() => setLightboxOpen(false)} className="flex h-10 w-10 items-center justify-center border border-gold/15 text-cream/80 hover:border-gold/35 hover:text-gold-secondary" aria-label={t("yachtsPage.closeEnlargedView")}>
              <X className="h-5 w-5"/>
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center p-4 sm:p-8">
            <div className="relative h-[min(78vh,820px)] w-full max-w-5xl">
              {mainSlideSrc ? (<Image src={mainSlideSrc} alt={t("yachtsPage.photoEnlarged", {
                    name: yacht.name,
                    current: safeSlideIndex + 1,
                    total: slideCount,
                })} fill className="object-contain" sizes="(max-width: 1024px) 100vw, min(896px, 100vw)"/>) : null}
            </div>
            {slideCount > 1 ? (<>
                <button type="button" onClick={goPrev} className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-gold/25 bg-[#0b0b0b]/85 text-cream sm:left-6" aria-label={t("yachtsPage.previousPhoto")}>
                  <ChevronLeft className="h-6 w-6"/>
                </button>
                <button type="button" onClick={goNext} className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-gold/25 bg-[#0b0b0b]/85 text-cream sm:right-6" aria-label={t("yachtsPage.nextPhoto")}>
                  <ChevronRight className="h-6 w-6"/>
                </button>
              </>) : null}
          </div>
        </div>) : null}
    </div>);
}
function CatalogPagination({ page, pageCount, total, pageSize, onPage, t, }: {
    page: number;
    pageCount: number;
    total: number;
    pageSize: number;
    onPage: (p: number) => void;
    t: Translator;
}) {
    if (pageCount <= 1)
        return null;
    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);
    return (<nav className="mt-12 flex flex-col items-center gap-5 border-t border-gold/10 pt-10 sm:flex-row sm:justify-between" aria-label={t("yachtsPage.paginationAria")}>
      <p className="text-[0.72rem] tabular-nums text-cream/42">
        {t("yachtsPage.showingRange", { from, to, total })}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        <button type="button" onClick={() => onPage(page - 1)} disabled={page <= 1} className={cn("min-h-9 min-w-[4.5rem] border px-3 text-[0.62rem] font-semibold uppercase tracking-[0.14em] transition-colors disabled:cursor-not-allowed disabled:opacity-35 sm:min-h-10 sm:text-[0.65rem]", page <= 1
            ? "border-gold/10 text-cream/30"
            : "border-gold/18 text-cream/65 hover:border-gold/32 hover:text-cream")}>
          {t("yachtsPage.prev")}
        </button>
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (<button key={p} type="button" onClick={() => onPage(p)} aria-current={p === page ? "page" : undefined} className={cn("flex h-9 min-w-9 items-center justify-center border text-[0.7rem] font-semibold tabular-nums transition-colors sm:h-10 sm:min-w-10 sm:text-[0.75rem]", p === page
                ? "border-gold/45 bg-gold/[0.08] text-gold-secondary"
                : "border-gold/12 text-cream/55 hover:border-gold/25 hover:text-cream/80")}>
            {p}
          </button>))}
        <button type="button" onClick={() => onPage(page + 1)} disabled={page >= pageCount} className={cn("min-h-9 min-w-[4.5rem] border px-3 text-[0.62rem] font-semibold uppercase tracking-[0.14em] transition-colors disabled:cursor-not-allowed disabled:opacity-35 sm:min-h-10 sm:text-[0.65rem]", page >= pageCount
            ? "border-gold/10 text-cream/30"
            : "border-gold/18 text-cream/65 hover:border-gold/32 hover:text-cream")}>
          {t("yachtsPage.next")}
        </button>
      </div>
    </nav>);
}
function YachtsCatalogInner() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { locale, t } = useLocale();
    const es = locale === "es";
    const [selected, setSelected] = useState<Yacht | null>(null);
    const localizedYachts = useMemo(() => getLocalizedYachts(locale, t), [locale, t]);
    const valid = (key: string, allowed: string[], fallback: string) => { const value = searchParams.get(key) || fallback; return allowed.includes(value) ? value : fallback; };
    const q = searchParams.get("q") || "", region = valid("region", ["all", "miami", "north-miami", "fort-lauderdale", "bahamas"], "all"), size = valid("size", ["all", "under-50", "50-70", "70-100", "over-100"], "all"), budget = valid("budget", ["all", "under-3k", "3k-5k", "over-5k"], "all"), guests = valid("guests", ["all", "6", "10", "12", "13"], "all"), sort = valid("sort", ["default", "price-asc", "price-desc", "name-asc", "name-desc"], "default"), featured = searchParams.get("featured") === "featured" ? "featured" : "all";
    const requestedPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const filteredSorted = useMemo(() => {
        let items = filterYachtCatalog(localizedYachts, { featured, price: "all", region: region as YachtRegion | "all", size: size as YachtSizeBand });
        items = items.filter(y => (!q || [y.name, y.subtitle, y.region].join(" ").toLowerCase().includes(q.trim().toLowerCase())) && (guests === "all" || (y.capacityGuests ?? 0) >= Number(guests)) && (budget === "all" || (!y.ratesPending && y.listingPriceUsd > 0 && (budget === "under-3k" ? y.listingPriceUsd < 3000 : budget === "3k-5k" ? y.listingPriceUsd >= 3000 && y.listingPriceUsd < 5000 : y.listingPriceUsd >= 5000))));
        const sorted = sortYachtCatalog(items, sort as YachtSortMode);
        return sort.startsWith("price-") ? [...sorted.filter(y => !y.ratesPending), ...sorted.filter(y => y.ratesPending)] : sorted;
    }, [localizedYachts, featured, region, size, q, guests, budget, sort]);
    const { slice, pageCount, safePage, total } = paginateSlice(filteredSorted, requestedPage, CATALOG_PAGE_SIZE);
    const updatePage = (page: number) => { const params = new URLSearchParams(searchParams.toString()); params.delete("page"); if (page > 1)
        params.set("page", String(page)); router.replace(pathname + (params.size ? "?" + params : "") + "#yacht-collection", { scroll: false }); document.getElementById("yacht-collection")?.scrollIntoView({ behavior: "smooth", block: "start" }); };
    const active = [q, region !== "all", size !== "all", budget !== "all", guests !== "all", featured !== "all"].filter(Boolean).length;
    const select = (name: string, label: string, value: string, options: [
        string,
        string
    ][]) => <label className={styles.field}><span>{label}</span><select name={name} defaultValue={value} onChange={e => e.currentTarget.form?.requestSubmit()}>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>;
    const selectedLocalized = selected ? localizedYachts.find(y => y.id === selected.id) ?? selected : null;
    const hero = localizedYachts.find(y => y.id === "166-trinity")?.cardCoverSrc;
    return <><div className={styles.catalogPage}><SectionReveal className={styles.hero}><div className={styles.heroCopy}><p className={styles.eyebrow}>{t("yachtsPage.eyebrow")}</p><h1>{t("yachtsPage.headline")}</h1><p>{t("yachtsPage.heroBody")}</p><a className={styles.heroLink} href="#yacht-collection">{es ? "Descubrir la flota" : "Discover the fleet"} <span>↓</span></a></div><div className={styles.heroPhoto}>{hero && <Image src={hero} alt="Trinity yacht on the water" fill sizes="(max-width:700px) 100vw, 55vw" className={styles.cover} priority/>}<span>{es ? "Tu día. Tu horizonte." : "Your day. Your horizon."}</span></div></SectionReveal>
 <section className={styles.collection} id="yacht-collection"><div className={styles.collectionHeading}><div><p className={styles.eyebrow}>{es ? "La colección" : "The collection"}</p><h2>{t("yachtsPage.findYourYacht")}</h2></div><span>{localizedYachts.length} {es ? "yates seleccionados" : "curated yachts"}</span></div>
 <form key={searchParams.toString()} className={styles.filters} onSubmit={e => { e.preventDefault(); const data = new FormData(e.currentTarget); const params = new URLSearchParams(); for (const [k, v] of data) {
        if (typeof v === "string" && v.trim() && v !== "all" && v !== "default")
            params.set(k, v.trim());
    } router.replace(pathname + (params.size ? "?" + params : "") + "#yacht-collection", { scroll: false }); }}>
 <div className={styles.searchRow}><label className={styles.search}><span>{es ? "Buscar un yate" : "Find your yacht"}</span><input type="search" name="q" defaultValue={q} placeholder={es ? "Nombre, marca o destino…" : "Name, brand or destination…"}/></label><button className={styles.submit} type="submit">{es ? "Buscar" : "Search fleet"} ↗</button></div><div className={styles.filterGrid}>
 {select("region", t("yachtsPage.location"), region, [["all", t("yachtsPage.filters.region.all")], ["miami", "Miami"], ["north-miami", "North Miami"], ["fort-lauderdale", "Fort Lauderdale"], ["bahamas", "Bahamas"]])}
 {select("guests", es ? "Invitados" : "Guests", guests, [["all", es ? "Cualquier grupo" : "Any group size"], ["6", "6+"], ["10", "10+"], ["12", "12+"], ["13", "13+"]])}
 {select("budget", es ? "Tarifa base (USD)" : "Base charter (USD)", budget, [["all", es ? "Todos los precios" : "All budgets"], ["under-3k", "Under $3,000"], ["3k-5k", "$3,000 – $4,999"], ["over-5k", "$5,000+"]])}
 {select("size", t("yachtsPage.size"), size, [["all", t("yachtsPage.filters.size.all")], ["under-50", "Under 50 ft"], ["50-70", "50–69 ft"], ["70-100", "70–99 ft"], ["over-100", "100+ ft"]])}
 {select("sort", t("yachtsPage.sortBy"), sort, [["default", t("yachtsPage.sort.default")], ["price-asc", t("yachtsPage.sort.priceAsc")], ["price-desc", t("yachtsPage.sort.priceDesc")], ["name-asc", t("yachtsPage.sort.nameAsc")]])}
 </div><div className={styles.filterFoot}><label><input type="checkbox" name="featured" value="featured" defaultChecked={featured === "featured"} onChange={e => e.currentTarget.form?.requestSubmit()}/> {t("yachtsPage.featured")}</label><span>{es ? "Impuestos y propinas según el yate." : "Base rates. Taxes & gratuity vary by yacht."}</span></div></form>
 <div className={styles.results} aria-live="polite"><p><strong>{total}</strong> {es ? "yates encontrados" : "yachts to discover"}{active > 0 && <span> · {active} {es ? "filtros activos" : "active filters"}</span>}</p>{active > 0 && <button onClick={() => router.replace(pathname + "#yacht-collection", { scroll: false })}>{es ? "Borrar filtros" : "Clear filters"} ×</button>}</div>
 {total === 0 ? <div className={styles.empty}><Ship size={36}/><h3>{es ? "Un horizonte diferente" : "A different horizon awaits"}</h3><p>{es ? "Prueba con menos filtros para encontrar tu yate." : "Try a wider budget, a different destination or fewer guests."}</p><button className={styles.submit} onClick={() => router.replace(pathname + "#yacht-collection", { scroll: false })}>{es ? "Ver toda la flota" : "Explore the full fleet"}</button></div> : <><div className={styles.yachtGrid}>{slice.map((yacht, index) => <ScrollRevealItem key={yacht.id} index={index}><YachtCard yacht={yacht} onOpen={setSelected} catalogQuery={(() => { const p = new URLSearchParams(searchParams.toString()); p.delete("page"); if (safePage > 1)
        p.set("page", String(safePage)); return p.toString(); })()} t={t}/></ScrollRevealItem>)}</div><CatalogPagination page={safePage} pageCount={pageCount} total={total} pageSize={CATALOG_PAGE_SIZE} onPage={updatePage} t={t}/></>}
 <p className={styles.footerNote}>{t("yachtsPage.catalogFooterNote")}</p><ChauffeurServiceCrosslink variant="yacht"/></section></div><YachtHostessAddon /><ServicePhotographyAddon layout="static" headline={t("yachtsPage.photography.headline")} description={t("yachtsPage.photography.description")} images={YACHT_PHOTO_ADDON_IMAGES}/><YachtDetailDialog key={selectedLocalized?.id ?? "no-yacht"} yacht={selectedLocalized} onClose={() => setSelected(null)} t={t}/></>;
}
export function YachtsCatalog() {
    return (<Suspense fallback={null}>
      <YachtsCatalogInner />
    </Suspense>);
}
