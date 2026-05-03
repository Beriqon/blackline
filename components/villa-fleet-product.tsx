"use client";

import { Building2, ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { ChauffeurServiceCrosslink } from "@/components/chauffeur-service-crosslink";
import { SectionReveal } from "@/components/section-reveal";
import { VillaStaysBackLink } from "@/components/villa-stays-back-link";
import type { Villa } from "@/lib/villas-data";
import { cn } from "@/lib/utils";
import { whatsAppUrlWithText } from "@/lib/whatsapp";

const btnPrimary =
  "inline-flex min-h-11 items-center justify-center border border-gold/40 bg-gold px-8 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#0b0b0b] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold-secondary hover:bg-gold-secondary hover:shadow-[0_0_0_1px_rgba(224,195,138,0.4),0_14px_48px_rgba(198,164,108,0.2)] active:translate-y-0";

function mapLocationLabel(villa: Villa): string {
  return `${villa.neighborhood}, Miami, FL`;
}

function mapEmbedSrc(villa: Villa): string {
  const query = encodeURIComponent(mapLocationLabel(villa));
  return `https://www.google.com/maps?q=${query}&output=embed`;
}

function PhotoPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex min-h-[12rem] flex-col items-center justify-center gap-3 border border-gold/12 bg-[#141414] px-6 py-12 text-center sm:min-h-0 sm:aspect-[16/10]",
        className,
      )}
    >
      <Building2 className="h-10 w-10 text-gold/22 sm:h-12 sm:w-12" aria-hidden />
      <span className="max-w-xs text-[0.65rem] font-medium uppercase tracking-[0.2em] text-cream/35">
        Photos coming soon
      </span>
    </div>
  );
}

