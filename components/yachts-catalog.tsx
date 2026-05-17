"use client";

import { Ship, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
} from "react";

import { ChauffeurServiceCrosslink } from "@/components/chauffeur-service-crosslink";
import { useLocale } from "@/components/locale-provider";
import { ScrollRevealItem } from "@/components/scroll-reveal-item";
import { SectionReveal } from "@/components/section-reveal";
import { ServicePhotographyAddon } from "@/components/service-photography-addon";
import { YachtBookingButton } from "@/components/yacht-booking-button";
import { YachtHostessAddon } from "@/components/yacht-hostess-addon";
import {
  filterYachtCatalog,
  paginateSlice,
  sortYachtCatalog,
  type YachtFeaturedFilter,
  type YachtSortMode,
} from "@/lib/yacht-catalog-utils";
import { getLocalizedYachts } from "@/lib/i18n/yachts-page";
import type { Translator } from "@/lib/i18n/translate";
import {
  YACHT_PHOTO_ADDON_IMAGES,
  type Yacht,
  type YachtPriceBand,
  type YachtRegion,
  type YachtSizeBand,
} from "@/lib/yachts-data";
import { resolveYachtGalleryPaths } from "@/lib/yacht-fleet-gallery";
import { CONTACT_TRIP_BUILDER_HREF } from "@/lib/contact-hrefs";
import { cn } from "@/lib/utils";

const CATALOG_PAGE_SIZE = 9;

const catalogSelectClass =
  "mt-1.5 w-full min-h-10 cursor-pointer appearance-none rounded-sm border border-gold/18 bg-[#101010] bg-[length:0.875rem] bg-[right_0.65rem_center] bg-no-repeat px-2.5 py-2 pr-9 text-[0.72rem] font-medium text-cream/88 outline-none transition-[border-color] focus-visible:border-gold/40 sm:min-h-9 sm:text-[0.75rem]";

const catalogSelectStyle: CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23c6a46c' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
};

const btnPrimary =
  "inline-flex min-h-11 items-center justify-center border border-gold/40 bg-gold px-8 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#0b0b0b] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold-secondary hover:bg-gold-secondary hover:shadow-[0_0_0_1px_rgba(224,195,138,0.4),0_14px_48px_rgba(198,164,108,0.2)] active:translate-y-0";

function ImagePlaceholder({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 border border-gold/12 bg-[#141414] text-center",
        className,
      )}
    >
      <Ship className="h-8 w-8 text-gold/22 sm:h-10 sm:w-10" aria-hidden />
      {label ? (
        <span className="px-2 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-cream/35">
          {label}
        </span>
      ) : null}
    </div>
  );
}

const yachtCardClass =
  "group w-full text-left transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/50";

/** Curated flagship row — strong card treatment on the fleet catalog (page 1). */
const CATALOG_SPOTLIGHT_IDS = new Set([
  "166-trinity",
  "116-pershing-gtx",
  "116-azimut",
]);

