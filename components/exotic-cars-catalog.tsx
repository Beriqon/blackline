"use client";

import {
  ArrowUpRight,
  Car,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { ScrollRevealItem } from "@/components/scroll-reveal-item";
import { SectionReveal } from "@/components/section-reveal";
import { ExoticCarBookingPanel } from "@/components/exotic-car-booking-panel";
import { useLocale } from "@/components/locale-provider";
import { ServicePhotographyAddon } from "@/components/service-photography-addon";
import { EXOTIC_CARS_DAILY, type ExoticCar } from "@/lib/exotic-cars-data";
import {
  exoticBrandFilterLabel,
  getLocalizedExoticCars,
} from "@/lib/i18n/exotic-cars-page";
import type { Translator } from "@/lib/i18n/translate";
import { paginateSlice } from "@/lib/pagination";
import {
  exoticGalleryCoverStyle,
  sortExoticCars,
  type ExoticSortMode,
} from "@/lib/exotic-catalog-utils";
import { EXOTIC_PHOTOGRAPHY_ADDON_IMAGES } from "@/lib/exotic-car-photos";
import { cn } from "@/lib/utils";

const CATALOG_PAGE_SIZE = 9;

const filterSelectClass =
  "w-full cursor-pointer appearance-none rounded-sm border border-gold/22 bg-[#0b0b0b] py-2.5 pl-3 pr-10 text-[0.8125rem] text-cream/90 transition-colors hover:border-gold/32 focus:border-gold/45 focus:outline-none focus:ring-1 focus:ring-gold/25";

function getGalleryLength(car: ExoticCar): number {
  const n = car.galleryImages?.length ?? 0;
  if (n > 0) return n;
  const gc = car.galleryCount ?? 0;
  if (gc > 0) return gc;
  return car.coverImage ? 1 : 0;
}

function getGallerySrc(car: ExoticCar, index: number): string | undefined {
  if (car.galleryImages?.[index]) return car.galleryImages[index];
  if (index === 0 && car.coverImage) return car.coverImage;
  return undefined;
}

function carCardImageSrc(car: ExoticCar): string | undefined {
  return car.galleryImages?.[0] ?? car.coverImage;
}

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
        "relative flex flex-col items-center justify-center gap-2 border border-gold/12 bg-[#050505] text-center",
        className,
      )}
    >
      <Car className="h-8 w-8 text-gold/22 sm:h-10 sm:w-10" aria-hidden />
      {label ? (
        <span className="px-2 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-cream/35">
          {label}
        </span>
      ) : null}
    </div>
  );
}

