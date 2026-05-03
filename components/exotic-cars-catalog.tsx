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
import { ServicePhotographyAddon } from "@/components/service-photography-addon";
import { EXOTIC_CARS_DAILY, type ExoticCar } from "@/lib/exotic-cars-data";
import { paginateSlice } from "@/lib/pagination";
import {
  sortExoticCars,
  type ExoticSortMode,
} from "@/lib/exotic-catalog-utils";
import { EXOTIC_PHOTOGRAPHY_ADDON_IMAGES } from "@/lib/exotic-car-photos";
import { cn, shuffleImmutable } from "@/lib/utils";

const btnPrimary =
  "inline-flex min-h-11 items-center justify-center border border-gold/40 bg-gold px-8 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#0b0b0b] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold-secondary hover:bg-gold-secondary hover:shadow-[0_0_0_1px_rgba(224,195,138,0.4),0_14px_48px_rgba(198,164,108,0.2)] active:translate-y-0";

const CATALOG_PAGE_SIZE = 9;

const SORT_OPTIONS: { id: ExoticSortMode; label: string }[] = [
  { id: "featured-first", label: "Featured first" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "name-asc", label: "Name: A → Z" },
  { id: "name-desc", label: "Name: Z → A" },
];

const filterSelectClass =
  "w-full cursor-pointer appearance-none rounded-sm border border-gold/22 bg-[#0b0b0b] py-2.5 pl-3 pr-10 text-[0.8125rem] text-cream/90 transition-colors hover:border-gold/32 focus:border-gold/45 focus:outline-none focus:ring-1 focus:ring-gold/25";

/** Optional prettier labels in the brand filter — values stay as `ExoticCar.group`. */
const EXOTIC_BRAND_FILTER_LABEL: Record<string, string> = {
  Maybach: "Maybach vans",
};