export function VillaFleetProduct({ villa }: { villa: Villa }) {
  const photos = villa.galleryImages;
  const hasPhotos = photos.length > 0;
  const galleryLen = photos.length;
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const thumbStripRef = useRef<HTMLDivElement | null>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
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

  useEffect(() => {
    // Always open a villa listing at the top (title/intro visible).
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [villa.id]);

  return (
    <>
      <SectionReveal className="relative overflow-hidden border-b border-gold/10 bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(198,164,108,0.06),transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 sm:pb-12 sm:pt-20 lg:px-10">
          <VillaStaysBackLink
            villaId={villa.id}
            className="inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-gold/85 transition-colors hover:text-gold-secondary"
          />
          <div className="mt-8 h-px w-14 bg-gold/30" aria-hidden />
          <p className="mt-6 text-[0.65rem] font-medium uppercase tracking-[0.48em] text-gold/90">
            Residences · {villa.name}
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-[2.1rem] leading-[1.12] tracking-tight text-cream sm:text-4xl md:text-[2.65rem]">
            {villa.name}
          </h1>
          <p className="mt-4 font-serif text-2xl tabular-nums text-gold-secondary sm:text-[1.75rem]">
            {villa.cardTagline}
          </p>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-cream/58 sm:text-[0.9375rem]">
            {villa.lede}
          </p>
          <ChauffeurServiceCrosslink variant="villa" />
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal className="overflow-x-clip border-b border-gold/10 bg-charcoal pb-16 pt-10 sm:pb-20 sm:pt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div id="photos" className="scroll-mt-24" aria-hidden />
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
            <div className="min-w-0">
              {hasPhotos ? (
                <>
                  <div className="relative aspect-[4/3] overflow-hidden border border-gold/12 bg-[#0b0b0b] sm:aspect-[16/10]">
                    <Image
                      src={photos[photoIndex]!}
                      alt={`${villa.name} — photo ${photoIndex + 1} of ${galleryLen}`}
                      fill
                      className="object-contain sm:object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority={photoIndex === 0}
                    />
                    <span className="pointer-events-none absolute right-3 top-3 z-[1] border border-gold/25 bg-[#0b0b0b]/75 px-2.5 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-cream/85 backdrop-blur-sm">
                      {photoIndex + 1} / {galleryLen}
                    </span>
                    <button
                      type="button"
                      onClick={() => setLightboxOpen(true)}
                      className="absolute bottom-3 right-3 z-[2] inline-flex items-center gap-1.5 border border-gold/25 bg-[#0b0b0b]/75 px-2.5 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-cream/85 backdrop-blur-sm transition-colors hover:border-gold/45"
                      aria-label="Enlarge photo"
                    >
                      <Maximize2 className="h-3.5 w-3.5" aria-hidden />
                      Enlarge
                    </button>
                    {galleryLen > 1 ? (
                      <>
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
                          aria-label={`Show photo ${i + 1}`}
                          aria-current={i === photoIndex}
                        >
                          <Image src={src} alt="" fill className="object-cover" sizes="112px" />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : (
                <PhotoPlaceholder className="overflow-hidden" />
              )}

              <div className="mt-8 border-t border-gold/10 pt-6">
                <p className="text-[0.62rem] font-medium uppercase tracking-[0.32em] text-gold/70">
                  Description
                </p>
                <p className="mt-4 text-[0.9375rem] leading-relaxed text-cream/68">
                  {villa.description}
                </p>
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.38em] text-gold/90">
                Stay details
              </p>
              <ul className="mt-4 space-y-0" role="list">
                {villa.facts.map((fact) => (
                  <li
                    key={`${fact.label}-${fact.value}`}
                    className="border-t border-gold/[0.09] py-3.5 first:border-t-0 first:pt-0 first:pb-3.5"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-[0.75rem] font-medium uppercase tracking-[0.14em] text-cream/45">
                        {fact.label}
                      </span>
                      <span className="max-w-[min(100%,14rem)] text-right text-[0.9375rem] leading-snug text-cream/88">
                        {fact.value}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              {villa.vipNote ? (
                <div className="mt-8 border border-gold/12 bg-[#0d0d0d]/90 p-4 sm:p-5">
                  <p className="text-[0.62rem] font-medium uppercase tracking-[0.28em] text-gold/75">
                    Arrival &amp; transport
                  </p>
                  <p className="mt-3 text-[0.875rem] leading-relaxed text-cream/62">
                    {villa.vipNote}
                  </p>
                </div>
              ) : null}

              <p className="mt-8 text-[0.62rem] font-medium uppercase tracking-[0.32em] text-gold/70">
                Highlights
              </p>
              <ul className="mt-4 space-y-3" role="list">
                {villa.highlights.map((h) => (
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
                    Amenities
                  </p>
                  <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2" role="list">
                    {villa.inclusions!.map((line) => (
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
                  {villa.policyNotes!.map((note) => (
                    <p
                      key={note}
                      className="text-[0.7rem] leading-relaxed text-cream/38 [&+&]:mt-3"
                    >
                      {note}
                    </p>
                  ))}
                </div>
              ) : null}

              <div className="mt-10 border-t border-gold/10 pt-8">
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
                      "Hi Blackline - I'd like a quote for this stay:",
                      villa.name,
                      `Location: ${mapLocationLabel(villa)}`,
                      "",
                      "Please confirm availability, rates, and next steps. Thanks!",
                    ].join("\n");

                    const href = whatsAppUrlWithText(message);

                    try {
                      await fetch("/api/quote-requests/create", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          source: "whatsapp",
                          message,
                          summary: `Stay: ${villa.name}`,
                        }),
                      });
                    } catch {
                      setQuoteRequestError(
                        "Could not create quote request record. Opening WhatsApp anyway.",
                      );
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
                    ? "Requesting quote..."
                    : "Request this stay"}
                </button>
                <p className="mt-4 text-[0.7rem] leading-relaxed text-cream/38">
                  Availability, rates, and house rules are confirmed when you inquire.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      <SectionReveal className="border-b border-gold/10 bg-[#070707] pb-14 pt-12 sm:pb-16 sm:pt-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <p className="text-[0.62rem] font-medium uppercase tracking-[0.32em] text-gold/70">
            Neighborhood
          </p>
          <h2 className="mt-4 font-serif text-[1.4rem] leading-snug tracking-tight text-cream sm:text-[1.7rem]">
            {mapLocationLabel(villa)}
          </h2>
          <p className="mt-3 max-w-2xl text-[0.88rem] leading-relaxed text-cream/55">
            View the area around this residence. Exact address is shared after booking
            confirmation.
          </p>
        </div>
        <div className="mt-8 w-full border-y border-gold/10">
          <div className="relative h-[20rem] w-full sm:h-[27rem]">
            <iframe
              title={`${villa.name} neighborhood map`}
              src={mapEmbedSrc(villa)}
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </SectionReveal>

      {lightboxOpen && hasPhotos ? (
        <div
          className="fixed inset-0 z-[70] flex flex-col bg-[#050505]/95 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={`${villa.name} photo gallery`}
        >
          <div className="flex items-center justify-between border-b border-gold/12 px-4 py-3 sm:px-6">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-cream/55">
              {villa.name} · {photoIndex + 1} / {galleryLen}
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
            <div className="relative h-[min(78vh,820px)] w-full max-w-5xl">
              <Image
                src={photos[photoIndex]!}
                alt={`${villa.name} — enlarged ${photoIndex + 1} of ${galleryLen}`}
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
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={goPhotoNext}
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
    </>
  );
}