function YachtCard({
  yacht,
  onOpen,
  catalogPage,
  t,
}: {
  yacht: Yacht;
  onOpen: (y: Yacht) => void;
  catalogPage: number;
  t: Translator;
}) {
  const isSpotlight = CATALOG_SPOTLIGHT_IDS.has(yacht.id);
  const inner = (
    <>
      <div
        className={cn(
          "relative aspect-[16/10] overflow-hidden border bg-[#0b0b0b] transition-[border-color,box-shadow] duration-500",
          isSpotlight
            ? "border-gold/45 shadow-[0_0_0_1px_rgba(198,164,108,0.22),0_12px_40px_rgba(0,0,0,0.45)] group-hover:border-gold/60 group-hover:shadow-[0_0_0_1px_rgba(224,195,138,0.35),0_16px_48px_rgba(198,164,108,0.12)]"
            : "border-gold/12 group-hover:border-gold/28",
        )}
      >
        {isSpotlight ? (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-1 bg-gradient-to-r from-transparent via-gold/90 to-transparent"
            aria-hidden
          />
        ) : null}
        {isSpotlight ? (
          <div className="absolute left-3 top-3 z-[3] sm:left-4 sm:top-4">
            <span className="inline-flex items-center justify-center rounded-sm border border-gold/55 bg-[#0b0b0b]/92 px-2.5 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-gold shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:px-3 sm:py-2 sm:text-[0.65rem]">
              {t("yachtsPage.featured")}
            </span>
          </div>
        ) : null}
        {yacht.cardCoverSrc ? (
          <Image
            src={yacht.cardCoverSrc}
            alt=""
            fill
            className="z-0 object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={yacht.catalogOrder === 1 || isSpotlight}
          />
        ) : (
          <ImagePlaceholder
            className="absolute inset-0 h-full w-full"
            label={t("yachtsPage.photoPlaceholder")}
          />
        )}
        <div
          className="absolute inset-0 z-[1] bg-gradient-to-t from-[#0b0b0b]/90 via-transparent to-transparent opacity-90"
          aria-hidden
        />
        <div className="absolute bottom-0 left-0 right-0 z-[2] p-4 sm:p-5">
          <p className="font-serif text-base leading-snug tracking-tight text-cream sm:text-lg">
            {yacht.name}
          </p>
          <p className="mt-0.5 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-cream/50">
            {yacht.subtitle}
          </p>
          <p className="mt-2 font-serif text-[1.05rem] tabular-nums text-gold-secondary sm:text-[1.125rem]">
            {yacht.cardPriceLine}
          </p>
        </div>
      </div>
      <p className="mt-3 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-cream/40">
        {yacht.productPageHref
          ? t("yachtsPage.openFullListing")
          : t("yachtsPage.tapForDetails")}
      </p>
    </>
  );

  if (yacht.productPageHref) {
    const pageQs = catalogPage > 1 ? `?page=${catalogPage}` : "";
    return (
      <Link
        href={`${yacht.productPageHref}${pageQs}`}
        className={cn(yachtCardClass, "block")}
        aria-label={
          isSpotlight
            ? t("yachtsPage.cardAriaFeatured", { name: yacht.name })
            : t("yachtsPage.cardAriaListing", { name: yacht.name })
        }
      >
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => onOpen(yacht)} className={yachtCardClass}>
      {inner}
    </button>
  );
}

