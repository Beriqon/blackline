"use client";
import { ExternalMapConsent } from "@/components/cookie-preferences";

import { ArrowUpRight, MapPin, Building2, ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ChauffeurServiceCrosslink } from "@/components/chauffeur-service-crosslink";
import { useLocale } from "@/components/locale-provider";
import { SectionReveal } from "@/components/section-reveal";
import { VillaStaysBackLink } from "@/components/villa-stays-back-link";
import {
  getVillaNightlyRateFacts,
  localizeVilla,
  villaMapLocationLabel,
} from "@/lib/i18n/villas-page";
import {
  formatVillaUsd,
  type Villa,
  type VillaNightlyRates,
} from "@/lib/villas-data";
import { cn } from "@/lib/utils";
import { whatsAppUrlWithText } from "@/lib/whatsapp";
import styles from "@/app/services/villas/villas.module.css";

const btnPrimary =
  "inline-flex min-h-11 items-center justify-center border border-gold/40 bg-gold px-8 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#0b0b0b] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold-secondary hover:bg-gold-secondary hover:shadow-[0_0_0_1px_rgba(224,195,138,0.4),0_14px_48px_rgba(198,164,108,0.2)] active:translate-y-0";

function mapEmbedSrc(locationLabel: string): string {
  const query = encodeURIComponent(locationLabel);
  return `https://www.google.com/maps?q=${query}&output=embed`;
}

