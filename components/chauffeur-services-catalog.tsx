"use client";

import { ArrowUpRight, ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";

import { ServicePhotographyAddon } from "@/components/service-photography-addon";
import { EXOTIC_PHOTOGRAPHY_ADDON_IMAGES } from "@/lib/exotic-car-photos";
import { cn, shuffleImmutable } from "@/lib/utils";
import type { ExoticCar } from "@/lib/exotic-cars-data";
import {
  CHAUFFEUR_FLEET_SORTED,
  chauffeurQuoteRateLine,
  FEATURED_CHAUFFEUR_ID_SET,
  type ChauffeurFleetEntry,
} from "@/lib/chauffeur-fleet-data";

type ChauffeurCar = ChauffeurFleetEntry;

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

function ChauffeurDetailDialog({
  car,
  onClose,
}: {
  car: ChauffeurCar | null;
  onClose: () => void;
}) {
  const titleId = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const galleryLen = car ? getGalleryLength(car) : 0;

  useEffect(() => {
    if (!car) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [car]);

  useEffect(() => {
    setActiveIndex(0);
    setLightboxOpen(false);
  }, [car?.id]);

  useEffect(() => {
    if (!car) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightboxOpen) setLightboxOpen(false);
        else onClose();
      }
      if (lightboxOpen && galleryLen > 1) {
        if (e.key === "ArrowLeft")
          setActiveIndex((i) => (i <= 0 ? galleryLen - 1 : i - 1));
        if (e.key === "ArrowRight")
          setActiveIndex((i) => (i >= galleryLen - 1 ? 0 : i + 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [car, lightboxOpen, galleryLen, onClose]);

  if (!car) return null;

  const chauffeurRate = chauffeurQuoteRateLine(car);

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
            className="flex h-10 w-10 shrink-0 items-center justify-center border border-gold/15 text-cream/70 transition-colors hover:border-gold/35 hover:text-gold-secondary"
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
                  <div className="absolute inset-0 flex items-center justify-center text-[0.72rem] uppercase tracking-[0.2em] text-cream/35">
                    Photo coming soon
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="absolute inset-0 z-[1] cursor-zoom-in"
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
                        setActiveIndex((i) => (i <= 0 ? galleryLen - 1 : i - 1));
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
                        setActiveIndex((i) => (i >= galleryLen - 1 ? 0 : i + 1));
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
                      aria-current={i === activeIndex || undefined}
                    >
                      {getGallerySrc(car, i) ? (
                        <img
                          src={getGallerySrc(car, i)}
                          alt=""
                          className="h-full w-full object-cover object-center"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#050505] text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-cream/32">
                          {car.photosComingSoon ? "Soon" : `${i + 1}`}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="min-w-0 flex flex-col p-5 sm:p-7 lg:max-h-[min(70vh,640px)] lg:overflow-y-auto">
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.32em] text-gold/70">
                Chauffeur rate
              </p>
              <p className="mt-3 font-serif text-2xl tabular-nums tracking-tight text-gold-secondary sm:text-[1.65rem]">
                {chauffeurRate}
              </p>

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
                        <dd className="mt-1.5 text-[0.9375rem] text-cream/88">{row.value}</dd>
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
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-cream/72">{car.description}</p>

              {car.requirements && car.requirements.length > 0 ? (
                <>
                  <p className="mt-8 text-[0.62rem] font-medium uppercase tracking-[0.32em] text-gold/70">
                    Important requirements
                  </p>
                  {car.source === "daily" ? (
                    <p className="mt-2 text-[0.78rem] leading-relaxed text-cream/56">
                      This vehicle is also available as{" "}
                      <span className="text-cream/74">self-drive</span>. The
                      list below contains the self-drive requirements.
                    </p>
                  ) : null}
                  <ul className="mt-4 space-y-3" role="list">
                    {car.requirements.map((req) => (
                      <li key={req} className="flex gap-3 text-[0.9375rem] leading-snug text-cream/78">
                        <span className="mt-[0.4em] h-1 w-1 shrink-0 rounded-full bg-gold/45" aria-hidden />
                        {req}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {lightboxOpen ? (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[#050505]/95 backdrop-blur-md" role="presentation">
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
              <div className="flex h-full max-h-[min(78vh,820px)] w-full max-w-5xl items-center justify-center text-[0.72rem] uppercase tracking-[0.2em] text-cream/35">
                Photo coming soon
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ChauffeurServicesCatalog() {
  const [selected, setSelected] = useState<ChauffeurCar | null>(null);

  const chauffeurFleet = useMemo<ChauffeurCar[]>(
    () => [...CHAUFFEUR_FLEET_SORTED],
    [],
  );

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.34em] text-gold/75">
            Chauffeur fleet
          </p>
          <h2 className="mt-3 font-serif text-2xl tracking-tight text-cream sm:text-[2.05rem]">
            Available chauffeur vehicles
          </h2>
        </div>
        <p className="text-[0.8rem] leading-relaxed text-cream/50">
          {chauffeurFleet.length}+ vehicles currently listed
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {chauffeurFleet.map((car) => {
          const image = car.galleryImages?.[0] ?? car.coverImage;
          const isFeatured = FEATURED_CHAUFFEUR_ID_SET.has(car.id);
          const chauffeurRate = chauffeurQuoteRateLine(car);

          return (
            <button
              type="button"
              key={car.id}
              onClick={() => setSelected(car)}
              className="group overflow-hidden border border-gold/14 bg-[#0b0b0b] text-left shadow-[0_8px_40px_rgba(0,0,0,0.45)] transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-gold/35 hover:shadow-[0_28px_72px_rgba(0,0,0,0.65),0_0_0_1px_rgba(198,164,108,0.12)]"
            >
              <div className="relative aspect-[4/3] bg-[#050505]">
                {isFeatured ? (
                  <span className="absolute left-3 top-3 z-10 border border-gold/30 bg-[#0b0b0b]/90 px-2.5 py-1 text-[0.56rem] font-semibold uppercase tracking-[0.2em] text-gold-secondary backdrop-blur-sm">
                    Featured
                  </span>
                ) : null}
                {image ? (
                  <img
                    src={image}
                    alt={car.name}
                    className="h-full w-full object-cover object-center transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[0.72rem] uppercase tracking-[0.2em] text-cream/35">
                    Photo coming soon
                  </div>
                )}
              </div>

              <div className="border-t border-gold/12 px-5 py-5">
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-gold/60">
                  {car.group}
                </p>
                <h3 className="mt-2 font-serif text-xl tracking-tight text-cream">{car.name}</h3>
                <p className="mt-4 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-cream/45">
                  Chauffeur rate
                </p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="font-serif text-lg tabular-nums tracking-tight text-gold-secondary">
                    {chauffeurRate}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-cream/42 transition-colors duration-300 group-hover:text-gold-secondary">
                    Open
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <ChauffeurDetailDialog car={selected} onClose={() => setSelected(null)} />
    </>
  );
}

/** Same add-on strip as exotic cars — shuffled car photo marquee. */
export function ChauffeurPhotographyAddonBlock() {
  const shuffledPhotoAddonImages = useMemo(
    () => shuffleImmutable(EXOTIC_PHOTOGRAPHY_ADDON_IMAGES),
    [],
  );

  return (
    <>
      <div className="section-gradient-divider" aria-hidden />
      <ServicePhotographyAddon
        className="bg-[#0b0b0b]"
        headline="Add photo or video shoots"
        description="Book a photo shoot, a video shoot, or both alongside your exotic — same coordination, briefing, and edited stills and/or motion after your drive."
        images={shuffledPhotoAddonImages}
        marqueeDurationSec={175}
      />
    </>
  );
}
