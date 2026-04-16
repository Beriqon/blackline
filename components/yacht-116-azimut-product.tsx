"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  YachtListingAbout,
  YachtListingSpecsAndIncluded,
} from "@/components/yacht-listing-narrative";
import { YachtChartersBackLink } from "@/components/yacht-charters-back-link";
import { SectionReveal } from "@/components/section-reveal";
import { YachtBookingButton } from "@/components/yacht-booking-button";
import { YachtProductAddons } from "@/components/yacht-product-addons";
import { AZIMUT_116_LISTING_CONTENT } from "@/lib/yacht-listing-narrative-content";
import { AZIMUT_116_GALLERY_PATHS } from "@/lib/azimut-116-gallery";
import {
  AZIMUT_116_DURATIONS,
  AZIMUT_116_GRATUITY_PCTS,
  computeAzimut116Totals,
  formatUsd,
  type Azimut116GratuityPct,
} from "@/lib/azimut-116-pricing";
import { cn } from "@/lib/utils";

const btnPrimary =
  "inline-flex min-h-11 items-center justify-center border border-gold/40 bg-gold px-8 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#0b0b0b] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold-secondary hover:bg-gold-secondary hover:shadow-[0_0_0_1px_rgba(224,195,138,0.4),0_14px_48px_rgba(198,164,108,0.2)] active:translate-y-0";

const pillClass =
  "min-h-10 rounded-sm border px-3.5 py-2 text-center text-[0.7rem] font-semibold uppercase tracking-[0.14em] transition-colors sm:min-h-9 sm:px-4 sm:text-[0.72rem]";

