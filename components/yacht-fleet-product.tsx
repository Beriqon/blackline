"use client";

import { ChevronLeft, ChevronRight, Ship } from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useLocale } from "@/components/locale-provider";
import {
  YachtListingAbout,
  YachtListingSpecsAndIncluded,
} from "@/components/yacht-listing-narrative";
import { YachtBookingButton } from "@/components/yacht-booking-button";
import { YachtChartersBackLink } from "@/components/yacht-charters-back-link";
import { SectionReveal } from "@/components/section-reveal";
import { YachtProductAddons } from "@/components/yacht-product-addons";
import type { Translator } from "@/lib/i18n/translate";
import { localizeYacht } from "@/lib/i18n/yachts-page";
import { resolveYachtGalleryPaths } from "@/lib/yacht-fleet-gallery";
import {
  FLEET_GRATUITY_PCTS,
  computeFleetTotals,
  durationOptionsFromYacht,
  formatUsd,
  type FleetDurationOption,
  type FleetGratuityPct,
} from "@/lib/yacht-fleet-pricing";
import type { Yacht } from "@/lib/yachts-data";
import { cn } from "@/lib/utils";

const pillClass =
  "min-h-10 rounded-sm border px-3.5 py-2 text-center text-[0.7rem] font-semibold uppercase tracking-[0.14em] transition-colors sm:min-h-9 sm:px-4 sm:text-[0.72rem]";

function PhotoPlaceholder({
  className,
  photosComingSoon,
}: {
  className?: string;
  photosComingSoon: string;
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-[12rem] flex-col items-center justify-center gap-3 border border-gold/12 bg-[#141414] px-6 py-12 text-center sm:min-h-0 sm:aspect-[16/10]",
        className,
      )}
    >
      <Ship className="h-10 w-10 text-gold/22 sm:h-12 sm:w-12" aria-hidden />
      <span className="max-w-xs text-[0.65rem] font-medium uppercase tracking-[0.2em] text-cream/35">
        {photosComingSoon}
      </span>
    </div>
  );
}

function buildAboutParagraphs(y: Yacht): readonly string[] {
  const chunks = y.description
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const parts: string[] = chunks.length > 0 ? [...chunks] : [y.description];
  if (y.highlights.length > 0) {
    parts.push(y.highlights.join(" "));
  }
  return parts;
}

function defaultIncluded(y: Yacht, t: Translator): readonly string[] {
  if (y.inclusions && y.inclusions.length > 0) return y.inclusions;
  return [
    t("yachtsPage.product.defaultInclusions.0"),
    t("yachtsPage.product.defaultInclusions.1"),
    t("yachtsPage.product.defaultInclusions.2"),
    t("yachtsPage.product.defaultInclusions.3"),
  ];
}