function CarCard({
  car,
  onOpen,
  t,
}: {
  car: ExoticCar;
  onOpen: (car: ExoticCar) => void;
  t: Translator;
}) {
  const brand = car.group.trim() || t("exoticCarsPage.eyebrow");

  return (
    <button
      type="button"
      onClick={() => onOpen(car)}
      className="group w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/50"
    >
      <div
        className={cn(
          "relative overflow-hidden border border-gold/14 bg-[#0b0b0b]",
          "shadow-[0_8px_40px_rgba(0,0,0,0.45)]",
          "transition-all duration-500 ease-out",
          "hover:-translate-y-1.5 hover:border-gold/38",
          "hover:shadow-[0_28px_72px_rgba(0,0,0,0.65),0_0_0_1px_rgba(198,164,108,0.12)]",
        )}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-gold/45 to-transparent"
          aria-hidden
        />
        <div className="relative aspect-[5/4] overflow-hidden bg-[#050505] sm:aspect-[4/3]">
          {carCardImageSrc(car) ? (
            <img
              src={carCardImageSrc(car)}
              alt=""
              style={exoticGalleryCoverStyle(car, 0)}
              className="block h-full w-full object-cover object-center transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
            />
          ) : (
            <ImagePlaceholder
              className="h-full w-full"
              label={
                car.photosComingSoon
                  ? t("exoticCarsPage.photosComingSoon")
                  : t("exoticCarsPage.photoPlaceholder")
              }
            />
          )}
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-gold/[0.07]" aria-hidden />
          {car.featured || (car.photosComingSoon && !carCardImageSrc(car)) ? (
            <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2 sm:left-4 sm:top-4">
              {car.featured ? (
                <span className="border border-gold/50 bg-[#0a0a0a]/85 px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-gold-secondary backdrop-blur-sm">
                  {t("exoticCarsPage.featured")}
                </span>
              ) : null}
              {car.photosComingSoon && !carCardImageSrc(car) ? (
                <span className="border border-gold/15 bg-[#0a0a0a]/75 px-2.5 py-1 text-[0.58rem] font-medium uppercase tracking-[0.18em] text-cream/50 backdrop-blur-sm">
                  {t("exoticCarsPage.gallerySoon")}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="relative border-t border-gold/12 bg-[#0b0b0b] px-4 py-4 sm:px-5 sm:py-5">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.32em] text-gold/55">
            {brand}
          </p>
          <p className="mt-2.5 font-serif text-lg leading-[1.2] tracking-tight text-cream sm:text-xl">
            {car.name}
          </p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-gold/[0.08] pt-4">
            <div className="min-w-0 flex-1">
              <p className="font-serif text-base tabular-nums tracking-normal text-gold-secondary sm:text-lg">
                {car.priceLine}
                {car.pricing === "hourly_range" ? "*" : ""}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-cream/42 transition-colors duration-300 group-hover:text-gold-secondary">
              {t("exoticCarsPage.open")}
              <ArrowUpRight
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden
              />
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function CarDetailDialog({
  car,
  onClose,
  t,
}: {
  car: ExoticCar | null;
  onClose: () => void;
  t: Translator;
}) {
  const titleId = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const galleryLen = car ? getGalleryLength(car) : 0;
  const showDualRental =
    car?.section === "daily" && car.dualRentalOnCard === true;

  useEffect(() => {
    if (!car) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [car]);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i <= 0 ? galleryLen - 1 : i - 1));
  }, [galleryLen]);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i >= galleryLen - 1 ? 0 : i + 1));
  }, [galleryLen]);

  useEffect(() => {
    if (!car) return;
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
  }, [car, lightboxOpen, onClose, goPrev, goNext]);

  if (!car) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-x-clip sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-[#0b0b0b]/82 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={t("exoticCarsPage.close")}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(92vh,900px)] w-full max-w-5xl flex-col overflow-hidden border border-gold/18 bg-[#0b0b0b] shadow-[0_32px_120px_rgba(0,0,0,0.75)] sm:mx-4 sm:rounded-sm"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gold/12 px-4 py-3 sm:px-6 sm:py-4">
          <h2
            id={titleId}
            className="pr-8 font-serif text-lg leading-snug tracking-tight text-cream break-words sm:text-xl"
          >
            {car.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center border border-gold/15 text-cream/70 transition-colors hover:border-gold/35 hover:text-gold-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/50"
            aria-label={t("exoticCarsPage.closeDetails")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="min-w-0 border-b border-gold/12 lg:border-b-0 lg:border-r">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0b0b0b] sm:aspect-[16/9] lg:aspect-[16/10]">
                {getGallerySrc(car, activeIndex) ? (
                  <img
                    src={getGallerySrc(car, activeIndex)}
                    alt=""
                    style={exoticGalleryCoverStyle(car, activeIndex)}
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                ) : (
                  <ImagePlaceholder
                    className="absolute inset-0 h-full w-full"
                    label={
                      car.photosComingSoon
                        ? t("exoticCarsPage.photosComingSoon")
                        : t("exoticCarsPage.gallerySlot", {
                            current: activeIndex + 1,
                            total: galleryLen,
                          })
                    }
                  />
                )}
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="absolute inset-0 z-[1] cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/50"
                  aria-label={t("exoticCarsPage.viewImageLarger")}
                />
                <span className="pointer-events-none absolute right-3 top-3 z-[2] inline-flex items-center gap-1.5 border border-gold/25 bg-[#0b0b0b]/75 px-2.5 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-cream/85 backdrop-blur-sm">
                  <Maximize2 className="h-3.5 w-3.5" aria-hidden />
                  {t("exoticCarsPage.enlarge")}
                </span>
                {galleryLen > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goPrev();
                      }}
                      className="absolute left-2 top-1/2 z-[3] flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-gold/20 bg-[#0b0b0b]/80 text-cream/90 backdrop-blur-sm transition-colors hover:border-gold/40"
                      aria-label={t("exoticCarsPage.previousPhoto")}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goNext();
                      }}
                      className="absolute right-2 top-1/2 z-[3] flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-gold/20 bg-[#0b0b0b]/80 text-cream/90 backdrop-blur-sm transition-colors hover:border-gold/40"
                      aria-label={t("exoticCarsPage.nextPhoto")}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                ) : null}
              </div>
              {galleryLen > 1 ? (
                <div className="flex gap-2 overflow-x-auto border-t border-gold/10 p-3 sm:p-4">
                  {Array.from({ length: galleryLen }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveIndex(i)}
                      className={cn(
                        "relative h-14 w-24 shrink-0 overflow-hidden border transition-colors sm:h-16 sm:w-28",
                        i === activeIndex
                          ? "border-gold/45"
                          : "border-gold/12 hover:border-gold/25",
                      )}
                      aria-label={t("exoticCarsPage.showPhoto", { n: i + 1 })}
                      aria-current={i === activeIndex}
                    >
                      {getGallerySrc(car, i) ? (
                        <img
                          src={getGallerySrc(car, i)}
                          alt=""
                          style={exoticGalleryCoverStyle(car, i)}
                          className="block h-full w-full object-cover object-center"
                        />
                      ) : (
                        <ImagePlaceholder
                          className="h-full w-full"
                          label={
                            car.photosComingSoon
                              ? t("exoticCarsPage.soon")
                              : `${i + 1}`
                          }
                        />
                      )}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="min-w-0 flex flex-col p-5 pb-8 sm:p-7 sm:pb-10">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.42em] text-gold/90">
                {car.section === "daily"
                  ? t("exoticCarsPage.dailyRate")
                  : t("exoticCarsPage.hourlyRate")}
              </p>
              <p className="mt-3 font-serif text-2xl tabular-nums tracking-normal text-gold-secondary sm:text-[1.65rem]">
                {car.priceLine}
                {car.pricing === "hourly_range" ? "*" : ""}
              </p>
              {car.priceNote ? (
                <p className="mt-2 text-[0.75rem] leading-relaxed text-cream/48">
                  *{car.priceNote}
                </p>
              ) : null}
              {showDualRental ? (
                <p className="mt-4 text-[0.8125rem] leading-relaxed text-cream/55">
                  {t("exoticCarsPage.dualRentalNote")}
                </p>
              ) : null}
              {car.specs && car.specs.length > 0 ? (
                <>
                  <p className="mt-6 text-[0.62rem] font-medium uppercase tracking-[0.32em] text-gold/70">
                    {t("exoticCarsPage.vehicleDetails")}
                  </p>
                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:gap-x-6">
                  {car.specs.map((row) => (
                    <div key={row.label}>
                      <dt className="text-[0.62rem] font-medium uppercase tracking-[0.28em] text-gold/65">
                        {row.label}
                      </dt>
                      <dd className="mt-1.5 text-[0.9375rem] text-cream/88">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
                </>
              ) : null}
              <p
                className={cn(
                  "text-[0.62rem] font-medium uppercase tracking-[0.32em] text-gold/70",
                  car.specs?.length ? "mt-8" : "mt-6",
                )}
              >
                {t("exoticCarsPage.vehicleDescription")}
              </p>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-cream/72">
                {car.description}
              </p>
              {car.requirements && car.requirements.length > 0 ? (
                <>
                  <p className="mt-8 text-[0.62rem] font-medium uppercase tracking-[0.32em] text-gold/70">
                    {t("exoticCarsPage.importantRequirements")}
                  </p>
                  <ul className="mt-4 space-y-3" role="list">
                    {car.requirements.map((req) => (
                      <li
                        key={req}
                        className="flex gap-3 text-[0.9375rem] leading-snug text-cream/78"
                      >
                        <span
                          className="mt-[0.4em] h-1 w-1 shrink-0 rounded-full bg-gold/45"
                          aria-hidden
                        />
                        {req}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
              {car.highlights && car.highlights.length > 0 ? (
                <>
                  <p className="mt-8 text-[0.62rem] font-medium uppercase tracking-[0.32em] text-gold/70">
                    {t("exoticCarsPage.highlights")}
                  </p>
                  <ul className="mt-4 space-y-3" role="list">
                    {car.highlights.map((h) => (
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
                </>
              ) : null}
              <ExoticCarBookingPanel key={car.id} car={car} />
            </div>
          </div>
        </div>
      </div>

      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-[#050505]/95 backdrop-blur-md"
          role="presentation"
        >
          <div className="flex items-center justify-between border-b border-gold/12 px-4 py-3 sm:px-6">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-cream/55">
              {t("exoticCarsPage.lightboxCounter", {
                name: car.name,
                current: activeIndex + 1,
                total: galleryLen,
              })}
            </p>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="flex h-10 w-10 items-center justify-center border border-gold/15 text-cream/80 hover:border-gold/35 hover:text-gold-secondary"
              aria-label={t("exoticCarsPage.closeEnlargedView")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center p-4 sm:p-8">
            {getGallerySrc(car, activeIndex) ? (
              <img
                src={getGallerySrc(car, activeIndex)}
                alt=""
                className="h-full max-h-[min(78vh,820px)] w-full max-w-5xl object-contain"
              />
            ) : (
              <ImagePlaceholder
                className="h-full max-h-[min(78vh,820px)] w-full max-w-5xl"
                label={
                  car.photosComingSoon
                    ? t("exoticCarsPage.photosComingSoon")
                    : t("exoticCarsPage.largePreview", {
                        current: activeIndex + 1,
                        total: galleryLen,
                      })
                }
              />
            )}
            {galleryLen > 1 ? (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-gold/25 bg-[#0b0b0b]/85 text-cream sm:left-6"
                  aria-label={t("exoticCarsPage.previousPhoto")}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-gold/25 bg-[#0b0b0b]/85 text-cream sm:right-6"
                  aria-label={t("exoticCarsPage.nextPhoto")}
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

function ExoticCatalogPagination({
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
      aria-label={t("exoticCarsPage.paginationAria")}
    >
      <p className="text-[0.72rem] tabular-nums text-cream/42">
        {t("exoticCarsPage.showingRange", { from, to, total })}
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
          {t("exoticCarsPage.prev")}
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
          {t("exoticCarsPage.next")}
        </button>
      </div>
    </nav>
  );
}

function ExoticCarsCatalogInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale, t } = useLocale();

  const [selected, setSelected] = useState<ExoticCar | null>(null);
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [sortMode, setSortMode] = useState<ExoticSortMode>("featured-first");

  const localizedDaily = useMemo(
    () => getLocalizedExoticCars(locale, t),
    [locale, t],
  );

  const sortOptions = useMemo(
    (): { id: ExoticSortMode; label: string }[] => [
      {
        id: "featured-first",
        label: t("exoticCarsPage.sort.featuredFirst"),
      },
      { id: "price-asc", label: t("exoticCarsPage.sort.priceAsc") },
      { id: "price-desc", label: t("exoticCarsPage.sort.priceDesc") },
      { id: "name-asc", label: t("exoticCarsPage.sort.nameAsc") },
      { id: "name-desc", label: t("exoticCarsPage.sort.nameDesc") },
    ],
    [t],
  );

  const selectedLocalized = useMemo(() => {
    if (!selected) return null;
    return localizedDaily.find((c) => c.id === selected.id) ?? selected;
  }, [selected, localizedDaily]);

  const fleetBrandOptions = useMemo(() => {
    const set = new Set<string>();
    const collatorLocale = locale === "es" ? "es" : "en";
    for (const car of localizedDaily) {
      const g = car.group.trim();
      if (g) set.add(g);
    }
    return Array.from(set).sort((a, b) =>
      a.localeCompare(b, collatorLocale, { sensitivity: "base" }),
    );
  }, [localizedDaily, locale]);

  const carMatchesBrand = useCallback(
    (car: ExoticCar) =>
      brandFilter === "all" || car.group.trim() === brandFilter,
    [brandFilter],
  );

  const requestedPage = useMemo(() => {
    const raw = searchParams.get("page");
    const n = parseInt(raw || "1", 10);
    return Number.isFinite(n) && n >= 1 ? n : 1;
  }, [searchParams]);

  const flattenedCars = useMemo(() => {
    const out: ExoticCar[] = [];
    for (const car of localizedDaily) {
      if (!carMatchesBrand(car)) continue;
      out.push(car);
    }
    return sortExoticCars(out, sortMode);
  }, [carMatchesBrand, localizedDaily, sortMode]);

  const { slice, pageCount, safePage, total } = useMemo(
    () => paginateSlice(flattenedCars, requestedPage, CATALOG_PAGE_SIZE),
    [flattenedCars, requestedPage],
  );

  const prevFilters = useRef<{
    brandFilter: string;
    sortMode: ExoticSortMode;
  } | null>(null);
  useEffect(() => {
    const cur = { brandFilter, sortMode };
    const prev = prevFilters.current;
    if (!prev) {
      prevFilters.current = cur;
      return;
    }
    const changed =
      prev.brandFilter !== cur.brandFilter ||
      prev.sortMode !== cur.sortMode;
    prevFilters.current = cur;
    if (!changed) return;
    router.replace(pathname, { scroll: false });
  }, [brandFilter, sortMode, pathname, router]);

  useEffect(() => {
    if (safePage === requestedPage) return;
    router.replace(
      safePage > 1 ? `${pathname}?page=${safePage}` : pathname,
      { scroll: false },
    );
  }, [safePage, requestedPage, pathname, router]);

  const prevCatalogPageRef = useRef<number | null>(null);
  useEffect(() => {
    if (prevCatalogPageRef.current === null) {
      prevCatalogPageRef.current = requestedPage;
      return;
    }
    if (prevCatalogPageRef.current === requestedPage) return;
    prevCatalogPageRef.current = requestedPage;
    document.getElementById("exotic-fleet")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [requestedPage]);

  const goToCatalogPage = useCallback(
    (p: number) => {
      router.replace(p > 1 ? `${pathname}?page=${p}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router],
  );

  const dailyConfigEmpty = localizedDaily.length === 0;

  return (
    <div className="bg-[#0b0b0b] [color-scheme:dark]">
      <SectionReveal className="relative overflow-hidden border-b border-gold/10 bg-[#0b0b0b]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(198,164,108,0.06),transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.48em] text-gold/90">
            {t("exoticCarsPage.eyebrow")}
          </p>
          <div className="mt-4 h-px w-14 bg-gold/30" aria-hidden />
          <h1 className="mt-6 max-w-3xl font-serif text-[2.1rem] leading-[1.12] tracking-tight text-cream sm:text-4xl md:text-[2.65rem]">
            {t("exoticCarsPage.headline")}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-cream/58 sm:text-[0.9375rem]">
            {t("exoticCarsPage.heroBody")}
          </p>
          <p className="mt-6 max-w-2xl rounded-sm border border-gold/15 bg-[#050505] px-4 py-3 text-[0.8125rem] leading-relaxed text-cream/55 sm:mt-7">
            {t("exoticCarsPage.chauffeurNoteBefore")}{" "}
            <Link
              href="/services/chauffeur-services"
              className="text-cream/72 underline-offset-4 transition-colors hover:text-gold-secondary hover:underline"
            >
              {t("exoticCarsPage.chauffeurLink")}
            </Link>{" "}
            {t("exoticCarsPage.chauffeurNoteAfter")}
          </p>
        </div>
      </SectionReveal>

      <div
        className="border-b border-gold/12 bg-[#0b0b0b]"
        role="region"
        aria-label={t("exoticCarsPage.fleetFiltersAria")}
      >
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4 lg:px-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
            <div className="min-w-0 flex-1 space-y-3">
              {fleetBrandOptions.length > 0 ? (
                <div>
                  <label
                    htmlFor="exotic-filter-brand"
                    className="block text-[0.58rem] font-semibold uppercase tracking-[0.28em] text-gold/55"
                  >
                    {t("exoticCarsPage.brand")}
                  </label>
                  <div className="relative mt-2">
                    <select
                      id="exotic-filter-brand"
                      value={brandFilter}
                      onChange={(e) => setBrandFilter(e.target.value)}
                      className={filterSelectClass}
                    >
                      <option value="all">{t("exoticCarsPage.allBrands")}</option>
                      {fleetBrandOptions.map((name) => (
                        <option key={name} value={name}>
                          {exoticBrandFilterLabel(name, t)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/45"
                      aria-hidden
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-col lg:w-[min(100%,18rem)]">
              <label
                htmlFor="exotic-fleet-sort"
                className="text-[0.58rem] font-semibold uppercase tracking-[0.28em] text-gold/55"
              >
                {t("exoticCarsPage.sortBy")}
              </label>
              <div className="relative mt-1.5 sm:mt-2">
                <select
                  id="exotic-fleet-sort"
                  value={sortMode}
                  onChange={(e) =>
                    setSortMode(e.target.value as ExoticSortMode)
                  }
                  className={filterSelectClass}
                >
                  {sortOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/45"
                  aria-hidden
                />
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-gold/[0.08] pt-3">
            <p className="text-[0.68rem] leading-relaxed text-cream/40">
              <span className="tabular-nums text-cream/55">
                {total === 1
                  ? t("exoticCarsPage.vehicleCount", { count: total })
                  : t("exoticCarsPage.vehicleCountPlural", { count: total })}
              </span>
            </p>
            {brandFilter !== "all" || sortMode !== "featured-first" ? (
              <button
                type="button"
                onClick={() => {
                  setBrandFilter("all");
                  setSortMode("featured-first");
                }}
                className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold/55 underline-offset-4 transition-colors hover:text-gold-secondary hover:underline"
              >
                {t("exoticCarsPage.clearFilters")}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal
        id="exotic-fleet"
        className="scroll-mt-[calc(4rem+0.75rem)] border-b border-gold/10 bg-[#0b0b0b] py-14 sm:scroll-mt-[calc(4.25rem+0.75rem)] sm:py-16 lg:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          {dailyConfigEmpty ? (
            <p className="mt-0 max-w-xl text-sm leading-relaxed text-cream/52">
              {t("exoticCarsPage.emptyRefreshing")}
            </p>
          ) : total === 0 ? (
            <p className="mt-0 max-w-xl text-sm leading-relaxed text-cream/52">
              {brandFilter !== "all" ? (
                <>
                  {t("exoticCarsPage.emptyBrand")}{" "}
                  <span className="text-cream/60">
                    {t("exoticCarsPage.allBrands")}
                  </span>{" "}
                  {t("exoticCarsPage.emptyBrandOr")}{" "}
                  <span className="text-cream/60">
                    {t("exoticCarsPage.clearFilters")}
                  </span>
                  .
                </>
              ) : (
                <>
                  {t("exoticCarsPage.emptyFilters")}{" "}
                  <span className="text-cream/60">
                    {t("exoticCarsPage.clearFilters")}
                  </span>
                  .
                </>
              )}
            </p>
          ) : (
            <>
              <div className="mt-2 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-9 lg:grid-cols-3 lg:gap-8">
                {slice.map((car, index) => (
                  <ScrollRevealItem key={car.id} index={index}>
                    <CarCard car={car} onOpen={setSelected} t={t} />
                  </ScrollRevealItem>
                ))}
              </div>
              <ExoticCatalogPagination
                page={safePage}
                pageCount={pageCount}
                total={total}
                pageSize={CATALOG_PAGE_SIZE}
                onPage={goToCatalogPage}
                t={t}
              />
              {EXOTIC_CARS_DAILY.some((c) => c.pricing === "hourly_range") ? (
                <p className="mt-12 border-t border-gold/10 pt-8 text-[0.75rem] leading-relaxed text-cream/42">
                  {t("exoticCarsPage.rangePricingNote")}
                </p>
              ) : null}
            </>
          )}
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <ServicePhotographyAddon
        className="bg-[#0b0b0b]"
        headline={t("exoticCarsPage.photography.headline")}
        description={t("exoticCarsPage.photography.description")}
        images={EXOTIC_PHOTOGRAPHY_ADDON_IMAGES}
        marqueeDurationSec={175}
      />

      <CarDetailDialog
        key={selectedLocalized?.id ?? "no-car"}
        car={selectedLocalized}
        onClose={() => setSelected(null)}
        t={t}
      />
    </div>
  );
}

export function ExoticCarsCatalog() {
  return (
    <Suspense fallback={null}>
      <ExoticCarsCatalogInner />
    </Suspense>
  );
}