function YachtDetailDialog({
  yacht,
  onClose,
  t,
}: {
  yacht: Yacht | null;
  onClose: () => void;
  t: Translator;
}) {
  const titleId = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const gallerySlides = useMemo((): readonly string[] => {
    if (!yacht) return [];
    return resolveYachtGalleryPaths(yacht);
  }, [yacht]);

  const slideCount = gallerySlides.length;

  useLayoutEffect(() => {
    if (slideCount <= 1) return;
    thumbRefs.current[activeIndex]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeIndex, slideCount]);

  useEffect(() => {
    if (!yacht) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [yacht]);

  const goPrev = useCallback(() => {
    if (slideCount <= 0) return;
    setActiveIndex((i) => (i <= 0 ? slideCount - 1 : i - 1));
  }, [slideCount]);

  const goNext = useCallback(() => {
    if (slideCount <= 0) return;
    setActiveIndex((i) => (i >= slideCount - 1 ? 0 : i + 1));
  }, [slideCount]);

  useEffect(() => {
    if (!yacht) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightboxOpen) setLightboxOpen(false);
        else onClose();
      }
      if (lightboxOpen) {
        if (e.key === "ArrowLeft") goPrev();
        if (e.key === "ArrowRight") goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [yacht, lightboxOpen, onClose, goPrev, goNext]);

  if (!yacht) return null;

  const safeSlideIndex =
    slideCount > 0
      ? Math.min(Math.max(0, activeIndex), slideCount - 1)
      : 0;
  const mainSlideSrc =
    slideCount > 0 ? gallerySlides[safeSlideIndex] ?? gallerySlides[0] : null;

  const hasPromos = yacht.promotions && yacht.promotions.length > 0;
  const hasInclusions = yacht.inclusions && yacht.inclusions.length > 0;
  const hasPolicy = yacht.policyNotes && yacht.policyNotes.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-[#0b0b0b]/82 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={t("yachtsPage.close")}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(94vh,920px)] w-full max-w-5xl flex-col overflow-hidden border border-gold/18 bg-[#0a0a0a] shadow-[0_32px_120px_rgba(0,0,0,0.75)] sm:mx-4 sm:rounded-sm"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gold/12 px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0 pr-4">
            <h2
              id={titleId}
              className="font-serif text-lg leading-snug tracking-tight text-cream sm:text-xl"
            >
              {yacht.name}
            </h2>
            <p className="mt-1 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-cream/48">
              {yacht.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center border border-gold/15 text-cream/70 transition-colors hover:border-gold/35 hover:text-gold-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/50"
            aria-label={t("yachtsPage.closeDetails")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.95fr)]">
            <div className="border-b border-gold/12 lg:border-b-0 lg:border-r">
              <div
                className={cn(
                  "relative aspect-[16/10] w-full overflow-hidden bg-[#0b0b0b] sm:aspect-[16/9] lg:aspect-[16/10]",
                  slideCount > 0 && "cursor-zoom-in",
                )}
                onClick={
                  slideCount > 0 ? () => setLightboxOpen(true) : undefined
                }
              >
                {slideCount > 0 && mainSlideSrc ? (
                  <>
                    <Image
                      src={mainSlideSrc}
                      alt={t("yachtsPage.photoOf", {
                        name: yacht.name,
                        current: safeSlideIndex + 1,
                        total: slideCount,
                      })}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 55vw"
                    />
                    <span className="pointer-events-none absolute right-3 top-3 z-[1] inline-flex items-center gap-1.5 border border-gold/25 bg-[#0b0b0b]/75 px-2.5 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-cream/85 backdrop-blur-sm">
                      <Maximize2 className="h-3.5 w-3.5" aria-hidden />
                      {safeSlideIndex + 1} / {slideCount}
                    </span>
                  </>
                ) : (
                  <ImagePlaceholder
                    className="absolute inset-0 h-full w-full"
                    label={t("yachtsPage.photosComingSoon")}
                  />
                )}
                {slideCount > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goPrev();
                      }}
                      className="absolute left-2 top-1/2 z-[2] flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-gold/20 bg-[#0b0b0b]/80 text-cream/90 backdrop-blur-sm transition-colors hover:border-gold/40"
                      aria-label={t("yachtsPage.previousPhoto")}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goNext();
                      }}
                      className="absolute right-2 top-1/2 z-[2] flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-gold/20 bg-[#0b0b0b]/80 text-cream/90 backdrop-blur-sm transition-colors hover:border-gold/40"
                      aria-label={t("yachtsPage.nextPhoto")}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                ) : null}
              </div>
              {slideCount > 1 ? (
                <div className="flex gap-2 overflow-x-auto border-t border-gold/10 p-3 sm:p-4">
                  {gallerySlides.map((src, i) => (
                    <button
                      key={`${yacht.id}-thumb-${i}`}
                      ref={(node) => {
                        thumbRefs.current[i] = node;
                      }}
                      type="button"
                      onClick={() => setActiveIndex(i)}
                      className={cn(
                        "relative h-14 w-24 shrink-0 overflow-hidden border transition-colors sm:h-16 sm:w-28",
                        i === safeSlideIndex
                          ? "border-gold/45"
                          : "border-gold/12 hover:border-gold/25",
                      )}
                      aria-label={t("yachtsPage.showPhoto", { n: i + 1 })}
                      aria-current={i === safeSlideIndex}
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col p-5 sm:p-7 lg:max-h-[min(72vh,680px)] lg:overflow-y-auto">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.38em] text-gold/90">
                {t("yachtsPage.charterRates")}
              </p>
              <ul className="mt-4 space-y-0" role="list">
                {yacht.priceTiers.map((tier) => (
                  <li
                    key={`${yacht.id}-${tier.durationLabel}`}
                    className="border-t border-gold/[0.09] py-4 first:border-t-0 first:pt-0 first:pb-4"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-[0.9375rem] text-cream/85">
                        {tier.durationLabel}
                      </span>
                      <span className="font-serif text-lg tabular-nums text-gold-secondary">
                        {tier.amount}
                      </span>
                    </div>
                    {tier.note ? (
                      <p className="mt-1.5 text-[0.75rem] text-cream/45">
                        {tier.note}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>

              {hasPromos ? (
                <div className="mt-6 border-t border-gold/10 pt-6">
                  <p className="text-[0.62rem] font-medium uppercase tracking-[0.32em] text-gold/70">
                    {t("yachtsPage.promotions")}
                  </p>
                  <ul className="mt-3 space-y-3" role="list">
                    {yacht.promotions!.map((p) => (
                      <li key={p.label}>
                        <span className="text-[0.8125rem] font-medium text-cream/75">
                          {p.label}
                        </span>
                        <p className="mt-1 text-[0.8125rem] leading-relaxed text-cream/48">
                          {p.detail}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {typeof yacht.capacityGuests === "number" ? (
                <p className="mt-6 text-[0.8125rem] text-cream/55">
                  {t("yachtsPage.guestCapacity", {
                    count: yacht.capacityGuests,
                  })}
                </p>
              ) : null}

              {yacht.location ? (
                <p className="mt-4 text-[0.8125rem] leading-relaxed text-cream/52">
                  <span className="font-medium text-cream/70">
                    {t("yachtsPage.departureLabel")}
                  </span>{" "}
                  {yacht.location}
                </p>
              ) : null}

              <p className="mt-6 text-[0.9375rem] leading-relaxed text-cream/72">
                {yacht.description}
              </p>

              <p className="mt-8 text-[0.62rem] font-medium uppercase tracking-[0.32em] text-gold/70">
                {t("yachtsPage.highlights")}
              </p>
              <ul className="mt-4 space-y-3" role="list">
                {yacht.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex gap-3 text-[0.9375rem] leading-snug text-cream/78"
                  >
                    <span
                      className="mt-[0.4em] h-1 w-1 shrink-0 rounded-full bg-gold/45"
                      aria-hidden
                    />
                    {h}
                  </li>
                ))}
              </ul>

              {hasInclusions ? (
                <div className="mt-8 border-t border-gold/10 pt-6">
                  <p className="text-[0.62rem] font-medium uppercase tracking-[0.32em] text-gold/70">
                    {t("yachtsPage.inclusions")}
                  </p>
                  <ul className="mt-4 space-y-3" role="list">
                    {yacht.inclusions!.map((line) => (
                      <li
                        key={line}
                        className="flex gap-3 text-[0.9375rem] leading-snug text-cream/78"
                      >
                        <span
                          className="mt-[0.4em] h-1 w-1 shrink-0 rounded-full bg-gold/45"
                          aria-hidden
                        />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {hasPolicy ? (
                <div className="mt-8 border-t border-gold/10 pt-6">
                  {yacht.policyNotes!.map((note) => (
                    <p
                      key={note}
                      className="text-[0.7rem] leading-relaxed text-cream/38 [&+&]:mt-3"
                    >
                      {note}
                    </p>
                  ))}
                </div>
              ) : null}

              <div className="mt-10 flex flex-col gap-3 border-t border-gold/10 pt-8 sm:flex-row sm:flex-wrap">
                <Link href={CONTACT_TRIP_BUILDER_HREF} className={cn(btnPrimary, "w-full sm:w-auto")}>
                  {t("yachtsPage.requestCharter")}
                </Link>
                <p className="mt-4 text-[0.7rem] leading-relaxed text-cream/38">
                  {t("yachtsPage.detailFootnote")}
                </p>
              </div>
              <div className="mt-6">
                <YachtBookingButton yacht={yacht} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {lightboxOpen && slideCount > 0 ? (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-[#050505]/95 backdrop-blur-md"
          role="presentation"
        >
          <div className="flex items-center justify-between border-b border-gold/12 px-4 py-3 sm:px-6">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-cream/55">
              {t("yachtsPage.lightboxCounter", {
                name: yacht.name,
                current: safeSlideIndex + 1,
                total: slideCount,
              })}
            </p>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="flex h-10 w-10 items-center justify-center border border-gold/15 text-cream/80 hover:border-gold/35 hover:text-gold-secondary"
              aria-label={t("yachtsPage.closeEnlargedView")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center p-4 sm:p-8">
            <div className="relative h-[min(78vh,820px)] w-full max-w-5xl">
              {mainSlideSrc ? (
                <Image
                  src={mainSlideSrc}
                  alt={t("yachtsPage.photoEnlarged", {
                    name: yacht.name,
                    current: safeSlideIndex + 1,
                    total: slideCount,
                  })}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, min(896px, 100vw)"
                />
              ) : null}
            </div>
            {slideCount > 1 ? (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-gold/25 bg-[#0b0b0b]/85 text-cream sm:left-6"
                  aria-label={t("yachtsPage.previousPhoto")}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-gold/25 bg-[#0b0b0b]/85 text-cream sm:right-6"
                  aria-label={t("yachtsPage.nextPhoto")}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const filterFieldClass =
  "min-w-0 shrink-0 basis-[calc(50%-0.375rem)] sm:basis-[11.25rem]";

function YachtCatalogFilters({
  featured,
  setFeatured,
  price,
  setPrice,
  region,
  setRegion,
  size,
  setSize,
  sort,
  setSort,
  t,
}: {
  featured: YachtFeaturedFilter;
  setFeatured: (v: YachtFeaturedFilter) => void;
  price: YachtPriceBand;
  setPrice: (v: YachtPriceBand) => void;
  region: YachtRegion | "all";
  setRegion: (v: YachtRegion | "all") => void;
  size: YachtSizeBand;
  setSize: (v: YachtSizeBand) => void;
  sort: YachtSortMode;
  setSort: (v: YachtSortMode) => void;
  t: Translator;
}) {
  const labelClass =
    "block text-[0.58rem] font-medium uppercase tracking-[0.26em] text-cream/40";

  const featuredOptions = useMemo(
    (): { id: YachtFeaturedFilter; label: string }[] => [
      { id: "all", label: t("yachtsPage.filters.featured.all") },
      { id: "featured", label: t("yachtsPage.filters.featured.featuredOnly") },
    ],
    [t],
  );

  const priceOptions = useMemo(
    (): { id: YachtPriceBand; label: string }[] => [
      { id: "all", label: t("yachtsPage.filters.price.all") },
      { id: "under-4k", label: t("yachtsPage.filters.price.under4k") },
      { id: "3k-5k", label: t("yachtsPage.filters.price.range3k5k") },
      { id: "over-5k", label: t("yachtsPage.filters.price.over5k") },
    ],
    [t],
  );

  const regionOptions = useMemo(
    (): { id: YachtRegion | "all"; label: string }[] => [
      { id: "all", label: t("yachtsPage.filters.region.all") },
      { id: "north-miami", label: t("yachtsPage.filters.region.northMiami") },
      { id: "miami", label: t("yachtsPage.filters.region.miami") },
      {
        id: "fort-lauderdale",
        label: t("yachtsPage.filters.region.fortLauderdale"),
      },
      { id: "bahamas", label: t("yachtsPage.filters.region.bahamas") },
    ],
    [t],
  );

  const sizeOptions = useMemo(
    (): { id: YachtSizeBand; label: string }[] => [
      { id: "all", label: t("yachtsPage.filters.size.all") },
      { id: "under-50", label: t("yachtsPage.filters.size.under50") },
      { id: "50-70", label: t("yachtsPage.filters.size.50to70") },
      { id: "70-100", label: t("yachtsPage.filters.size.70to100") },
      { id: "over-100", label: t("yachtsPage.filters.size.over100") },
    ],
    [t],
  );

  const sortOptions = useMemo(
    (): { id: YachtSortMode; label: string }[] => [
      { id: "default", label: t("yachtsPage.sort.default") },
      { id: "price-asc", label: t("yachtsPage.sort.priceAsc") },
      { id: "price-desc", label: t("yachtsPage.sort.priceDesc") },
      { id: "name-asc", label: t("yachtsPage.sort.nameAsc") },
      { id: "name-desc", label: t("yachtsPage.sort.nameDesc") },
    ],
    [t],
  );

  return (
    <div className="rounded-sm border border-gold/12 bg-[#0c0c0c] px-3 py-3 sm:px-4 sm:py-3.5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-x-3 sm:gap-y-2.5">
        <div className={filterFieldClass}>
          <label htmlFor="yacht-spotlight" className={labelClass}>
            {t("yachtsPage.spotlight")}
          </label>
          <select
            id="yacht-spotlight"
            value={featured}
            onChange={(e) =>
              setFeatured(e.target.value as YachtFeaturedFilter)
            }
            className={catalogSelectClass}
            style={catalogSelectStyle}
          >
            {featuredOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className={filterFieldClass}>
          <label htmlFor="yacht-price" className={labelClass}>
            {t("yachtsPage.price")}
          </label>
          <select
            id="yacht-price"
            value={price}
            onChange={(e) => setPrice(e.target.value as YachtPriceBand)}
            className={catalogSelectClass}
            style={catalogSelectStyle}
          >
            {priceOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className={filterFieldClass}>
          <label htmlFor="yacht-location" className={labelClass}>
            {t("yachtsPage.location")}
          </label>
          <select
            id="yacht-location"
            value={region}
            onChange={(e) =>
              setRegion(e.target.value as YachtRegion | "all")
            }
            className={catalogSelectClass}
            style={catalogSelectStyle}
          >
            {regionOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className={filterFieldClass}>
          <label htmlFor="yacht-size" className={labelClass}>
            {t("yachtsPage.size")}
          </label>
          <select
            id="yacht-size"
            value={size}
            onChange={(e) => setSize(e.target.value as YachtSizeBand)}
            className={catalogSelectClass}
            style={catalogSelectStyle}
          >
            {sizeOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className={filterFieldClass}>
          <label htmlFor="yacht-sort" className={labelClass}>
            {t("yachtsPage.sortBy")}
          </label>
          <select
            id="yacht-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as YachtSortMode)}
            className={catalogSelectClass}
            style={catalogSelectStyle}
          >
            {sortOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function CatalogPagination({
  page,
  pageCount,
  total,
  pageSize,
  onPage,
  t,
}: {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onPage: (p: number) => void;
  t: Translator;
}) {
  if (pageCount <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav
      className="mt-12 flex flex-col items-center gap-5 border-t border-gold/10 pt-10 sm:flex-row sm:justify-between"
      aria-label={t("yachtsPage.paginationAria")}
    >
      <p className="text-[0.72rem] tabular-nums text-cream/42">
        {t("yachtsPage.showingRange", { from, to, total })}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className={cn(
            "min-h-9 min-w-[4.5rem] border px-3 text-[0.62rem] font-semibold uppercase tracking-[0.14em] transition-colors disabled:cursor-not-allowed disabled:opacity-35 sm:min-h-10 sm:text-[0.65rem]",
            page <= 1
              ? "border-gold/10 text-cream/30"
              : "border-gold/18 text-cream/65 hover:border-gold/32 hover:text-cream",
          )}
        >
          {t("yachtsPage.prev")}
        </button>
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPage(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "flex h-9 min-w-9 items-center justify-center border text-[0.7rem] font-semibold tabular-nums transition-colors sm:h-10 sm:min-w-10 sm:text-[0.75rem]",
              p === page
                ? "border-gold/45 bg-gold/[0.08] text-gold-secondary"
                : "border-gold/12 text-cream/55 hover:border-gold/25 hover:text-cream/80",
            )}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= pageCount}
          className={cn(
            "min-h-9 min-w-[4.5rem] border px-3 text-[0.62rem] font-semibold uppercase tracking-[0.14em] transition-colors disabled:cursor-not-allowed disabled:opacity-35 sm:min-h-10 sm:text-[0.65rem]",
            page >= pageCount
              ? "border-gold/10 text-cream/30"
              : "border-gold/18 text-cream/65 hover:border-gold/32 hover:text-cream",
          )}
        >
          {t("yachtsPage.next")}
        </button>
      </div>
    </nav>
  );
}

function YachtsCatalogInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale, t } = useLocale();

  const [selected, setSelected] = useState<Yacht | null>(null);
  const [featured, setFeatured] = useState<YachtFeaturedFilter>("all");
  const [price, setPrice] = useState<YachtPriceBand>("all");
  const [region, setRegion] = useState<YachtRegion | "all">("all");
  const [size, setSize] = useState<YachtSizeBand>("all");
  const [sort, setSort] = useState<YachtSortMode>("default");

  const localizedYachts = useMemo(
    () => getLocalizedYachts(locale, t),
    [locale, t],
  );

  const selectedLocalized = useMemo(() => {
    if (!selected) return null;
    return localizedYachts.find((y) => y.id === selected.id) ?? selected;
  }, [selected, localizedYachts]);

  const requestedPage = useMemo(() => {
    const raw = searchParams.get("page");
    const n = parseInt(raw || "1", 10);
    return Number.isFinite(n) && n >= 1 ? n : 1;
  }, [searchParams]);

  const filteredSorted = useMemo(() => {
    const f = filterYachtCatalog(localizedYachts, {
      featured,
      price,
      region,
      size,
    });
    return sortYachtCatalog(f, sort);
  }, [localizedYachts, featured, price, region, size, sort]);

  const { slice, pageCount, safePage, total } = useMemo(
    () => paginateSlice(filteredSorted, requestedPage, CATALOG_PAGE_SIZE),
    [filteredSorted, requestedPage],
  );

  /** After filter/sort change, return to page 1 (strip ?page=). */
  const prevFilters = useRef<{
    featured: YachtFeaturedFilter;
    price: YachtPriceBand;
    region: YachtRegion | "all";
    size: YachtSizeBand;
    sort: YachtSortMode;
  } | null>(null);
  useEffect(() => {
    const cur = { featured, price, region, size, sort };
    const prev = prevFilters.current;
    if (!prev) {
      prevFilters.current = cur;
      return;
    }
    const changed =
      prev.featured !== cur.featured ||
      prev.price !== cur.price ||
      prev.region !== cur.region ||
      prev.size !== cur.size ||
      prev.sort !== cur.sort;
    prevFilters.current = cur;
    if (!changed) return;
    router.replace(pathname, { scroll: false });
  }, [featured, price, region, size, sort, pathname, router]);

  /** If ?page= is out of range (or filters reduced pages), clamp the URL. */
  useEffect(() => {
    if (safePage === requestedPage) return;
    router.replace(
      safePage > 1 ? `${pathname}?page=${safePage}` : pathname,
      { scroll: false },
    );
  }, [safePage, requestedPage, pathname, router]);

  const goToCatalogPage = useCallback(
    (p: number) => {
      router.replace(p > 1 ? `${pathname}?page=${p}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router],
  );

  return (
    <>
      <SectionReveal className="relative overflow-hidden border-b border-gold/10 bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(198,164,108,0.06),transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-16 sm:px-6 sm:pb-10 sm:pt-20 lg:px-10">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.48em] text-gold/90">
            {t("yachtsPage.eyebrow")}
          </p>
          <div className="mt-4 h-px w-14 bg-gold/30" aria-hidden />
          <h1 className="mt-6 max-w-3xl font-serif text-[2.1rem] leading-[1.12] tracking-tight text-cream sm:text-4xl md:text-[2.65rem]">
            {t("yachtsPage.headline")}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-cream/58 sm:text-[0.9375rem]">
            {t("yachtsPage.heroBody")}
          </p>
          <ChauffeurServiceCrosslink variant="yacht" />
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal className="border-b border-gold/10 bg-charcoal pb-14 pt-6 sm:pb-16 sm:pt-8 lg:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <p className="mb-3 pl-[calc(1px+0.75rem)] text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-gold/80 sm:mb-3.5 sm:pl-[calc(1px+1rem)]">
            {t("yachtsPage.findYourYacht")}
          </p>
          <YachtCatalogFilters
            featured={featured}
            setFeatured={setFeatured}
            price={price}
            setPrice={setPrice}
            region={region}
            setRegion={setRegion}
            size={size}
            setSize={setSize}
            sort={sort}
            setSort={setSort}
            t={t}
          />

          {total === 0 ? (
            <p className="mt-12 text-center text-sm text-cream/48">
              {t("yachtsPage.emptyFiltersBefore")}{" "}
              <button
                type="button"
                onClick={() => {
                  setFeatured("all");
                  setPrice("all");
                  setRegion("all");
                  setSize("all");
                }}
                className="text-gold-secondary/90 underline decoration-gold/25 underline-offset-4 hover:decoration-gold/50"
              >
                {t("yachtsPage.allListings")}
              </button>
              {t("yachtsPage.emptyFiltersAfter")}
            </p>
          ) : (
            <>
              <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-9 lg:grid-cols-3 lg:gap-8">
                {slice.map((yacht, index) => (
                  <ScrollRevealItem key={yacht.id} index={index}>
                    <YachtCard
                      yacht={yacht}
                      onOpen={setSelected}
                      catalogPage={safePage}
                      t={t}
                    />
                  </ScrollRevealItem>
                ))}
              </div>
              <CatalogPagination
                page={safePage}
                pageCount={pageCount}
                total={total}
                pageSize={CATALOG_PAGE_SIZE}
                onPage={goToCatalogPage}
                t={t}
              />
            </>
          )}

          <p className="mt-12 border-t border-gold/10 pt-8 text-[0.75rem] leading-relaxed text-cream/42">
            {t("yachtsPage.catalogFooterNote")}
          </p>
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <YachtHostessAddon />

      <ServicePhotographyAddon
        layout="static"
        headline={t("yachtsPage.photography.headline")}
        description={t("yachtsPage.photography.description")}
        images={YACHT_PHOTO_ADDON_IMAGES}
      />

      <YachtDetailDialog
        key={selectedLocalized?.id ?? "no-yacht"}
        yacht={selectedLocalized}
        onClose={() => setSelected(null)}
        t={t}
      />
    </>
  );
}

export function YachtsCatalog() {
  return (
    <Suspense fallback={null}>
      <YachtsCatalogInner />
    </Suspense>
  );
}