export function YachtFleetProduct({ yacht }: { yacht: Yacht }) {
  const { locale, t } = useLocale();
  const y = useMemo(() => localizeYacht(yacht, locale), [yacht, locale]);

  const paths = useMemo(
    () => resolveYachtGalleryPaths(yacht),
    [yacht],
  );
  const hasPhotos = paths.length > 0;
  const galleryLen = paths.length;
  const [photoIndex, setPhotoIndex] = useState(0);
  const thumbStripRef = useRef<HTMLDivElement | null>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const ratesPending = yacht.ratesPending === true;

  const durations = useMemo(() => {
    if (ratesPending) return [];
    const d = durationOptionsFromYacht(y);
    if (d.length > 0) return d;
    return [
      {
        id: "d0",
        label: t("yachtsPage.product.charterBase"),
        baseUsd: y.listingPriceUsd,
      },
    ];
  }, [y, ratesPending, t]);

  const [durationId, setDurationId] = useState<string>(() =>
    durations[0]?.id ?? "d0",
  );
  const safeDurationId =
    durations.find((d) => d.id === durationId)?.id ?? durations[0]?.id ?? "d0";

  const tier: FleetDurationOption | undefined = useMemo(
    () => durations.find((d) => d.id === safeDurationId) ?? durations[0],
    [durations, safeDurationId],
  );

  const [gratuityPct, setGratuityPct] = useState<FleetGratuityPct>(18);

  const { taxUsd, gratuityUsd, totalUsd } = useMemo(() => {
    if (!tier) return { taxUsd: 0, gratuityUsd: 0, totalUsd: 0 };
    return computeFleetTotals(tier.baseUsd, gratuityPct);
  }, [tier, gratuityPct]);

  const fromUsd = ratesPending
    ? null
    : (tier?.baseUsd ?? y.listingPriceUsd);

  useLayoutEffect(() => {
    if (!hasPhotos) return;
    const strip = thumbStripRef.current;
    const thumb = thumbRefs.current[photoIndex];
    if (!strip || !thumb) return;
    const targetLeft = thumb.offsetLeft - (strip.clientWidth - thumb.clientWidth) / 2;
    strip.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
  }, [photoIndex, hasPhotos]);

  const goPhotoPrev = useCallback(() => {
    if (!hasPhotos) return;
    setPhotoIndex((i) => (i <= 0 ? galleryLen - 1 : i - 1));
  }, [galleryLen, hasPhotos]);

  const goPhotoNext = useCallback(() => {
    if (!hasPhotos) return;
    setPhotoIndex((i) => (i >= galleryLen - 1 ? 0 : i + 1));
  }, [galleryLen, hasPhotos]);

  useEffect(() => {
    if (!hasPhotos) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPhotoPrev();
      if (e.key === "ArrowRight") goPhotoNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPhotoPrev, goPhotoNext, hasPhotos]);

  const uid = `fleet-${y.id}`;
  const departure = y.location ?? "—";

  return (
    <>
      <SectionReveal className="relative overflow-hidden border-b border-gold/10 bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(198,164,108,0.06),transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 sm:pb-12 sm:pt-20 lg:px-10">
          <YachtChartersBackLink className="inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-gold/85 transition-colors hover:text-gold-secondary" />
          <div className="mt-8 h-px w-14 bg-gold/30" aria-hidden />
          <p className="mt-6 text-[0.65rem] font-medium uppercase tracking-[0.48em] text-gold/90">
            {t("yachtsPage.product.fleetEyebrow", { name: y.name })}
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-[2.1rem] leading-[1.12] tracking-tight text-cream sm:text-4xl md:text-[2.65rem]">
            {y.name}
          </h1>
          <p className="mt-4 font-serif text-2xl tabular-nums text-gold-secondary sm:text-[1.75rem]">
            {fromUsd !== null ? (
              t("yachtsPage.product.fromPrice", { amount: formatUsd(fromUsd) })
            ) : (
              t("yachtsPage.product.ratesComingSoon")
            )}
          </p>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-cream/58 sm:text-[0.9375rem]">
            {t("yachtsPage.product.heroBody")}
          </p>
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal className="overflow-x-clip border-b border-gold/10 bg-charcoal pb-16 pt-10 sm:pb-20 sm:pt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
            <div className="min-w-0">
              {hasPhotos ? (
                <>
                  <div className="relative aspect-[16/10] overflow-hidden border border-gold/12 bg-[#0b0b0b]">
                    <Image
                      src={paths[photoIndex]!}
                      alt={t("yachtsPage.photoOf", {
                        name: y.name,
                        current: photoIndex + 1,
                        total: galleryLen,
                      })}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority={photoIndex === 0}
                    />
                    <span className="pointer-events-none absolute right-3 top-3 z-[1] border border-gold/25 bg-[#0b0b0b]/75 px-2.5 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-cream/85 backdrop-blur-sm">
                      {t("yachtsPage.product.photoCounter", {
                        current: photoIndex + 1,
                        total: galleryLen,
                      })}
                    </span>
                    {galleryLen > 1 ? (
                      <>
                        <button
                          type="button"
                          onClick={goPhotoPrev}
                          className="absolute left-2 top-1/2 z-[1] flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-gold/20 bg-[#0b0b0b]/80 text-cream/90 backdrop-blur-sm transition-colors hover:border-gold/40"
                          aria-label={t("yachtsPage.product.previousPhoto")}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={goPhotoNext}
                          className="absolute right-2 top-1/2 z-[1] flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-gold/20 bg-[#0b0b0b]/80 text-cream/90 backdrop-blur-sm transition-colors hover:border-gold/40"
                          aria-label={t("yachtsPage.product.nextPhoto")}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </>
                    ) : null}
                  </div>

                  {galleryLen > 1 ? (
                    <div
                      ref={thumbStripRef}
                      className="flex gap-2 overflow-x-auto border-t border-gold/10 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                      {paths.map((src, i) => (
                        <button
                          key={src}
                          ref={(node) => {
                            thumbRefs.current[i] = node;
                          }}
                          type="button"
                          onClick={() => setPhotoIndex(i)}
                          className={cn(
                            "relative h-14 w-24 shrink-0 overflow-hidden border transition-colors sm:h-16 sm:w-28",
                            i === photoIndex
                              ? "border-gold/45"
                              : "border-gold/12 hover:border-gold/25",
                          )}
                          aria-label={t("yachtsPage.product.showPhoto", {
                            n: i + 1,
                          })}
                          aria-current={i === photoIndex}
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
                </>
              ) : (
                <PhotoPlaceholder
                  className="overflow-hidden"
                  photosComingSoon={t("yachtsPage.product.photosComingSoon")}
                />
              )}
            </div>

            <div className="min-w-0">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.38em] text-gold/90">
                {t("yachtsPage.product.charterPricing")}
              </p>
              <p className="mt-3 text-[0.8125rem] leading-relaxed text-cream/52">
                {ratesPending ? (
                  t("yachtsPage.product.ratesPendingBody")
                ) : (
                  <>
                    {t("yachtsPage.product.ratesBodyBefore")}{" "}
                    <strong className="font-medium text-cream/70">
                      {t("yachtsPage.product.ratesBodyTax")}
                    </strong>{" "}
                    {t("yachtsPage.product.ratesBodyAfter")}
                  </>
                )}
              </p>

              {!ratesPending && durations.length > 0 && tier ? (
                <>
                  <div className="mt-8">
                    <p
                      className="text-[0.58rem] font-medium uppercase tracking-[0.26em] text-cream/40"
                      id={`${uid}-duration-label`}
                    >
                      {t("yachtsPage.product.duration")}
                    </p>
                    <div
                      className="mt-2.5 flex flex-wrap gap-2"
                      role="group"
                      aria-labelledby={`${uid}-duration-label`}
                    >
                      {durations.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setDurationId(d.id)}
                          className={cn(
                            pillClass,
                            safeDurationId === d.id
                              ? "border-gold/45 bg-gold/[0.08] text-gold-secondary"
                              : "border-gold/12 text-cream/60 hover:border-gold/28 hover:text-cream/85",
                          )}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8">
                    <p
                      className="text-[0.58rem] font-medium uppercase tracking-[0.26em] text-cream/40"
                      id={`${uid}-gratuity-label`}
                    >
                      {t("yachtsPage.product.crewGratuity")}
                    </p>
                    <div
                      className="mt-2.5 flex flex-wrap gap-2"
                      role="group"
                      aria-labelledby={`${uid}-gratuity-label`}
                    >
                      {FLEET_GRATUITY_PCTS.map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setGratuityPct(pct)}
                          className={cn(
                            pillClass,
                            gratuityPct === pct
                              ? "border-gold/45 bg-gold/[0.08] text-gold-secondary"
                              : "border-gold/12 text-cream/60 hover:border-gold/28 hover:text-cream/85",
                          )}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-10 border border-gold/[0.12] bg-[#0a0a0a] p-5 sm:p-6">
                    <p className="text-[0.58rem] font-medium uppercase tracking-[0.28em] text-gold/75">
                      {t("yachtsPage.product.estimateFor", {
                        duration: tier.label,
                      })}
                    </p>
                    <ul className="mt-5 space-y-4" role="list">
                      <li className="flex flex-wrap items-baseline justify-between gap-2 border-b border-gold/[0.07] pb-4">
                        <span className="text-[0.8125rem] text-cream/65">
                          {t("yachtsPage.product.lineCharter")}
                        </span>
                        <span className="font-serif text-lg tabular-nums text-cream/90">
                          {formatUsd(tier.baseUsd)}
                        </span>
                      </li>
                      <li className="flex flex-wrap items-baseline justify-between gap-2 border-b border-gold/[0.07] pb-4">
                        <span className="text-[0.8125rem] text-cream/65">
                          {t("yachtsPage.product.lineTax")}
                        </span>
                        <span className="font-serif text-lg tabular-nums text-cream/90">
                          {formatUsd(taxUsd)}
                        </span>
                      </li>
                      <li className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="text-[0.8125rem] text-cream/65">
                          {t("yachtsPage.product.lineGratuity", {
                            pct: gratuityPct,
                          })}
                        </span>
                        <span className="font-serif text-lg tabular-nums text-cream/90">
                          {formatUsd(gratuityUsd)}
                        </span>
                      </li>
                    </ul>
                    <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3 border-t border-gold/15 pt-5">
                      <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-gold/90">
                        {t("yachtsPage.product.estimatedTotal")}
                      </span>
                      <span className="font-serif text-2xl tabular-nums text-gold-secondary sm:text-[1.75rem]">
                        {formatUsd(totalUsd)}
                      </span>
                    </div>
                  </div>
                </>
              ) : null}

              {ratesPending ? (
                <p className="mt-8 border border-gold/[0.12] bg-[#0a0a0a] p-5 text-[0.8125rem] leading-relaxed text-cream/55 sm:p-6">
                  {t("yachtsPage.product.ratesPendingCta")}
                </p>
              ) : null}

              <p className="mt-4 text-[0.7rem] leading-relaxed text-cream/38">
                {t("yachtsPage.product.estimateFootnote")}
              </p>
              <div className="mt-6">
                <YachtBookingButton yacht={y} layout="inline" />
              </div>
            </div>
          </div>

          <YachtListingAbout
            tagline={
              y.aboutTagline ??
              t("yachtsPage.product.defaultTagline", { name: y.name })
            }
            quote={y.aboutQuote}
            paragraphs={buildAboutParagraphs(y)}
            departure={departure}
          />
          <YachtListingSpecsAndIncluded
            specRows={[
              {
                k: t("yachtsPage.listing.overallLength"),
                v: `${y.lengthFt}′`,
              },
              {
                k: t("yachtsPage.listing.guestCapacity"),
                v: y.capacityGuests
                  ? t("yachtsPage.listing.guestCapacityValue", {
                      count: y.capacityGuests,
                    })
                  : "—",
              },
              ...(typeof y.staterooms === "number"
                ? ([
                    {
                      k: t("yachtsPage.listing.staterooms"),
                      v: String(y.staterooms),
                    },
                  ] as const)
                : []),
              ...(typeof y.bathrooms === "number"
                ? ([
                    {
                      k: t("yachtsPage.listing.bathrooms"),
                      v: String(y.bathrooms),
                    },
                  ] as const)
                : []),
              {
                k: t("yachtsPage.listing.departureSpec"),
                v: departure,
              },
            ]}
            included={[...defaultIncluded(y, t)]}
          />
        </div>
      </SectionReveal>

      <YachtProductAddons />
    </>
  );
}