export function Yacht116AzimutProduct() {
  const galleryLen = AZIMUT_116_GALLERY_PATHS.length;
  const [photoIndex, setPhotoIndex] = useState(0);
  const thumbStripRef = useRef<HTMLDivElement | null>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useLayoutEffect(() => {
    const strip = thumbStripRef.current;
    const thumb = thumbRefs.current[photoIndex];
    if (!strip || !thumb) return;
    const targetLeft = thumb.offsetLeft - (strip.clientWidth - thumb.clientWidth) / 2;
    strip.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
  }, [photoIndex]);

  const goPhotoPrev = useCallback(() => {
    setPhotoIndex((i) => (i <= 0 ? galleryLen - 1 : i - 1));
  }, [galleryLen]);

  const goPhotoNext = useCallback(() => {
    setPhotoIndex((i) => (i >= galleryLen - 1 ? 0 : i + 1));
  }, [galleryLen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPhotoPrev();
      if (e.key === "ArrowRight") goPhotoNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPhotoPrev, goPhotoNext]);

  const [durationId, setDurationId] =
    useState<(typeof AZIMUT_116_DURATIONS)[number]["id"]>("4h");
  const [gratuityPct, setGratuityPct] = useState<Azimut116GratuityPct>(18);

  const tier = useMemo(
    () => AZIMUT_116_DURATIONS.find((d) => d.id === durationId)!,
    [durationId],
  );

  const { taxUsd, gratuityUsd, totalUsd } = useMemo(
    () => computeAzimut116Totals(tier.baseUsd, gratuityPct),
    [tier.baseUsd, gratuityPct],
  );

  return (
    <>
      <SectionReveal className="relative overflow-hidden border-b border-gold/10 bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(198,164,108,0.06),transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 sm:pb-12 sm:pt-20 lg:px-10">
          <YachtChartersBackLink className="inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-gold/85 transition-colors hover:text-gold-secondary" />
          <div className="mt-8 h-px w-14 bg-gold/30" aria-hidden />
          <p className="mt-6 text-[0.65rem] font-medium uppercase tracking-[0.48em] text-gold/90">
            Fleet · 116 Azimut
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-[2.1rem] leading-[1.12] tracking-tight text-cream sm:text-4xl md:text-[2.65rem]">
            116 Azimut
          </h1>
          <p className="mt-4 font-serif text-2xl tabular-nums text-gold-secondary sm:text-[1.75rem]">
            from {formatUsd(10_500)}
          </p>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-cream/58 sm:text-[0.9375rem]">
            Miami motor yacht charter — choose your duration and preferred crew
            gratuity to see charter, 7% tax, and all-in totals.
          </p>
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal className="overflow-x-clip border-b border-gold/10 bg-charcoal pb-16 pt-10 sm:pb-20 sm:pt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
            <div className="min-w-0 lg:sticky lg:top-28">
              <div className="relative aspect-[16/10] overflow-hidden border border-gold/12 bg-[#0b0b0b]">
                <Image
                  src={AZIMUT_116_GALLERY_PATHS[photoIndex]}
                  alt={`116 Azimut — photo ${photoIndex + 1} of ${galleryLen}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={photoIndex === 0}
                />
                <span className="pointer-events-none absolute right-3 top-3 z-[1] border border-gold/25 bg-[#0b0b0b]/75 px-2.5 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-cream/85 backdrop-blur-sm">
                  {photoIndex + 1} / {galleryLen}
                </span>
                <button
                  type="button"
                  onClick={goPhotoPrev}
                  className="absolute left-2 top-1/2 z-[1] flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-gold/20 bg-[#0b0b0b]/80 text-cream/90 backdrop-blur-sm transition-colors hover:border-gold/40"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={goPhotoNext}
                  className="absolute right-2 top-1/2 z-[1] flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-gold/20 bg-[#0b0b0b]/80 text-cream/90 backdrop-blur-sm transition-colors hover:border-gold/40"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <div
                ref={thumbStripRef}
                className="flex gap-2 overflow-x-auto border-t border-gold/10 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {AZIMUT_116_GALLERY_PATHS.map((src, i) => (
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
                    aria-label={`Show photo ${i + 1}`}
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
            </div>

            <div className="min-w-0">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.38em] text-gold/90">
                Charter & pricing
              </p>
              <p className="mt-3 text-[0.8125rem] leading-relaxed text-cream/52">
                Charter rates are before tax. Tax is <strong className="font-medium text-cream/70">7%</strong> of the charter. Crew gratuity is a percentage of the charter — choose what fits your group.
              </p>

              <div className="mt-8">
                <p
                  className="text-[0.58rem] font-medium uppercase tracking-[0.26em] text-cream/40"
                  id="azimut-116-duration-label"
                >
                  Duration
                </p>
                <div
                  className="mt-2.5 flex flex-wrap gap-2"
                  role="group"
                  aria-labelledby="azimut-116-duration-label"
                >
                  {AZIMUT_116_DURATIONS.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDurationId(d.id)}
                      className={cn(
                        pillClass,
                        durationId === d.id
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
                  id="azimut-116-gratuity-label"
                >
                  Crew gratuity
                </p>
                <div
                  className="mt-2.5 flex flex-wrap gap-2"
                  role="group"
                  aria-labelledby="azimut-116-gratuity-label"
                >
                  {AZIMUT_116_GRATUITY_PCTS.map((pct) => (
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
                  Estimate for {tier.label}
                </p>
                <ul className="mt-5 space-y-4" role="list">
                  <li className="flex flex-wrap items-baseline justify-between gap-2 border-b border-gold/[0.07] pb-4">
                    <span className="text-[0.8125rem] text-cream/65">Charter</span>
                    <span className="font-serif text-lg tabular-nums text-cream/90">
                      {formatUsd(tier.baseUsd)}
                    </span>
                  </li>
                  <li className="flex flex-wrap items-baseline justify-between gap-2 border-b border-gold/[0.07] pb-4">
                    <span className="text-[0.8125rem] text-cream/65">
                      Tax (7%)
                    </span>
                    <span className="font-serif text-lg tabular-nums text-cream/90">
                      {formatUsd(taxUsd)}
                    </span>
                  </li>
                  <li className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-[0.8125rem] text-cream/65">
                      Gratuity ({gratuityPct}% of charter)
                    </span>
                    <span className="font-serif text-lg tabular-nums text-cream/90">
                      {formatUsd(gratuityUsd)}
                    </span>
                  </li>
                </ul>
                <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3 border-t border-gold/15 pt-5">
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-gold/90">
                    Estimated total
                  </span>
                  <span className="font-serif text-2xl tabular-nums text-gold-secondary sm:text-[1.75rem]">
                    {formatUsd(totalUsd)}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-[0.7rem] leading-relaxed text-cream/38">
                Indicative estimate — final taxes, crew gratuity handling, and dock
                details are confirmed in your written proposal.
              </p>
              <div className="mt-6">
                <YachtBookingButton
                  yachtId="116-azimut"
                  defaultDurationLabel={tier.label}
                  defaultGratuityPct={gratuityPct}
                  layout="inline"
                />
              </div>
            </div>
          </div>

          <YachtListingAbout {...AZIMUT_116_LISTING_CONTENT.about} />
          <YachtListingSpecsAndIncluded
            specRows={[
              { k: "Overall length", v: "116′ feet" },
              { k: "Capacity", v: "13 cruising" },
              { k: "Staterooms", v: "5" },
              { k: "Bathrooms", v: "6" },
            ]}
            {...AZIMUT_116_LISTING_CONTENT.included}
          />
        </div>
      </SectionReveal>

      <YachtProductAddons />
    </>
  );
}