function exoticBrandFilterLabel(group: string): string {
  return EXOTIC_BRAND_FILTER_LABEL[group] ?? group;
}

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
}: {
  car: ExoticCar;
  onOpen: (car: ExoticCar) => void;
}) {
  const brand = car.group.trim() || "Fleet";

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
              className="h-full w-full object-cover object-center transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
            />
          ) : (
            <ImagePlaceholder
              className="h-full w-full"
              label={
                car.photosComingSoon ? "Photos coming soon" : "Photo placeholder"
              }
            />
          )}
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-gold/[0.07]" aria-hidden />
          {car.featured || (car.photosComingSoon && !carCardImageSrc(car)) ? (
            <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2 sm:left-4 sm:top-4">
              {car.featured ? (
                <span className="border border-gold/50 bg-[#0a0a0a]/85 px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-gold-secondary backdrop-blur-sm">
                  Featured
                </span>
              ) : null}
              {car.photosComingSoon && !carCardImageSrc(car) ? (
                <span className="border border-gold/15 bg-[#0a0a0a]/75 px-2.5 py-1 text-[0.58rem] font-medium uppercase tracking-[0.18em] text-cream/50 backdrop-blur-sm">
                  Gallery soon
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
              <p className="font-serif text-base tabular-nums tracking-tight text-gold-secondary sm:text-lg">
                {car.priceLine}
                {car.pricing === "hourly_range" ? "*" : ""}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-cream/42 transition-colors duration-300 group-hover:text-gold-secondary">
              Open
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
}: {
  car: ExoticCar | null;
  onClose: () => void;
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
        aria-label="Close"
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
            aria-label="Close details"
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
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                ) : (
                  <ImagePlaceholder
                    className="absolute inset-0 h-full w-full"
                    label={
                      car.photosComingSoon
                        ? "Photos coming soon"
                        : `Gallery ${activeIndex + 1} of ${galleryLen}`
                    }
                  />
                )}
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="absolute inset-0 z-[1] cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/50"
                  aria-label="View image larger"
                />
                <span className="pointer-events-none absolute right-3 top-3 z-[2] inline-flex items-center gap-1.5 border border-gold/25 bg-[#0b0b0b]/75 px-2.5 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-cream/85 backdrop-blur-sm">
                  <Maximize2 className="h-3.5 w-3.5" aria-hidden />
                  Enlarge
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
                      aria-label="Previous photo"
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
                      aria-label="Next photo"
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
                      aria-label={`Show photo ${i + 1}`}
                      aria-current={i === activeIndex}
                    >
                      {getGallerySrc(car, i) ? (
                        <img
                          src={getGallerySrc(car, i)}
                          alt=""
                          className="h-full w-full object-cover object-center"
                        />
                      ) : (
                        <ImagePlaceholder
                          className="h-full w-full"
                          label={
                            car.photosComingSoon ? "Soon" : `${i + 1}`
                          }
                        />
                      )}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="min-w-0 flex flex-col p-5 sm:p-7 lg:max-h-[min(70vh,640px)] lg:overflow-y-auto">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.42em] text-gold/90">
                {car.section === "daily" ? "Daily rate" : "Hourly rate"}
              </p>
              <p className="mt-3 font-serif text-2xl tabular-nums tracking-tight text-gold-secondary sm:text-[1.65rem]">
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
                  Also bookable with a chauffeur on request — ask when you
                  inquire; we&apos;ll confirm availability and hourly pricing.
                </p>
              ) : null}
              {car.specs && car.specs.length > 0 ? (
                <>
                  <p className="mt-6 text-[0.62rem] font-medium uppercase tracking-[0.32em] text-gold/70">
                    Vehicle details
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
                Vehicle description
              </p>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-cream/72">
                {car.description}
              </p>
              {car.requirements && car.requirements.length > 0 ? (
                <>
                  <p className="mt-8 text-[0.62rem] font-medium uppercase tracking-[0.32em] text-gold/70">
                    Important requirements
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
                    Highlights
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
              {car.name} · {activeIndex + 1} / {galleryLen}
            </p>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="flex h-10 w-10 items-center justify-center border border-gold/15 text-cream/80 hover:border-gold/35 hover:text-gold-secondary"
              aria-label="Close enlarged view"
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
                    ? "Photos coming soon"
                    : `Large preview ${activeIndex + 1} of ${galleryLen}`
                }
              />
            )}
            {galleryLen > 1 ? (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-gold/25 bg-[#0b0b0b]/85 text-cream sm:left-6"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-gold/25 bg-[#0b0b0b]/85 text-cream sm:right-6"
                  aria-label="Next photo"
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
}: {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onPage: (p: number) => void;
}) {
  if (pageCount <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav
      className="mt-12 flex flex-col items-center gap-5 border-t border-gold/10 pt-10 sm:flex-row sm:justify-between"
      aria-label="Exotic fleet pages"
    >
      <p className="text-[0.72rem] tabular-nums text-cream/42">
        Showing{" "}
        <span className="text-cream/55">
          {from}–{to}
        </span>{" "}
        of{" "}
        <span className="text-cream/55">{total}</span>
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
          Prev
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
          Next
        </button>
      </div>
    </nav>
  );
}

function ExoticCarsCatalogInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selected, setSelected] = useState<ExoticCar | null>(null);
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [sortMode, setSortMode] = useState<ExoticSortMode>("featured-first");

  const shuffledPhotoAddonImages = useMemo(
    () => shuffleImmutable(EXOTIC_PHOTOGRAPHY_ADDON_IMAGES),
    [],
  );

  const fleetBrandOptions = useMemo(() => {
    const set = new Set<string>();
    for (const car of EXOTIC_CARS_DAILY) {
      const g = car.group.trim();
      if (g) set.add(g);
    }
    return Array.from(set).sort((a, b) =>
      a.localeCompare(b, "en", { sensitivity: "base" }),
    );
  }, []);

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
    for (const car of EXOTIC_CARS_DAILY) {
      if (!carMatchesBrand(car)) continue;
      out.push(car);
    }
    return sortExoticCars(out, sortMode);
  }, [carMatchesBrand, sortMode]);

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

  const dailyConfigEmpty = EXOTIC_CARS_DAILY.length === 0;

  return (
    <div className="bg-[#0b0b0b] [color-scheme:dark]">
      <SectionReveal className="relative overflow-hidden border-b border-gold/10 bg-[#0b0b0b]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(198,164,108,0.06),transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.48em] text-gold/90">
            Fleet
          </p>
          <div className="mt-4 h-px w-14 bg-gold/30" aria-hidden />
          <h1 className="mt-6 max-w-3xl font-serif text-[2.1rem] leading-[1.12] tracking-tight text-cream sm:text-4xl md:text-[2.65rem]">
            Exotic car rentals
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-cream/58 sm:text-[0.9375rem]">
            Daily self-drive fleet — filter by brand, sort the list, then open
            a vehicle for full details, gallery, and booking.
          </p>
          <p className="mt-6 max-w-2xl rounded-sm border border-gold/15 bg-[#050505] px-4 py-3 text-[0.8125rem] leading-relaxed text-cream/55 sm:mt-7">
            Dedicated chauffeur vehicles and hourly rates are on our{" "}
            <Link
              href="/services/chauffeur-services"
              className="text-cream/72 underline-offset-4 transition-colors hover:text-gold-secondary hover:underline"
            >
              chauffeur service
            </Link>{" "}
            page. Select models here can still be arranged with a driver when
            you inquire.
          </p>
        </div>
      </SectionReveal>

      <div
        className="border-b border-gold/12 bg-[#0b0b0b]"
        role="region"
        aria-label="Fleet filters"
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
                    Brand
                  </label>
                  <div className="relative mt-2">
                    <select
                      id="exotic-filter-brand"
                      value={brandFilter}
                      onChange={(e) => setBrandFilter(e.target.value)}
                      className={filterSelectClass}
                    >
                      <option value="all">All brands</option>
                      {fleetBrandOptions.map((name) => (
                        <option key={name} value={name}>
                          {exoticBrandFilterLabel(name)}
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
                Sort by
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
                  {SORT_OPTIONS.map((o) => (
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
              <span className="tabular-nums text-cream/55">{total}</span>{" "}
              {`self-drive vehicle${total === 1 ? "" : "s"}`}
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
                Clear filters
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
              Daily self-drive options are being refreshed — ask the team for
              what&apos;s available on your dates.
            </p>
          ) : total === 0 ? (
            <p className="mt-0 max-w-xl text-sm leading-relaxed text-cream/52">
              {brandFilter !== "all" ? (
                <>
                  No vehicles for this brand with the current view. Try{" "}
                  <span className="text-cream/60">All brands</span> or{" "}
                  <span className="text-cream/60">Clear filters</span>.
                </>
              ) : (
                <>
                  No vehicles match your filters. Try{" "}
                  <span className="text-cream/60">Clear filters</span>.
                </>
              )}
            </p>
          ) : (
            <>
              <div className="mt-2 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-9 lg:grid-cols-3 lg:gap-8">
                {slice.map((car, index) => (
                  <ScrollRevealItem key={car.id} index={index}>
                    <CarCard car={car} onOpen={setSelected} />
                  </ScrollRevealItem>
                ))}
              </div>
              <ExoticCatalogPagination
                page={safePage}
                pageCount={pageCount}
                total={total}
                pageSize={CATALOG_PAGE_SIZE}
                onPage={goToCatalogPage}
              />
              {EXOTIC_CARS_DAILY.some((c) => c.pricing === "hourly_range") ? (
                <p className="mt-12 border-t border-gold/10 pt-8 text-[0.75rem] leading-relaxed text-cream/42">
                  *Range pricing is confirmed on inquiry based on your
                  schedule.
                </p>
              ) : null}
            </>
          )}
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <ServicePhotographyAddon
        className="bg-[#0b0b0b]"
        headline="Add photo or video shoots"
        description="Book a photo shoot, a video shoot, or both alongside your exotic — same coordination, briefing, and edited stills and/or motion after your drive."
        images={shuffledPhotoAddonImages}
        marqueeDurationSec={175}
      />

      <CarDetailDialog
        key={selected?.id ?? "no-car"}
        car={selected}
        onClose={() => setSelected(null)}
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