function VillaRatesPanel({
  rates,
  locale,
  t,
}: {
  rates: VillaNightlyRates;
  locale: ReturnType<typeof useLocale>["locale"];
  t: ReturnType<typeof useLocale>["t"];
}) {
  const rows = getVillaNightlyRateFacts(rates, locale, t);
  return (
    <div className="border border-gold/15 bg-[#0d0d0d]/90 p-4 sm:p-5">
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.38em] text-gold/90">
        {t("villasPage.nightlyRates")}
      </p>
      <ul className="mt-4 space-y-0" role="list">
        {rows.map((row) => (
          <li
            key={row.label}
            className="border-t border-gold/[0.09] py-3.5 first:border-t-0 first:pt-0 first:pb-3.5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-[0.75rem] font-medium uppercase tracking-[0.14em] text-cream/45">
                {row.label}
              </span>
              <span className="text-right font-serif text-[1.05rem] tabular-nums text-gold-secondary">
                {row.value}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[0.7rem] leading-relaxed text-cream/38">
        {t("villasPage.ratesDisclaimer")}
      </p>
    </div>
  );
}

function PhotoPlaceholder({
  className,
  t,
}: {
  className?: string;
  t: ReturnType<typeof useLocale>["t"];
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-[12rem] flex-col items-center justify-center gap-3 border border-gold/12 bg-[#141414] px-6 py-12 text-center sm:min-h-0 sm:aspect-[16/10]",
        className,
      )}
    >
      <Building2 className="h-10 w-10 text-gold/22 sm:h-12 sm:w-12" aria-hidden />
      <span className="max-w-xs text-[0.65rem] font-medium uppercase tracking-[0.2em] text-cream/35">
        {t("villasPage.photosComingSoon")}
      </span>
    </div>
  );
}

export function VillaFleetProduct({ villa: sourceVilla }: { villa: Villa }) {
  const { locale, t } = useLocale();
  const villa = useMemo(
    () => localizeVilla(sourceVilla, locale, t),
    [sourceVilla, locale, t],
  );
  const locationLabel = useMemo(
    () => villaMapLocationLabel(villa, t),
    [villa, t],
  );
  const photos = villa.galleryImages;
  const hasPhotos = photos.length > 0;
  const galleryLen = photos.length;
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const thumbStripRef = useRef<HTMLDivElement | null>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const swipe = useRef<{id:number;x:number;y:number}|null>(null);
  const [creatingQuoteRequest, setCreatingQuoteRequest] = useState(false);
  const [quoteRequestError, setQuoteRequestError] = useState<string | null>(
    null,
  );

  useLayoutEffect(() => {
    if (!hasPhotos) return;
    const strip = thumbStripRef.current;
    const thumb = thumbRefs.current[photoIndex];
    if (!strip || !thumb) return;
    // Keep thumbnail scrolling scoped to its own strip so mobile viewport
    // does not shift horizontally.
    const targetLeft = thumb.offsetLeft - (strip.clientWidth - thumb.clientWidth) / 2;
    strip.scrollTo({ left: Math.max(0, targetLeft), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
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
      if (e.key === "Escape" && lightboxOpen) {
        setLightboxOpen(false);
        return;
      }
      if (e.key === "ArrowLeft") goPhotoPrev();
      if (e.key === "ArrowRight") goPhotoNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPhotoPrev, goPhotoNext, hasPhotos, lightboxOpen]);

  const hasInclusions = villa.inclusions && villa.inclusions.length > 0;
  const hasPolicy = villa.policyNotes && villa.policyNotes.length > 0;
  const nightlyRates = villa.nightlyRates;

  useEffect(() => {
    // Always open a villa listing at the top (title/intro visible).
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [villa.id]);

  return <div className={styles.productPage}>
    <section className={styles.productHeader}><div className={styles.container}><VillaStaysBackLink villaId={villa.id} className={styles.backLink}/><div className={styles.productTitleRow}><div><p className={styles.eyebrow}><MapPin size={12} aria-hidden/>{villa.neighborhood} / BLACKLINE RESIDENCES</p><h1>{villa.name}</h1><p className={styles.productSubtitle}>{villa.subtitle}</p></div><a href="#stay-inquiry" className={styles.primaryButton}>{t("villasPage.requestStay")}<ArrowUpRight size={16} aria-hidden/></a></div></div></section>
    <div className={styles.container+" "+styles.productLayout}>
      <div className={styles.productMain}><div id="photos" className={styles.productGallery}>
              {hasPhotos ? (
                <>
                  <div className={styles.productPhoto}
 onPointerDown={e=>{if((e.target as HTMLElement).closest("button")||e.button!==0)return;swipe.current={id:e.pointerId,x:e.clientX,y:e.clientY};e.currentTarget.setPointerCapture(e.pointerId);}}
 onPointerUp={e=>{const start=swipe.current;swipe.current=null;if(!start||start.id!==e.pointerId)return;const dx=e.clientX-start.x;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(e.clientY-start.y)){if(dx<0)goPhotoNext();else goPhotoPrev();}}}
 onPointerCancel={()=>{swipe.current=null;}} onLostPointerCapture={()=>{swipe.current=null;}}>
                    <Image
                      src={photos[photoIndex]!}
                      alt={t("villasPage.photoOf", {
                        name: villa.name,
                        index: String(photoIndex + 1),
                        total: String(galleryLen),
                      })}
                      fill
                      className="object-contain pointer-events-none"
                      draggable={false}
                      sizes="(max-width: 800px) 100vw, 65vw"
                      priority={photoIndex === 0}
                    />
                    <span className="pointer-events-none absolute right-3 top-3 z-[1] border border-gold/25 bg-[#0b0b0b]/75 px-2.5 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-cream/85 backdrop-blur-sm">
                      {photoIndex + 1} / {galleryLen}
                    </span>
                    <button
                      type="button"
                      onClick={() => setLightboxOpen(true)}
                      className="absolute bottom-3 right-3 z-[2] inline-flex items-center gap-1.5 border border-gold/25 bg-[#0b0b0b]/75 px-2.5 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-cream/85 backdrop-blur-sm transition-colors hover:border-gold/45"
                      aria-label={t("villasPage.enlargePhoto")}
                    >
                      <Maximize2 className="h-3.5 w-3.5" aria-hidden />
                      {t("villasPage.enlarge")}
                    </button>
                    {galleryLen > 1 ? (
                      <>
                        <button
                          type="button"
                          onClick={goPhotoPrev}
                          className="absolute left-2 top-1/2 z-[1] flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-gold/20 bg-[#0b0b0b]/80 text-cream/90 backdrop-blur-sm transition-colors hover:border-gold/40"
                          aria-label={t("villasPage.previousPhoto")}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={goPhotoNext}
                          className="absolute right-2 top-1/2 z-[1] flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-gold/20 bg-[#0b0b0b]/80 text-cream/90 backdrop-blur-sm transition-colors hover:border-gold/40"
                          aria-label={t("villasPage.nextPhoto")}
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
                      {photos.map((src, i) => (
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
                          aria-label={t("villasPage.showPhoto", {
                            index: String(i + 1),
                          })}
                          aria-current={i === photoIndex}
                        >
                          <Image src={src} alt="" fill className="object-cover" sizes="112px" />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : (
                <PhotoPlaceholder className="overflow-hidden" t={t} />
              )}

      </div><section className={styles.descriptionSection}><p className={styles.eyebrow}>{t("villasPage.description")}</p><h2>{locale==="es"?"Tu estancia, a tu manera.":"Settle into your Miami."}</h2><p className={styles.lede}>{villa.lede}</p><p>{villa.description}</p></section>
      <section className={styles.factsSection}><h2>{t("villasPage.stayDetails")}</h2><dl>{villa.facts.map(f=><div key={f.label+f.value}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}</dl></section>
      <section className={styles.highlightSection}><h2>{t("villasPage.highlights")}</h2><ul>{villa.highlights.map(h=><li key={h}>{h}</li>)}</ul></section>
      {hasInclusions&&<section className={styles.amenitiesSection}><h2>{t("villasPage.amenities")}</h2><ul>{villa.inclusions!.map(line=><li key={line}>{line}</li>)}</ul></section>}
      {villa.vipNote&&<section className={styles.arrivalSection}><p className={styles.eyebrow}>{t("villasPage.arrivalTransport")}</p><p>{villa.vipNote}</p><ChauffeurServiceCrosslink variant="villa" className={styles.arrivalCopy}/></section>}
      {hasPolicy&&<section className={styles.policySection}>{villa.policyNotes!.map(note=><p key={note}>{note}</p>)}</section>}
      </div>
      <aside className={styles.inquiryAside} id="stay-inquiry"><p className={styles.eyebrow}>{t("villasPage.residencesName",{name:villa.name})}</p><h2 className={styles.inquiryPrice}>{nightlyRates?t("villasPage.fromPerNight",{price:formatVillaUsd(nightlyRates.weekdayUsd)}):locale==="es"?"Tu estancia privada.":"Your private stay."}</h2><p className={styles.inquiryTagline}>{villa.cardTagline}</p><div className={styles.inquiryFacts}>{sourceVilla.facts.map((f,i)=>({source:f,localized:villa.facts[i]})).filter(f=>["Bedrooms","Bathrooms","Max guests"].includes(f.source.label)).map(f=><div key={f.source.label}><strong>{f.localized.value}</strong><span>{f.localized.label}</span></div>)}</div>
              <div className={styles.requestPanel}>
                {quoteRequestError ? (
                  <p className="mb-4 text-center text-[0.75rem] text-red-300/90">
                    {quoteRequestError}
                  </p>
                ) : null}
                <button
                  type="button"
                  disabled={creatingQuoteRequest}
                  onClick={async () => {
                    setQuoteRequestError(null);
                    setCreatingQuoteRequest(true);
                    const message = [
                      t("villasPage.whatsappIntro"),
                      villa.name,
                      t("villasPage.whatsappLocation", {
                        location: locationLabel,
                      }),
                      ...(nightlyRates
                        ? [
                            t("villasPage.whatsappRates", {
                              weekday: `${formatVillaUsd(nightlyRates.weekdayUsd)}/night`,
                              weekend: `${formatVillaUsd(nightlyRates.weekendUsd)}/night`,
                            }),
                          ]
                        : []),
                      "",
                      nightlyRates
                        ? t("villasPage.whatsappConfirmRates")
                        : t("villasPage.whatsappConfirmAll"),
                    ].join("\n");

                    const href = whatsAppUrlWithText(message);

                    try {
                      await fetch("/api/quote-requests/create", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          source: "whatsapp",
                          message,
                          summary: t("villasPage.quoteSummary", {
                            name: villa.name,
                          }),
                        }),
                      });
                    } catch {
                      setQuoteRequestError(t("villasPage.quoteError"));
                    } finally {
                      setCreatingQuoteRequest(false);
                      window.open(href, "_blank", "noopener,noreferrer");
                    }
                  }}
                  className={cn(
                    btnPrimary,
                    creatingQuoteRequest
                      ? "cursor-not-allowed opacity-70"
                      : undefined,
                  )}
                >
                  {creatingQuoteRequest
                    ? t("villasPage.requestingQuote")
                    : t("villasPage.requestStay")}
                </button>
                <p className="mt-4 text-[0.7rem] leading-relaxed text-cream/38">
                  {nightlyRates
                    ? t("villasPage.inquireTaxesNote")
                    : t("villasPage.inquireRatesNote")}
                </p>
              </div>
      {nightlyRates&&<VillaRatesPanel rates={nightlyRates} locale={locale} t={t}/>}<div className={styles.inquiryHelp}><MapPin size={15} aria-hidden/><span>{locationLabel}</span></div></aside>
    </div>
    <section className={styles.locationSection}><div className={styles.container}><p className={styles.eyebrow}>{t("villasPage.neighborhoodSection")}</p><h2>{locationLabel}</h2><p>{t("villasPage.mapBody")}</p><div className={styles.mapFrame}><ExternalMapConsent><iframe title={t("villasPage.mapTitle",{name:villa.name})} src={mapEmbedSrc(locationLabel)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/></ExternalMapConsent></div></div></section>
      {lightboxOpen && hasPhotos ? (
        <div
          className="fixed inset-0 z-[70] flex flex-col bg-[#050505]/95 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={t("villasPage.galleryAria", { name: villa.name })}
        >
          <div className="flex items-center justify-between border-b border-gold/12 px-4 py-3 sm:px-6">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-cream/55">
              {villa.name} · {photoIndex + 1} / {galleryLen}
            </p>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="flex h-10 w-10 items-center justify-center border border-gold/15 text-cream/80 hover:border-gold/35 hover:text-gold-secondary"
              aria-label={t("villasPage.closeEnlarged")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center p-4 sm:p-8">
            <div className="relative h-[min(78vh,820px)] w-full max-w-5xl">
              <Image
                src={photos[photoIndex]!}
                alt={t("villasPage.enlargedPhoto", {
                  name: villa.name,
                  index: String(photoIndex + 1),
                  total: String(galleryLen),
                })}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, min(896px, 100vw)"
              />
            </div>
            {galleryLen > 1 ? (
              <>
                <button
                  type="button"
                  onClick={goPhotoPrev}
                  className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-gold/25 bg-[#0b0b0b]/85 text-cream sm:left-6"
                  aria-label={t("villasPage.previousPhoto")}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={goPhotoNext}
                  className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-gold/25 bg-[#0b0b0b]/85 text-cream sm:right-6"
                  aria-label={t("villasPage.nextPhoto")}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
  </div>;
}
